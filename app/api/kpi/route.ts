import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get all orders with items
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)

    if (ordersError) {
      return NextResponse.json({ error: ordersError.message }, { status: 500 })
    }

    // Get menu items for price lookup
    const { data: menuItems } = await supabase
      .from("menu_items")
      .select("id, price")

    const priceMap = new Map(menuItems?.map(item => [item.id, item.price]) || [])

    // Calculate stats
    const totalOrders = orders?.length || 0
    const pendingOrders = orders?.filter(o => o.status === "pending").length || 0
    const acceptedOrders = orders?.filter(o => o.status === "accepted").length || 0
    const preparingOrders = orders?.filter(o => o.status === "preparing").length || 0
    const readyOrders = orders?.filter(o => o.status === "ready").length || 0
    const deliveredOrders = orders?.filter(o => o.status === "delivered").length || 0
    const cancelledOrders = orders?.filter(o => o.status === "cancelled").length || 0

    // Calculate revenue
    let totalRevenue = 0
    const itemCounts: Record<string, { name: string; count: number }> = {}
    const hourlyOrders: Record<number, number> = {}

    orders?.forEach(order => {
      if (order.status === "delivered") {
        order.order_items?.forEach((item: { item_id: string; item_name: string; quantity: number }) => {
          const price = priceMap.get(item.item_id) || 0
          totalRevenue += price * item.quantity
        })
      }
      
      // Count items
      order.order_items?.forEach((item: { item_id: string; item_name: string; quantity: number }) => {
        if (!itemCounts[item.item_id]) {
          itemCounts[item.item_id] = { name: item.item_name, count: 0 }
        }
        itemCounts[item.item_id].count += item.quantity
      })
      
      // Hourly distribution
      const hour = new Date(order.created_at).getHours()
      hourlyOrders[hour] = (hourlyOrders[hour] || 0) + 1
    })

    // Top items
    const topItems = Object.entries(itemCounts)
      .map(([id, { name, count }]) => ({ id, name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Hourly distribution (fill in missing hours)
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourlyOrders[hour] || 0,
    }))

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      acceptedOrders,
      preparingOrders,
      readyOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      averageOrderValue: deliveredOrders > 0 ? totalRevenue / deliveredOrders : 0,
      topItems,
      hourlyDistribution,
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch KPI stats" }, { status: 500 })
  }
}
