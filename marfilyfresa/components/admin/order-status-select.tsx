"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const STATUSES = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
]

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  shipped: "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
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
  const router = useRouter()

  async function handleChange(newStatus: string) {
    setStatus(newStatus) // optimistic
    setLoading(true)

    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })

    if (!res.ok) {
      setStatus(currentStatus) // revert on error
    }

    // Email de envío (status shipped)
    if (res.ok && newStatus === "shipped") {
      fetch("/api/notify-shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      }).catch(() => null)
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium focus:outline-none cursor-pointer disabled:opacity-60 ${statusColors[status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  )
}
