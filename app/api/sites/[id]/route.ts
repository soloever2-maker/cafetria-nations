import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// PATCH /api/sites/[id] — update name or toggle active
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.name    !== undefined) updates.name     = body.name
    if (body.nameEn  !== undefined) updates.name_en  = body.nameEn
    if (body.isActive !== undefined) updates.is_active = body.isActive

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("sites")
      .update(updates)
      .eq("id", params.id)
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
    })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

// DELETE /api/sites/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await supabase
    .from("sites")
    .delete()
    .eq("id", params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
