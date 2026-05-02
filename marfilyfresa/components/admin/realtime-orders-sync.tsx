"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase"

export function RealtimeOrdersSync() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    // Suscribirse a cambios en tiempo real en la tabla orders
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "orders",
        },
        () => {
          // Al detectar cualquier cambio, refrescar la página
          router.refresh()
        }
      )
      .subscribe()

    // Limpiar al desmontar
    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  // Este componente no renderiza nada, solo sincroniza en background
  return null
}
