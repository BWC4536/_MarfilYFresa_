import { NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase-server"

/**
 * Endpoint de diagnóstico para encontrar pedidos perdidos o problemáticos
 * GET /api/admin/diagnose-orders
 *
 * Retorna:
 * - Pedidos sin items
 * - Pedidos sin número de orden
 * - Pedidos con referencias rotas (user_id que no existe)
 * - Conteo total vs esperado
 */
export async function GET() {
  const admin = createSupabaseAdminClient()

  try {
    // 1. TODOS los pedidos (sin filtro)
    const { data: allOrders, error: allError } = await admin
      .from("orders")
      .select("id, order_number, status, created_at, user_id")
      .order("created_at", { ascending: false })

    if (allError) throw allError

    // 2. Pedidos con items (con LEFT JOIN explícito)
    const { data: ordersWithItems, error: itemsError } = await admin
      .from("orders")
      .select(
        `id, order_number, status, created_at, user_id,
         order_items ( id )`
      )
      .order("created_at", { ascending: false })

    if (itemsError) throw itemsError

    // 3. Pedidos SIN items
    const ordersWithoutItems = allOrders?.filter(
      (order) =>
        !ordersWithItems?.find((o) => o.id === order.id && (o.order_items as any[])?.length > 0)
    ) ?? []

    // 4. Pedidos sin order_number
    const ordersWithoutNumber = allOrders?.filter((o) => !o.order_number) ?? []

    // 5. Intenta resolver users para detectar referencias rotas
    const userIds = new Set(allOrders?.map((o) => o.user_id).filter(Boolean) ?? [])
    const { data: profiles } = await admin
      .from("profiles")
      .select("id")
      .in("id", Array.from(userIds))

    const validUserIds = new Set(profiles?.map((p) => p.id) ?? [])
    const ordersWithBrokenUserRef = allOrders?.filter(
      (o) => o.user_id && !validUserIds.has(o.user_id)
    ) ?? []

    return NextResponse.json({
      summary: {
        totalOrders: allOrders?.length ?? 0,
        ordersWithItems: ordersWithItems?.filter((o) => (o.order_items as any[])?.length > 0).length ?? 0,
        ordersWithoutItems: ordersWithoutItems.length,
        ordersWithoutNumber: ordersWithoutNumber.length,
        ordersWithBrokenUserRef: ordersWithBrokenUserRef.length,
      },
      details: {
        ordersWithoutItems: ordersWithoutItems.map((o) => ({
          id: o.id,
          order_number: o.order_number,
          status: o.status,
          created_at: o.created_at,
          user_id: o.user_id,
        })),
        ordersWithoutNumber: ordersWithoutNumber.map((o) => ({
          id: o.id,
          status: o.status,
          created_at: o.created_at,
          user_id: o.user_id,
        })),
        ordersWithBrokenUserRef: ordersWithBrokenUserRef.map((o) => ({
          id: o.id,
          order_number: o.order_number,
          status: o.status,
          user_id: o.user_id,
        })),
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: (error as { message?: string }).message ?? String(error),
      },
      { status: 500 }
    )
  }
}
