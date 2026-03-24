"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Heart, ShoppingBag, Search } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useShop } from "@/context/shop-context"
import { createSupabaseBrowserClient } from "@/lib/supabase"

const CATEGORIES = ["Todos", "anillos", "collares", "pulseras", "pendientes", "bolsos", "sudaderas", "otros"]
const KNOWN_CATS = new Set(CATEGORIES)

interface Product {
  id: string
  name: string
  price: number
  image_url: string | null
  category: string | null
  is_featured: boolean | null
  is_on_sale: boolean | null
}

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [showOnSale, setShowOnSale] = useState(false)
  const [maxPriceFilter, setMaxPriceFilter] = useState(0)
  const [storeMaxPrice, setStoreMaxPrice] = useState(0)

  const { favorites, toggleFavorite, addToCart } = useShop()
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
    const prods = data ?? []
    setProducts(prods)
    const max = prods.length > 0 ? Math.ceil(Math.max(...prods.map((p) => Number(p.price)))) : 100
    setStoreMaxPrice(max)
    setMaxPriceFilter(max)
    setLoading(false)
  }

  async function handleToggleFavorite(productId: string, productName: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth?redirect=catalogo")
      return
    }
    toggleFavorite(productId, productName)
  }

  // Filter products
  const filtered = products.filter((p) => {
    if (activeCategory !== "Todos") {
      const cat = p.category ?? ""
      if (activeCategory === "otros") {
        // "otros" matches products with category "otros" OR any unknown category
        if (cat !== "otros" && KNOWN_CATS.has(cat)) return false
      } else {
        if (cat !== activeCategory) return false
      }
    }
    if (showOnSale && !p.is_on_sale) return false
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (Number(p.price) > maxPriceFilter) return false
    return true
  })

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-text-main">Catálogo</h1>
          <p className="text-text-soft text-sm mt-1">{filtered.length} productos</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-soft" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full rounded-full border border-brown/20 bg-white pl-11 pr-4 py-3 text-sm text-text-main placeholder:text-text-soft focus:border-terracota focus:outline-none focus:ring-1 focus:ring-terracota"
          />
        </div>

        {/* Category pills + En oferta */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-terracota text-white"
                  : "bg-white text-text-soft border border-brown/20 hover:border-terracota hover:text-text-main"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}

          {/* Separator */}
          <div className="flex-shrink-0 w-px bg-brown/20 mx-1" />

          {/* En oferta toggle */}
          <button
            onClick={() => setShowOnSale(!showOnSale)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              showOnSale
                ? "bg-terracota text-white"
                : "bg-white text-text-soft border border-brown/20 hover:border-terracota hover:text-text-main"
            }`}
          >
            En oferta
          </button>
        </div>

        {/* Price range slider */}
        {!loading && storeMaxPrice > 0 && (
          <div className="mb-8 bg-white rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-main">Precio máximo</span>
              <span className="text-sm font-medium text-terracota">{maxPriceFilter} €</span>
            </div>
            <input
              type="range"
              min={0}
              max={storeMaxPrice}
              step={1}
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
              className="w-full accent-terracota"
            />
            <div className="flex justify-between text-xs text-text-soft mt-1">
              <span>0 €</span>
              <span>{storeMaxPrice} €</span>
            </div>
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-serif text-xl text-text-main mb-2">No hay productos</p>
            <p className="text-text-soft text-sm">Prueba con otros filtros 🍓</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <article key={product.id} className="group relative">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
                  <Image
                    src={product.image_url ?? "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {product.is_featured && (
                    <span className="absolute left-3 top-3 rounded-full bg-terracota px-3 py-1 text-xs font-medium text-white">
                      Novedad
                    </span>
                  )}
                  {product.is_on_sale && !product.is_featured && (
                    <span className="absolute left-3 top-3 rounded-full bg-terracota px-3 py-1 text-xs font-medium text-white">
                      Oferta
                    </span>
                  )}

                  {/* Favorite button */}
                  <button
                    onClick={() => handleToggleFavorite(product.id, product.name)}
                    className="absolute right-3 top-3 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors ${
                        favorites.has(product.id) ? "fill-brown text-brown" : "text-text-soft"
                      }`}
                    />
                  </button>

                  {/* Add to cart overlay */}
                  <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-200 group-hover:translate-y-0">
                    <button
                      onClick={() => addToCart({
                        id: product.id,
                        name: product.name,
                        price: Number(product.price),
                        image: product.image_url ?? "/placeholder.jpg",
                        category: product.category,
                      })}
                      className="flex w-full items-center justify-center gap-2 bg-terracota py-3 text-sm font-medium text-white hover:bg-brown transition-colors"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Añadir
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <h3 className="font-serif text-base text-text-main">{product.name}</h3>
                  <p className="mt-1 text-sm font-medium text-terracota">
                    {Number(product.price).toFixed(2)} €
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
