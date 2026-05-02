# 🚦 Rate Limiting - Configuración

## Status: ✅ Implementado

El rate limiting está implementado con **Upstash Redis** en el proxy de Next.js 16.

## Configuración Requerida

### 1. Instalar Upstash Redis desde Vercel Marketplace

```
https://vercel.com/dashboard → Marketplace → Search "Upstash Redis"
```

**Pasos:**
1. Abre el Dashboard de Vercel
2. Ve a Marketplace
3. Busca "Upstash Redis"
4. Haz clic en "Continue"
5. Selecciona tu equipo/proyecto
6. Haz clic en "Create"

### 2. Copiar variables de entorno

Después de crear Upstash Redis, verás dos variables:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Vercel las añadirá automáticamente a tu `.env.production` en el dashboard.

Para desarrollo local, copia estos valores a `.env.local`:

```bash
# .env.local
UPSTASH_REDIS_REST_URL=https://xxxxx-xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx_xxxxx
```

### 3. Desplegar en Vercel

```bash
git add .
git commit -m "feat: implementar rate limiting con Upstash Redis"
git push
```

## Límites Implementados

| Endpoint | Límite | Ventana | Identificador |
|----------|--------|---------|---------------|
| `/api/contact` | 5 requests | 10 minutos | IP |
| `/api/create-order` | 10 requests | 10 minutos | IP |
| `/api/analyze-instagram` | 3 requests | 1 hora | IP |
| `/api/auth/*` | 10 requests | 5 minutos | IP |

## Respuestas

### Cuando se RESPETA el límite (200 OK)
```json
{
  "ok": true,
  "data": { ... }
}
```

### Cuando se SUPERA el límite (429 Too Many Requests)
```json
{
  "error": "Demasiadas solicitudes. Por favor intenta de nuevo más tarde."
}

Headers:
Retry-After: 600 (segundos)
```

## Pruebas en Desarrollo

### Sin Redis configurado
- El rate limiting está **disabled** (fallback seguro)
- Verás warning en logs: `Rate limiter "contact" no disponible: Upstash Redis no configurado`
- Las solicitudes se permiten sin restricción

### Con Redis configurado
- El rate limiting está **activo**
- Las solicitudes se cuentan por IP
- Al superar el límite: `429 Too Many Requests`

### Script de prueba
```bash
# Test /api/contact - debería funcionar 5 veces, fallar en la 6ª

for i in {1..7}; do
  echo "Request $i:"
  curl -X POST http://localhost:3000/api/contact \
    -H "Content-Type: application/json" \
    -H "x-forwarded-for: 192.168.1.100" \
    -d '{
      "name": "Test User",
      "email": "test@example.com",
      "message": "Test message"
    }' 2>/dev/null | head -c 100
  echo ""
  sleep 1
done
```

## Monitoreo

### Ver uso de Redis en Upstash Dashboard
1. Ve a https://console.upstash.com
2. Selecciona tu base de datos Redis
3. Ve a "Stats" para ver:
   - Requests totales
   - Conexiones activas
   - Uso de memoria

### Logs en Vercel
```bash
vercel logs <deployment-url>
```

Busca `ratelimit:` en los logs para ver qué endpoints se están limitando.

## Costos

**Upstash Redis - Tier Gratuito:**
- 10,000 requests/día incluidos
- Almacenamiento: 1 GB
- Costo: $0 hasta exceder límites

**Luego de usar el tier gratuito:**
- $0.20 por 100,000 requests
- $0.25 por GB de almacenamiento adicional

Para este proyecto (5 + 10 + 3 + 10 = 28 requests/ventana máximo) está **gratis indefinidamente**.

## Troubleshooting

### Error: `Rate limiter not available - Upstash Redis no configurado`
**Solución:** Verifica que `.env.local` tiene las variables correctas:
```bash
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN
```

### Error: `429 Too Many Requests` en desarrollo
**Solución 1:** Espera 10 minutos (o la ventana correspondiente)
**Solución 2:** Cambia la IP en tests usando header `x-forwarded-for`

### Rate limiting no funciona en producción
**Solución:** Verifica que las variables de entorno están en el Dashboard de Vercel:
```
Settings → Environment Variables → Verifica UPSTASH_REDIS_REST_*
```

## Archivos Modificados

- ✅ `/lib/rate-limit.ts` — Módulo de rate limiting
- ✅ `/proxy.ts` — Middleware intercepta requests
- ✅ `package.json` — Nuevas dependencias instaladas

## Próximas Mejoras

- [ ] Rate limiting por usuario (cuando está logueado) en lugar de solo IP
- [ ] Dashboard para monitorear intentos de spam
- [ ] Alertas cuando se detectan patrones de ataque
- [ ] Whitelist para IPs confiables (testing)
