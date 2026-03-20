"use client"

import { X } from "lucide-react"

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  showOnSale: boolean
  onToggleOnSale: (val: boolean) => void
  minPrice: string
  maxPrice: string
  onMinPrice: (val: string) => void
  onMaxPrice: (val: string) => void
  onReset: () => void
}

export function FilterDrawer({
  isOpen,
  onClose,
  showOnSale,
  onToggleOnSale,
  minPrice,
  maxPrice,
  onMinPrice,
  onMaxPrice,
  onReset,
}: FilterDrawerProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-xs bg-cream shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brown/10 px-6 py-4">
          <h2 className="font-serif text-lg text-text-main">Filtros</h2>
          <button onClick={onClose} className="rounded-full p-2 text-text-soft hover:bg-terracota/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

          {/* Price range */}
          <div>
            <h3 className="font-medium text-text-main mb-3">Precio</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-text-soft mb-1 block">Mínimo (€)</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => onMinPrice(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-text-main focus:border-terracota focus:outline-none"
                />
              </div>
              <span className="text-text-soft mt-5">—</span>
              <div className="flex-1">
                <label className="text-xs text-text-soft mb-1 block">Máximo (€)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => onMaxPrice(e.target.value)}
                  placeholder="999"
                  min="0"
                  className="w-full rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-text-main focus:border-terracota focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* On sale toggle */}
          <div>
            <h3 className="font-medium text-text-main mb-3">Ver solo</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => onToggleOnSale(!showOnSale)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  showOnSale ? "bg-terracota" : "bg-brown/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    showOnSale ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
              <span className="text-sm text-text-main">Solo ofertas</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-brown/10 px-6 py-4 flex gap-3">
          <button
            onClick={() => { onReset(); onClose() }}
            className="flex-1 rounded-full border border-brown/20 py-2.5 text-sm font-medium text-text-main hover:bg-terracota/5 transition-colors"
          >
            Limpiar
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-full bg-terracota py-2.5 text-sm font-medium text-white hover:bg-brown transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>
    </>
  )
}
