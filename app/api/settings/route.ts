import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET /api/settings?key=hero_password
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key")
  if (!key) {
    return NextResponse.json({ error: "key is required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ value: data.value })
}

// PATCH /api/settings  — body: { key, value }
export async function PATCH(request: NextRequest) {
  const { key, value } = await request.json()

  if (!key || !value) {
    return NextResponse.json({ error: "key and value required" }, { status: 400 })
  }

  const { error } = await supabase
    .from("settings")
    .upsert({ key, value, updated_at: new Date().toISOString() })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
