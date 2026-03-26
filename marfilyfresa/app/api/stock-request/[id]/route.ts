import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase-server"
import { notifyOneCustomer } from "@/lib/notify-stock"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { notified } = body

  if (typeof notified !== "boolean") {
    return NextResponse.json({ error: "Campo notified inválido" }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()

  // Si se marca como notificado, enviar email al cliente antes de actualizar
  if (notified) {
    const { data: req } = await supabase
      .from("stock_requests")
      .select("customer_email, product_name, notified")
      .eq("id", id)
      .single()

    if (req && !req.notified) {
      // Solo envía si no estaba ya notificado
      notifyOneCustomer(id, req.customer_email, req.product_name).catch((e) =>
        console.error("notifyOneCustomer:", e)
      )
      // notifyOneCustomer ya marca notified=true en BD, devolvemos aquí
      return NextResponse.json({ success: true })
    }
  }

  // Para desmarcar (notified=false) o si ya estaba notificado: solo actualiza BD
  const { error } = await supabase
    .from("stock_requests")
    .update({ notified })
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
