"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function DeleteStockRequestButton({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm("¿Eliminar esta solicitud?")) return
    setLoading(true)
    await fetch(`/api/stock-request/${requestId}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-full p-2 text-text-soft hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
      title="Eliminar solicitud"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
