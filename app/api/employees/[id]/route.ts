import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params

  const { data, error } = await supabase
    .from("employees")
    .select("id, name, department")
    .eq("id", id.toUpperCase().trim())
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 })
  }

  return NextResponse.json({ employee: data })
}
