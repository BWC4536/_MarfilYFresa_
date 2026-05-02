import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { contactLimiter, orderLimiter, authLimiter, instagramLimiter, getClientIP } from "@/lib/rate-limit"

async function handler(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const clientIP = getClientIP(request)

  // Rate limit para /api/contact
  if (pathname === "/api/contact" && request.method === "POST") {
    const result = await contactLimiter.check(clientIP)
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Demasiadas solicitudes. Por favor intenta de nuevo más tarde.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": "600", // 10 minutos en segundos
          }
        }
      )
    }
  }

  // Rate limit para /api/create-order
  if (pathname === "/api/create-order" && request.method === "POST") {
    const result = await orderLimiter.check(clientIP)
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Demasiadas solicitudes. Por favor intenta de nuevo más tarde.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": "600", // 10 minutos en segundos
          }
        }
      )
    }
  }

  // Rate limit para /api/analyze-instagram
  if (pathname === "/api/analyze-instagram" && request.method === "POST") {
    const result = await instagramLimiter.check(clientIP)
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Límite de análisis de Instagram alcanzado. Intenta mañana.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": "3600", // 1 hora en segundos
          }
        }
      )
    }
  }

  // Rate limit para /api/auth/* (login, register)
  if (pathname.startsWith("/api/auth") && request.method === "POST") {
    const result = await authLimiter.check(clientIP)
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Demasiados intentos de autenticación. Intenta más tarde.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": "300", // 5 minutos en segundos
          }
        }
      )
    }
  }

  return NextResponse.next()
}

// Exportar el handler por defecto (patrón de proxy.ts en Next.js 16)
export default handler

// Configurar qué rutas usa el proxy
export const config = {
  matcher: [
    // Proteger endpoints de API
    "/api/contact",
    "/api/create-order",
    "/api/analyze-instagram",
    "/api/auth/:path*",
  ],
}
