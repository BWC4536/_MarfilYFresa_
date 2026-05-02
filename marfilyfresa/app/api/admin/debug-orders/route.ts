import { NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase-server"

/**
 * Endpoint de debug: muestra TODOS los datos crudos de los pedidos
 * para diagnosticar por qué no aparecen en la página admin
 */
export async function GET() {
  const admin = createSupabaseAdminClient()

  try {
    // Query exactamente igual a la de la página admin
    const { data: orders, error } = await admin
      .from("orders")
      .select(
        `id, order_number, total_amount, status, created_at, user_id,
         customer_name, customer_phone, customer_address, notes,
         order_items ( id, quantity, price_at_time, products ( name, image_url ) )`
      )
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message, code: (error as any).code },
        { status: 500 }
      )
    }

    return NextResponse.json({
      count: orders?.length ?? 0,
      orders: orders?.map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        status: o.status,
        total_amount: o.total_amount,
        created_at: o.created_at,
        customer_name: o.customer_name,
        customer_phone: o.customer_phone,
        customer_address: o.customer_address,
        notes: o.notes,
        user_id: o.user_id,
        items_count: o.order_items?.length ?? 0,
        order_items: o.order_items?.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          price_at_time: item.price_at_time,
          product_name: item.products?.name ?? "null",
          product_image: item.products?.image_url ?? "null",
        })),
      })) ?? [],
    })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
