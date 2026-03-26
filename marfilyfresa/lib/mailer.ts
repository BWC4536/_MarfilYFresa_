import nodemailer from "nodemailer"

// ###correo Natalia — cambiar GMAIL_USER + GMAIL_APP_PASSWORD por cuenta de Natalia
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[]
  subject: string
  html: string
}) {
  return transporter.sendMail({
    from: `MarfilYFresa <${process.env.GMAIL_USER}>`, // ###correo Natalia
    to,
    subject,
    html,
  })
}
