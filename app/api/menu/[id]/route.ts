import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { is_available } = body

    const { data, error } = await supabase
      .from("menu_items")
      .update({ is_available })
      .eq("id", id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      item: {
        id: data.id,
        name: data.name,
        nameEn: data.name_en,
        price: data.price,
        categoryId: data.category,
        available: data.is_available,
      }
    })
  } catch {
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 })
  }
}
