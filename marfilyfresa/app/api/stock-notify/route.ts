import { NextRequest, NextResponse } from "next/server"
import { notifyStockEmpty, notifyAllPendingCustomers } from "@/lib/notify-stock"

export async function POST(request: NextRequest) {
  try {
    const { productId, productName, action } = await request.json()

    if (!productId || !productName || !action) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    if (action === "agotado") {
      await notifyStockEmpty(productId, productName)
      return NextResponse.json({ success: true })
    }

    if (action === "repuesto") {
      const count = await notifyAllPendingCustomers(productId, productName)
      return NextResponse.json({ success: true, notified: count })
    }

    return NextResponse.json({ error: "action debe ser 'agotado' o 'repuesto'" }, { status: 400 })
  } catch (error) {
    console.error("Error en stock-notify:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
