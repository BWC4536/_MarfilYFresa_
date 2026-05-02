import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase-server"
import { sendEmail } from "@/lib/mailer"
import { validateContactInput, escapeHtml, cleanString } from "@/lib/validation"

export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json()
    const { name, email, subject, message } = rawData

    // Validar entrada
    const validation = validateContactInput(rawData)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join("; ") }, { status: 400 })
    }

    // Limpiar strings de entrada
    const cleanName = cleanString(name, 100)
    const cleanEmail = cleanString(email, 255).toLowerCase()
    const cleanSubject = cleanString(subject, 200)
    const cleanMessage = cleanString(message, 5000)

    const supabase = createSupabaseAdminClient()

    // Save to contacts table
    const { error: dbError } = await supabase.from("contacts").insert({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject || null,
      message: cleanMessage,
    })

    if (dbError) {
      console.error("Error saving contact:", dbError)
      return NextResponse.json({ error: "Error al guardar el mensaje" }, { status: 500 })
    }

    // Send email notification to admin (con HTML escapado para evitar XSS)
    await sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: `Nuevo mensaje de contacto: ${escapeHtml(cleanSubject) || "Sin asunto"}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #764b36;">Nuevo mensaje de contacto</h2>
          <p><strong>De:</strong> ${escapeHtml(cleanName)} (${escapeHtml(cleanEmail)})</p>
          ${cleanSubject ? `<p><strong>Asunto:</strong> ${escapeHtml(cleanSubject)}</p>` : ""}
          <p><strong>Mensaje:</strong></p>
          <blockquote style="border-left: 3px solid #d1774c; padding-left: 16px; color: #764b36;">
            ${escapeHtml(cleanMessage).replace(/\n/g, "<br>")}
          </blockquote>
          <hr style="border-color: #efe7dd; margin: 24px 0;" />
          <p style="color: #a07860; font-size: 12px;">MarfilYFresa — Panel de administración</p>
        </div>
      `,
    })

    // Send confirmation email to user (con HTML escapado)
    await sendEmail({
      to: cleanEmail,
      subject: "Hemos recibido tu mensaje 🍓",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #764b36;">¡Gracias por escribirnos, ${escapeHtml(cleanName)}!</h2>
          <p style="color: #a07860;">Hemos recibido tu mensaje y te responderemos lo antes posible.</p>
          ${cleanSubject ? `<p><strong>Tu asunto:</strong> ${escapeHtml(cleanSubject)}</p>` : ""}
          <p style="color: #a07860; font-size: 14px;">
            Mientras tanto, puedes explorar nuestra colección en <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #d1774c;">MarfilYFresa</a>.
          </p>
          <hr style="border-color: #efe7dd; margin: 24px 0;" />
          <p style="color: #a07860; font-size: 12px;">MarfilYFresa 🍓 — Joyería colorida y divertida</p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Contact API error:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
