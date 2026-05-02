import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createClient } from "@supabase/supabase-js"

/**
 * Compara qué ve el servidor (con anon key) vs admin (con service role)
 * Esto detecta si RLS está bloqueando los pedidos
 */
export async function GET() {
  try {
    // Cliente servidor (usa anon key, respeta RLS)
    const serverClient = await createSupabaseServerClient()

    // Cliente admin (usa service role, ignora RLS)
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Query con cliente servidor (respeta RLS)
    const { data: serverOrders, error: serverError } = await serverClient
      .from("orders")
      .select("id, order_number, status, created_at, customer_name")
      .order("created_at", { ascending: false })

    // Query con cliente admin (ignora RLS)
    const { data: adminOrders, error: adminError } = await adminClient
      .from("orders")
      .select("id, order_number, status, created_at, customer_name")
      .order("created_at", { ascending: false })

    const serverCount = serverOrders?.length ?? 0
    const adminCount = adminOrders?.length ?? 0
    const isRLSBlocking = adminCount > serverCount

    return NextResponse.json({
      server_client: {
        count: serverCount,
        error: serverError?.message,
        orders: serverOrders?.map((o: any) => ({
          id: o.id,
          order_number: o.order_number,
          status: o.status,
          customer_name: o.customer_name,
        })),
      },
      admin_client: {
        count: adminCount,
        error: adminError?.message,
        orders: adminOrders?.map((o: any) => ({
          id: o.id,
          order_number: o.order_number,
          status: o.status,
          customer_name: o.customer_name,
        })),
      },
      diagnosis: {
        rls_blocking: isRLSBlocking,
        hidden_orders: adminCount - serverCount,
        message: isRLSBlocking
          ? `⚠️ RLS está BLOQUEANDO ${adminCount - serverCount} pedido(s). El servidor solo ve ${serverCount} de ${adminCount} pedidos.`
          : "✅ RLS OK - El servidor ve todos los pedidos.",
      },
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
