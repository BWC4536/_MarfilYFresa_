"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  productId: string
  isFeatured: boolean
  isOnSale: boolean
  stock: number | null
}

export function ProductQuickControls({ productId, isFeatured, isOnSale, stock }: Props) {
  const [featured, setFeatured] = useState(isFeatured)
  const [onSale, setOnSale] = useState(isOnSale)
  const [currentStock, setCurrentStock] = useState(stock ?? 0)
  const [loadingFeatured, setLoadingFeatured] = useState(false)
  const [loadingSale, setLoadingSale] = useState(false)
  const [loadingStock, setLoadingStock] = useState(false)
  const router = useRouter()

  async function toggleField(field: "is_featured" | "is_on_sale", current: boolean) {
    if (field === "is_featured") setLoadingFeatured(true)
    else setLoadingSale(true)

    await fetch("/api/admin/product-controls", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, field, value: !current }),
    })

    if (field === "is_featured") {
      setFeatured(!current)
      setLoadingFeatured(false)
    } else {
      setOnSale(!current)
      setLoadingSale(false)
    }
    router.refresh()
  }

  async function adjustStock(delta: 1 | -1) {
    if (delta === -1 && currentStock <= 0) return
    setLoadingStock(true)

    const res = await fetch("/api/admin/product-controls", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        action: delta === 1 ? "increment" : "decrement",
      }),
    })

    const data = await res.json()
    if (data.stock !== undefined) setCurrentStock(data.stock)
    setLoadingStock(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Novedad toggle */}
      <button
        onClick={() => toggleField("is_featured", featured)}
        disabled={loadingFeatured}
        title={featured ? "Quitar novedad" : "Marcar como novedad"}
        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all disabled:opacity-50 select-none ${
          featured
            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            : "bg-brown/10 text-text-soft hover:bg-brown/15"
        }`}
      >
        {loadingFeatured ? "…" : featured ? "★ Novedad" : "★ Novedad"}
      </button>

      {/* Oferta toggle */}
      <button
        onClick={() => toggleField("is_on_sale", onSale)}
        disabled={loadingSale}
        title={onSale ? "Quitar oferta" : "Marcar como oferta"}
        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all disabled:opacity-50 select-none ${
          onSale
            ? "bg-terracota/20 text-terracota hover:bg-terracota/30"
            : "bg-brown/10 text-text-soft hover:bg-brown/15"
        }`}
      >
        {loadingSale ? "…" : "% Oferta"}
      </button>

      {/* Stock +/- */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => adjustStock(-1)}
          disabled={loadingStock || currentStock <= 0}
          className="w-6 h-6 rounded-full bg-brown/10 text-brown text-base font-bold leading-none hover:bg-brown/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          −
        </button>
        <span
          className={`min-w-[1.75rem] text-center text-xs font-semibold tabular-nums ${
            currentStock === 0 ? "text-red-500" : "text-text-main"
          }`}
        >
          {loadingStock ? "…" : currentStock}
        </span>
        <button
          onClick={() => adjustStock(1)}
          disabled={loadingStock}
          className="w-6 h-6 rounded-full bg-brown/10 text-brown text-base font-bold leading-none hover:bg-brown/20 disabled:opacity-40 transition-all flex items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  )
}
