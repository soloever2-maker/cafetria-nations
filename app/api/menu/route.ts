import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { DBMenuItem } from "@/lib/supabase"

// Categories are fixed (matching the category column values)
const categories = [
  { id: "drinks", name: "المشروبات", nameEn: "Drinks", icon: "coffee" },
  { id: "sandwiches", name: "الساندويتشات", nameEn: "Sandwiches", icon: "sandwich" },
  { id: "pastries", name: "المعجنات", nameEn: "Pastries", icon: "croissant" },
  { id: "salads", name: "السلطات", nameEn: "Salads", icon: "salad" },
  { id: "desserts", name: "الحلويات", nameEn: "Desserts", icon: "cake" },
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const categoryId = searchParams.get("category")

  let query = supabase
    .from("menu_items")
    .select("*")
    .order("name")

  if (categoryId) {
    query = query.eq("category", categoryId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform to frontend format
  const items = (data || []).map((item: DBMenuItem) => ({
    id: item.id,
    name: item.name,
    nameEn: item.name_en,
    price: item.price,
    categoryId: item.category,
    available: item.is_available,
    description: "",
  }))

  return NextResponse.json({ categories, items })
}
