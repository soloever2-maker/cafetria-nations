import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { DBSite } from "@/lib/supabase"

// GET /api/sites — return all sites (admin gets all, default gets active only)
export async function GET(request: NextRequest) {
  const showAll = request.nextUrl.searchParams.get("all") === "1"

  let query = supabase
    .from("sites")
    .select("*")
    .order("created_at", { ascending: true })

  if (!showAll) {
    query = query.eq("is_active", true)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const sites = (data || []).map((s: DBSite) => ({
    id:       s.id,
    name:     s.name,
    nameEn:   s.name_en,
    isActive: s.is_active,
  }))

  return NextResponse.json({ sites })
}

// POST /api/sites — create new site
export async function POST(request: NextRequest) {
  try {
    const { name, nameEn } = await request.json()

    if (!name || !nameEn) {
      return NextResponse.json(
        { error: "name and nameEn are required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("sites")
      .insert({ name, name_en: nameEn, is_active: true })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      site: {
        id:       data.id,
        name:     data.name,
        nameEn:   data.name_en,
        isActive: data.is_active,
      },
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
