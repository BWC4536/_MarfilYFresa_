import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase-server"
import { sendEmail } from "@/lib/mailer"

export async function POST(request: NextRequest) {
  try {
    const { productId, productName, action } = await request.json()

    if (!productId || !productName || !action) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    if (action === "agotado") {
      // Email al admin avisando que el producto se agotó
      await sendEmail({
        to: process.env.ADMIN_EMAIL!,
        subject: `⚠️ Producto agotado: ${productName}`,
        html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
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
          <td style="background:#ffffff;padding:32px;border-radius:0 0 16px 16px;">
            <p style="font-size:15px;color:#764b36;margin:0 0 12px;">
              El siguiente producto ha llegado a <strong style="color:#d1774c;">0 unidades</strong>:
            </p>
            <div style="background:#efe7dd;border-radius:12px;padding:16px 20px;margin:0 0 20px;">
              <p style="margin:0;font-size:16px;font-weight:bold;color:#764b36;">${productName}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#a07860;font-family:monospace;">ID: ${productId}</p>
            </div>
            <p style="font-size:13px;color:#a07860;margin:0 0 20px;">
              Recuerda actualizar el stock cuando recibas nueva mercancía para notificar automáticamente
              a los clientes que solicitaron aviso.
            </p>
            <a
              href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin/productos?tab=agotados"
              style="display:inline-block;background:#d1774c;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:50px;font-size:14px;"
            >
              Ver productos agotados
            </a>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
      })

      return NextResponse.json({ success: true })
    }

    if (action === "repuesto") {
      const supabase = createSupabaseAdminClient()

      // Buscar solicitudes de aviso pendientes para este producto
      const { data: requests, error: fetchError } = await supabase
        .from("stock_requests")
        .select("id, customer_email")
        .eq("product_id", productId)
        .eq("notified", false)

      if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 })
      }

      if (!requests || requests.length === 0) {
        return NextResponse.json({ success: true, notified: 0 })
      }

      // Enviar email a cada cliente que pidió aviso
      const emailPromises = requests.map((r) =>
        sendEmail({
          to: r.customer_email,
          subject: `🍓 ¡Ya disponible! ${productName} — MarfilYFresa`,
          html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#efe7dd;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#efe7dd;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <tr>
          <td style="background:#d1774c;border-radius:16px 16px 0 0;padding:32px;text-align:center;">
            <h1 style="margin:0;font-size:22px;color:#ffffff;">MarfilYFresa 🍓</h1>
            <p style="margin:8px 0 0;color:#efe7dd;font-size:15px;">¡Tu producto favorito está disponible!</p>
          </td>
        </tr>

        <tr>
          <td style="background:#ffffff;padding:32px;border-radius:0 0 16px 16px;">
            <p style="font-size:15px;color:#764b36;margin:0 0 16px;">
              ¡Buenas noticias! El artículo que pediste que te avisáramos ya tiene stock:
            </p>
            <div style="background:#efe7dd;border-radius:12px;padding:16px 20px;margin:0 0 24px;text-align:center;">
              <p style="margin:0;font-size:18px;font-weight:bold;color:#764b36;">${productName}</p>
            </div>
            <p style="font-size:13px;color:#a07860;margin:0 0 24px;">
              Date prisa, las unidades pueden agotarse pronto. 🛍️
            </p>
            <a
              href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/catalogo"
              style="display:inline-block;background:#d1774c;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:15px;font-weight:bold;"
            >
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
</body>
</html>`,
        })
      )

      await Promise.allSettled(emailPromises)

      // Marcar todas las solicitudes como notificadas
      const ids = requests.map((r) => r.id)
      await supabase
        .from("stock_requests")
        .update({ notified: true })
        .in("id", ids)

      return NextResponse.json({ success: true, notified: requests.length })
    }

    return NextResponse.json({ error: "action debe ser 'agotado' o 'repuesto'" }, { status: 400 })
  } catch (error) {
    console.error("Error en stock-notify:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
