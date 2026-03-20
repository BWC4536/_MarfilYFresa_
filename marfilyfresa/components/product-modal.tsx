"use client"

import { useEffect } from "react"
import { X, Heart } from "lucide-react"
import Image from "next/image"
import type { Product } from "./product-card"

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
}

export function ProductModal({ product, isOpen, onClose, isFavorite, onToggleFavorite }: ProductModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-text-main/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg animate-in zoom-in-95 fade-in duration-200">
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5 text-text-main" />
          </button>
          
          {/* Image */}
          <div className="relative aspect-square">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 512px"
            />
            
            {/* Badges */}
            {product.isNew && (
              <span className="absolute left-4 top-4 rounded-full bg-terracota px-4 py-1.5 text-sm font-medium text-white">
                Novedad
              </span>
            )}
            {product.isOnSale && !product.isNew && (
              <span className="absolute left-4 top-4 rounded-full bg-terracota px-4 py-1.5 text-sm font-medium text-white">
                Oferta
              </span>
            )}
          </div>
          
          {/* Content */}
          <div className="p-6">
            <h2 className="font-serif text-2xl text-text-main">{product.name}</h2>
            <p className="mt-2 text-xl font-medium text-terracota">{product.price.toFixed(2)} €</p>
            
            <p className="mt-4 text-sm text-text-soft leading-relaxed">
              Pieza única de nuestra colección, perfecta para añadir un toque de color y alegría a tu día a día.
            </p>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => onToggleFavorite(product.id)}
                className={`flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all hover:scale-105 ${
                  isFavorite
                    ? "bg-brown text-white"
                    : "bg-terracota/20 text-text-main hover:bg-terracota/30"
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                {isFavorite ? "En favoritos" : "Añadir a favoritos"}
              </button>
              
              <button
                onClick={() => {
                  onClose()
                  const element = document.getElementById("contacto")
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" })
                  }
                }}
                className="flex-1 rounded-full bg-terracota px-6 py-3 text-center text-sm font-medium text-white transition-all hover:bg-brown hover:scale-105"
              >
                Preguntar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
