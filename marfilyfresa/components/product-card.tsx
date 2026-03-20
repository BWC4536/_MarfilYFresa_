"use client"

import { Heart } from "lucide-react"
import Image from "next/image"

export interface Product {
  id: string
  name: string
  price: number
  image: string
  isNew?: boolean
  isOnSale?: boolean
}

interface ProductCardProps {
  product: Product
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onClick: (product: Product) => void
}

export function ProductCard({ product, isFavorite, onToggleFavorite, onClick }: ProductCardProps) {
  return (
    <article className="group relative">
      <div
        className="relative aspect-square overflow-hidden rounded-2xl bg-white cursor-pointer"
        onClick={() => onClick(product)}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        
        {/* Badges */}
        {product.isNew && (
          <span className="absolute left-3 top-3 rounded-full bg-terracota px-3 py-1 text-xs font-medium text-white">
            Novedad
          </span>
        )}
        {product.isOnSale && !product.isNew && (
          <span className="absolute left-3 top-3 rounded-full bg-terracota px-3 py-1 text-xs font-medium text-white">
            Oferta
          </span>
        )}
        
        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(product.id)
          }}
          className="absolute right-3 top-3 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
          aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isFavorite ? "fill-brown text-brown" : "text-text-soft"
            }`}
          />
        </button>
      </div>
      
      <div className="mt-3 text-center">
        <h3 className="font-serif text-base text-text-main">{product.name}</h3>
        <p className="mt-1 text-sm font-medium text-terracota">{product.price.toFixed(2)} €</p>
      </div>
    </article>
  )
}
