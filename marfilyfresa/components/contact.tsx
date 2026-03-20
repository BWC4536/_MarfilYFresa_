import { MessageCircle } from "lucide-react"

export function Contact() {
  const whatsappNumber = "+34 612 345 678"
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\s/g, "").replace("+", "")}`

  return (
    <section id="contacto" className="bg-cream py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-text-main">
            ¿Tienes alguna pregunta?
          </h2>
          
          <p className="mt-4 text-text-soft">
            Estamos aquí para ayudarte. Escríbenos por WhatsApp y te responderemos lo antes posible.
          </p>
          
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-[#25D366] px-8 py-4 text-base font-medium text-white transition-all hover:bg-[#20BD5A] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-[#efe7dd]"
          >
            <MessageCircle className="h-5 w-5" />
            Escríbenos por WhatsApp
          </a>
          
          <p className="mt-4 text-sm text-text-soft">
            {whatsappNumber}
          </p>
        </div>
      </div>
    </section>
  )
}
