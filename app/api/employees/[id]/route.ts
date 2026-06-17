import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

type RouteParams = { params: Promise<{ id: string }> }

// GET — check employee exists + whether password is set
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params

  const { data, error } = await supabase
    .from("employees")
    .select("id, name, department, password")
    .eq("id", id.toUpperCase().trim())
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 })
  }

  return NextResponse.json({
    employee:    { id: data.id, name: data.name, department: data.department },
    hasPassword: data.password !== null && data.password !== "",
  })
}

// PATCH — set password OR verify password
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id }              = await params
  const { action, password } = await request.json()

  if (!action || !password) {
    return NextResponse.json({ error: "action and password required" }, { status: 400 })
  }

  // ── Set password (first time) ──────────────────────────────────────────────
  if (action === "set") {
    const { error } = await supabase
      .from("employees")
      .update({ password })
      .eq("id", id.toUpperCase().trim())

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  // ── Verify password ────────────────────────────────────────────────────────
  if (action === "verify") {
    const { data, error } = await supabase
      .from("employees")
      .select("password")
      .eq("id", id.toUpperCase().trim())
      .single()

    if (error || !data) {
      return NextResponse.json({ valid: false }, { status: 404 })
    }

    return NextResponse.json({ valid: data.password === password })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
