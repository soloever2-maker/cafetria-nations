import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { DBOrder, DBOrderItem } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get("status")
  const employeeId = searchParams.get("employeeId")

  let query = supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .order("created_at", { ascending: false })

  if (status) {
    const statuses = status.split(",")
    query = query.in("status", statuses)
  }

  if (employeeId) {
    query = query.eq("employee_id", employeeId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform to frontend format
  const orders = (data || []).map((order: DBOrder & { order_items: DBOrderItem[] }) => ({
    id: order.id,
    employeeId: order.employee_id,
    employeeName: order.employee_name,
    department: order.department,
    workerId: order.worker_id,
    status: order.status,
    notes: order.notes,
    createdAt: order.created_at,
    acceptedAt: order.accepted_at,
    preparingAt: order.preparing_at,
    deliveredAt: order.delivered_at,
    rating: order.rating,
    items: order.order_items.map((item: DBOrderItem) => ({
      id: item.item_id,
      name: item.item_name,
      quantity: item.quantity,
    })),
    total: order.order_items.reduce((sum: number, item: DBOrderItem) => sum + item.quantity, 0),
  }))

  return NextResponse.json({ orders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, employeeId, employeeName, department, notes } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 })
    }

    if (!employeeId || !employeeName) {
      return NextResponse.json({ error: "Employee info required" }, { status: 400 })
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        employee_id: employeeId,
        employee_name: employeeName,
        department: department || null,
        status: "pending",
        notes: notes || null,
      })
      .select()
      .single()

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // Create order items
    const orderItems = items.map((item: { id: string; name: string; quantity: number }) => ({
      order_id: order.id,
      item_id: item.id,
      item_name: item.name,
      quantity: item.quantity,
    }))

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
