"use client"

import Image from "next/image"
import Link from "next/link"

export function Hero() {
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      id="inicio"
      className="relative min-h-screen bg-cream flex items-center justify-center overflow-hidden"
    >
      {/* Subtle dot-grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #d1774c20 1.5px, transparent 1.5px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* Soft glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4  w-64 h-64 rounded-full bg-terracota/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-terracota/10 blur-3xl" />
      </div>

      {/* Content — fade-in + scale */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 animate-hero-enter">
        <Image
          src="/logo2.svg"
          alt="MarfilYFresa"
          width={420}
          height={158}
          priority
          className="w-70 sm:w-85 lg:w-105 h-auto mb-12"
        />

        <div className="flex flex-row items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => scrollTo("novedades")}
            className="inline-flex items-center justify-center rounded-full bg-terracota px-7 py-3.5 text-base font-medium text-white transition-all hover:bg-brown hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2 focus:ring-offset-cream"
          >
            Novedades
          </button>
          <button
            onClick={() => scrollTo("ofertas")}
            className="inline-flex items-center justify-center rounded-full bg-terracota px-7 py-3.5 text-base font-medium text-white transition-all hover:bg-brown hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2 focus:ring-offset-cream"
          >
            Ofertas
          </button>
          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center rounded-full bg-terracota px-7 py-3.5 text-base font-medium text-white transition-all hover:bg-brown hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2 focus:ring-offset-cream"
          >
            Ver catálogo
          </Link>
        </div>

        <p className="mt-8 text-sm text-text-soft">
          Joyas de Acero Inoxidable y Plata de Ley 925 · Desde 2021
        </p>
      </div>
    </section>
  )
}
