import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { Order } from "@/lib/types"
import type { DBOrder, DBOrderItem } from "@/lib/supabase"

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("id", id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  const order = data as DBOrder & { order_items: DBOrderItem[] }

  return NextResponse.json({
    order: {
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
    },
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { status, workerId, rating } = body as { 
      status?: Order["status"]
      workerId?: string
      rating?: number
    }

    const validStatuses: Order["status"][] = [
      "pending",
      "accepted",
      "preparing",
      "ready",
      "delivered",
      "cancelled",
    ]

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Build update object with timestamps
    const updateData: Record<string, unknown> = {}
    
    if (status) {
      updateData.status = status
      
      // Set timestamps based on status
      if (status === "accepted") {
        updateData.accepted_at = new Date().toISOString()
      } else if (status === "preparing") {
        updateData.preparing_at = new Date().toISOString()
      } else if (status === "delivered") {
        updateData.delivered_at = new Date().toISOString()
      }
    }
    
    if (workerId) {
      updateData.worker_id = workerId
    }
    
    if (rating !== undefined) {
      updateData.rating = rating
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, order: data })
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params

  // Delete order items first (foreign key constraint)
  await supabase.from("order_items").delete().eq("order_id", id)
  
  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
