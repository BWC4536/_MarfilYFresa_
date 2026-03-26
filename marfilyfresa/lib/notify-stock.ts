import { createSupabaseAdminClient } from "@/lib/supabase-server"
import { sendEmail } from "@/lib/mailer"

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? ""

/** Avisa al admin que un producto se ha agotado */
export async function notifyStockEmpty(productId: string, productName: string) {
  await sendEmail({
    to: process.env.ADMIN_EMAIL!,
    subject: `⚠️ Producto agotado: ${productName}`,
    html: `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#efe7dd;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#efe7dd;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#764b36;border-radius:16px 16px 0 0;padding:32px;text-align:center;">
            <h1 style="margin:0;font-size:22px;color:#efe7dd;">MarfilYFresa 🍓</h1>
            <p style="margin:8px 0 0;color:#d1774c;font-size:15px;">Stock agotado</p>
          </td>
        </tr>
        <tr>
          <td style="background:#fff;padding:32px;border-radius:0 0 16px 16px;">
            <p style="font-size:15px;color:#764b36;margin:0 0 12px;">
              El producto <strong>${productName}</strong> ha llegado a <strong style="color:#d1774c;">0 unidades</strong>.
            </p>
            <p style="font-size:12px;color:#a07860;font-family:monospace;margin:0 0 20px;">ID: ${productId}</p>
            <a href="${siteUrl()}/admin/productos?tab=agotados"
               style="display:inline-block;background:#d1774c;color:#fff;text-decoration:none;padding:12px 28px;border-radius:50px;font-size:14px;">
              Ver productos agotados
            </a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  })
}

/**
 * Envía email a un cliente concreto avisando que el producto está disponible.
 * Marca su solicitud como notificada.
 */
export async function notifyOneCustomer(requestId: string, customerEmail: string, productName: string) {
  await sendEmail({
    to: customerEmail,
    subject: `🍓 ¡Ya disponible! ${productName} — MarfilYFresa`,
    html: `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#efe7dd;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#efe7dd;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#d1774c;border-radius:16px 16px 0 0;padding:32px;text-align:center;">
            <h1 style="margin:0;font-size:22px;color:#fff;">MarfilYFresa 🍓</h1>
            <p style="margin:8px 0 0;color:#efe7dd;font-size:15px;">¡Tu producto favorito está disponible!</p>
          </td>
        </tr>
        <tr>
          <td style="background:#fff;padding:32px;border-radius:0 0 16px 16px;">
            <p style="font-size:15px;color:#764b36;margin:0 0 16px;">
              ¡Buenas noticias! El artículo que pediste que te avisáramos ya tiene stock:
            </p>
            <div style="background:#efe7dd;border-radius:12px;padding:16px 20px;margin:0 0 20px;text-align:center;">
              <p style="margin:0;font-size:18px;font-weight:bold;color:#764b36;">${productName}</p>
            </div>
            <p style="font-size:13px;color:#a07860;margin:0 0 24px;">Date prisa, las unidades pueden agotarse pronto. 🛍️</p>
            <a href="${siteUrl()}/catalogo"
               style="display:inline-block;background:#d1774c;color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:15px;font-weight:bold;">
              Ver catálogo
            </a>
            <p style="margin:24px 0 0;font-size:11px;color:#a07860;">
              Recibiste este email porque solicitaste ser avisado de la disponibilidad de este producto.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  })

  // Marcar como notificada
  const supabase = createSupabaseAdminClient()
  await supabase.from("stock_requests").update({ notified: true }).eq("id", requestId)
}

/**
 * Busca todas las solicitudes pendientes de un producto y notifica a cada cliente.
 */
export async function notifyAllPendingCustomers(productId: string, productName: string) {
  const supabase = createSupabaseAdminClient()

  const { data: requests } = await supabase
    .from("stock_requests")
    .select("id, customer_email")
    .eq("product_id", productId)
    .eq("notified", false)

  if (!requests || requests.length === 0) return 0

  await Promise.allSettled(
    requests.map((r) => notifyOneCustomer(r.id, r.customer_email, productName))
  )

  return requests.length
}
