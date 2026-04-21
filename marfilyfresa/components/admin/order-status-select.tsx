"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

const STATUSES = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "ready", label: "Listo para recoger" },
  { value: "cancelled", label: "Cancelado" },
]

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  ready: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
}

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleChange(newStatus: string) {
    setStatus(newStatus)
    setLoading(true)

    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })

    if (!res.ok) {
      setStatus(currentStatus)
    }

    setLoading(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este pedido? Esta acción no se puede deshacer.")) return
    setDeleting(true)

    const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" })

    if (res.ok) {
      router.refresh()
    } else {
      setDeleting(false)
    }
  }

  const canDelete = status === "confirmed" || status === "ready" || status === "cancelled"

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading || deleting}
        className={`rounded-full border px-4 py-1.5 text-sm font-medium focus:outline-none cursor-pointer disabled:opacity-60 ${statusColors[status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          title="Eliminar pedido"
          className="p-1.5 rounded-full text-text-soft hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
