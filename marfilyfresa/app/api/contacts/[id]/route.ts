import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase-server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { read } = body

  if (typeof read !== "boolean") {
    return NextResponse.json({ error: "Campo read inválido" }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()
  const { error } = await admin.from("contacts").update({ read }).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = createSupabaseAdminClient()
  const { error } = await admin.from("contacts").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
