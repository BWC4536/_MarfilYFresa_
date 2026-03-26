import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase-server"
import { notifyStockEmpty, notifyAllPendingCustomers } from "@/lib/notify-stock"

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()
    const body = await request.json()
    const { productId, field, value, action } = body

    if (!productId) {
      return NextResponse.json({ error: "productId requerido" }, { status: 400 })
    }

    // ── Toggle booleano (is_featured / is_on_sale) ──────────────────────────
    if (field === "is_featured" || field === "is_on_sale") {
      if (typeof value !== "boolean") {
        return NextResponse.json({ error: "value debe ser boolean" }, { status: 400 })
      }
      const { error } = await supabase
        .from("products")
        .update({ [field]: value })
        .eq("id", productId)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    // ── Ajuste de stock ─────────────────────────────────────────────────────
    if (action === "increment" || action === "decrement") {
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("id, name, stock")
        .eq("id", productId)
        .single()

      if (fetchError || !product) {
        return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
      }

      const prevStock = product.stock ?? 0
      const newStock =
        action === "increment" ? prevStock + 1 : Math.max(0, prevStock - 1)

      if (newStock === prevStock) {
        return NextResponse.json({ success: true, stock: newStock })
      }

      const { error: updateError } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", productId)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      // Producto agotado → email al admin
      if (newStock === 0 && prevStock > 0) {
        notifyStockEmpty(product.id, product.name).catch((e) =>
          console.error("notifyStockEmpty:", e)
        )
      }

      // Producto repuesto desde 0 → email a todos los clientes pendientes
      if (prevStock === 0 && newStock > 0) {
        notifyAllPendingCustomers(product.id, product.name).catch((e) =>
          console.error("notifyAllPendingCustomers:", e)
        )
      }

      return NextResponse.json({ success: true, stock: newStock })
    }

    return NextResponse.json({ error: "Operación no válida" }, { status: 400 })
  } catch (error) {
    console.error("Error en product-controls:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
