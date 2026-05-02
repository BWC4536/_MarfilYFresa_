import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

/**
 * Verifica qué usuario está logueado y su rol
 */
export async function GET() {
  const supabase = await createSupabaseServerClient()

  try {
    // Obtener usuario actual (respeta RLS)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: "No user logged in" }, { status: 401 })
    }

    // Obtener perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    // Intentar ver pedidos - esto respeta RLS
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, order_number, status, customer_name")
      .limit(5)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      profile: profile,
      orders_visible: orders?.length ?? 0,
      all_orders: orders,
      rls_issue: {
        message:
          ordersError
            ? `RLS bloqueando: ${ordersError.message}`
            : `RLS permite ver ${orders?.length ?? 0} pedidos`,
        error: ordersError,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
