"use client"

import Link from "next/link"

export function Hero() {
  return (
    <section id="inicio" className="relative min-h-[90vh] bg-cream overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-terracota/20 blur-3xl" />
        <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-terracota/30 blur-2xl" />
        <div className="absolute bottom-32 left-1/4 w-40 h-40 rounded-full bg-terracota/15 blur-3xl" />
        <div className="absolute bottom-20 right-1/3 w-20 h-20 rounded-full bg-brown/20 blur-2xl" />

        {/* Subtle dots pattern */}
        <div className="absolute top-1/4 right-10 w-2 h-2 rounded-full bg-terracota/40" />
        <div className="absolute top-1/3 right-24 w-3 h-3 rounded-full bg-terracota/30" />
        <div className="absolute top-1/2 left-16 w-2 h-2 rounded-full bg-brown/40" />
        <div className="absolute bottom-1/4 right-16 w-2 h-2 rounded-full bg-terracota/50" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[90vh] flex-col items-center justify-center text-center">
          {/* Brand name */}
          <p className="mb-5 font-serif text-2xl sm:text-3xl text-terracota tracking-wide">
            MarfilFresa 🍓
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-text-main text-balance leading-tight">
            Joyería que te hace sonreír
          </h1>

          <p className="mt-6 max-w-xl text-lg sm:text-xl text-text-soft text-pretty">
            Piezas coloridas y únicas para el día a día
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center rounded-full bg-terracota px-8 py-4 text-base font-medium text-white transition-all hover:bg-brown hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2 focus:ring-offset-cream"
            >
              Ver colección
            </Link>
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center rounded-full border-2 border-brown/30 px-8 py-4 text-base font-medium text-text-main transition-all hover:border-terracota hover:text-terracota focus:outline-none"
            >
              Ver todo el catálogo
            </Link>
          </div>

          <p className="mt-6 text-sm text-text-soft">
            Joyas de acero inoxidable y plata · Desde 2021
          </p>
        </div>
      </div>
    </section>
  )
}
