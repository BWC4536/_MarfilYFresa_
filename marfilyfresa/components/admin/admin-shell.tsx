"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

interface AdminShellProps {
  children: React.ReactNode
  unreadContacts: number
}

export function AdminShell({ children, unreadContacts }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function closeSidebar() {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Top header ──────────────────────────────────────────────────── */}
      <header className="relative z-50 bg-brown text-cream px-4 md:px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Hamburger — solo en móvil */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5 text-cream" />
          </button>

          <span className="font-serif text-xl text-cream">MarfilYFresa</span>
          <span className="rounded-full bg-terracota px-3 py-0.5 text-xs text-white hidden sm:inline">
            Admin
          </span>
        </div>

        <Link
          href="/"
          className="text-sm text-cream/70 hover:text-cream transition-colors"
        >
          <span className="hidden sm:inline">← Ver tienda</span>
          <span className="sm:hidden text-xs">← Tienda</span>
        </Link>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Overlay oscuro — solo en móvil cuando sidebar está abierto */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar wrapper
            · Móvil: fixed drawer desde la izquierda (z-40)
            · Desktop: columna estática en el flujo normal
        */}
        <div
          className={[
            "fixed left-0 top-0 h-full z-40",
            "transition-transform duration-200 ease-in-out",
            "md:relative md:top-auto md:left-auto md:h-auto md:z-auto",
            "md:translate-x-0 md:transition-none",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <AdminSidebar
            unreadContacts={unreadContacts}
            onNavigate={closeSidebar}
          />
        </div>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto bg-cream">
          {children}
        </main>
      </div>
    </div>
  )
}
