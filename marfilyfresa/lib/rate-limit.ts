import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Crear cliente Redis (solo si las variables están disponibles)
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

/**
 * Rate limiters para distintos endpoints
 * Creados lazily para evitar errores si Redis no está configurado
 */
const limiters: Record<string, Ratelimit | null> = {}

function createLimiter(
  key: string,
  requests: number,
  windowMs: number
): Ratelimit | null {
  if (!redis) {
    console.warn(`Rate limiter "${key}" no disponible: Upstash Redis no configurado`)
    return null
  }

  if (!limiters[key]) {
    limiters[key] = new Ratelimit({
      redis,
      prefix: `ratelimit:${key}`,
      limiter: Ratelimit.slidingWindow(requests, windowMs + " ms" as any),
    })
  }

  return limiters[key]
}

/**
 * Rate limiter para /api/contact
 * 5 requests por 10 minutos por IP
 */
export const contactLimiter = {
  async check(identifier: string) {
    const limiter = createLimiter("contact", 5, 10 * 60 * 1000) // 10 minutos en ms
    if (!limiter) return { success: true } // Si Redis no está, permitir

    return await limiter.limit(identifier)
  },
}

/**
 * Rate limiter para /api/create-order
 * 10 requests por 10 minutos por IP
 */
export const orderLimiter = {
  async check(identifier: string) {
    const limiter = createLimiter("order", 10, 10 * 60 * 1000) // 10 minutos en ms
    if (!limiter) return { success: true }

    return await limiter.limit(identifier)
  },
}

/**
 * Rate limiter para /api/auth/* (login, register)
 * 10 requests por 5 minutos por IP
 */
export const authLimiter = {
  async check(identifier: string) {
    const limiter = createLimiter("auth", 10, 5 * 60 * 1000) // 5 minutos en ms
    if (!limiter) return { success: true }

    return await limiter.limit(identifier)
  },
}

/**
 * Rate limiter para análisis de Instagram
 * 3 requests por 60 minutos por IP
 */
export const instagramLimiter = {
  async check(identifier: string) {
    const limiter = createLimiter("instagram", 3, 60 * 60 * 1000) // 1 hora en ms
    if (!limiter) return { success: true }

    return await limiter.limit(identifier)
  },
}

/**
 * Obtiene la IP del cliente desde headers
 */
export function getClientIP(request: Request): string {
  // En Vercel, la IP está en x-forwarded-for
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    // Tomar la primera IP si hay múltiples
    return forwardedFor.split(",")[0].trim()
  }

  // Fallback a x-real-ip
  const realIP = request.headers.get("x-real-ip")
  if (realIP) return realIP

  // Fallback a cf-connecting-ip (Cloudflare)
  const cfIP = request.headers.get("cf-connecting-ip")
  if (cfIP) return cfIP

  // Fallback a localhost
  return "127.0.0.1"
}
