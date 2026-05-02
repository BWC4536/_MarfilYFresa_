# 🔐 Seguridad - MarfilYFresa

## Auditoría de seguridad completada (2026-05-02)

### ✅ Protecciones Implementadas

#### 1. **SQL Injection** → SEGURO ✅
- **Estado:** No hay vulnerabilidades
- **Razón:** Supabase usa prepared statements por defecto
- **Detalles:**
  - Todas las queries usan `.insert()`, `.update()`, `.delete()` que parametrizan automáticamente
  - No hay SQL raw (`sql\`\``, `rpc()`) en el código
  - Los datos se pasan como objetos, nunca concatenados en strings

#### 2. **XSS (Cross-Site Scripting)** → PARCIALMENTE ARREGLADO ✅
- **Problema encontrado:** Emails con HTML no escapado
- **Solución implementada:**
  - Función `escapeHtml()` en `/lib/validation.ts`
  - Todos los datos de usuario ahora escapan antes de incluir en HTML
  - Emails escapados en `/app/api/contact/route.ts`

#### 3. **Validación de entrada** → MEJORADO ✅
- **Implementado:**
  - `/lib/validation.ts` con funciones de validación completas
  - Validaciones en `/app/api/contact/route.ts`
  - Validaciones en `/app/api/create-order/route.ts`
  - Límites de longitud en todos los campos
  - Validación de formato (email, teléfono, dirección)

#### 4. **Rate Limiting** → NO IMPLEMENTADO ⚠️
- **Estado:** Actualmente sin protección
- **Recomendación:** Implementar en Vercel Firewall o middleware
- **Prioridad:** Media

#### 5. **Autenticación** → SEGURO ✅
- **Método:** Supabase Auth con JWT
- **Detalles:**
  - Session tokens en httpOnly cookies
  - RLS (Row Level Security) en tablas de datos
  - Middleware verifica autenticación en admin

#### 6. **Variables de entorno** → SEGURO ✅
- **Práctica:** Nunca se hardcodean claves de API
- **Método:** Variables en `.env.local` (no versionadas)
- **Verificado:** No hay secrets en código

### 📋 Validaciones Implementadas

#### Formulario de Contacto (`/api/contact`)
```typescript
- Nombre: 1-100 caracteres, letras/números/acentos
- Email: Validación RFC 5322, max 255 caracteres
- Asunto: Opcional, max 200 caracteres
- Mensaje: 1-5000 caracteres, sin caracteres de control
```

#### Crear Pedido (`/api/create-order`)
```typescript
- Nombre cliente: 2-100 caracteres, formato validado
- Teléfono: 6-20 caracteres, números y símbolos permitidos
- Dirección: 5-255 caracteres, alphanumeric y direcciones
- Notas: Optional, max 1000 caracteres
```

### 🔒 Políticas de Seguridad

#### Base de datos (Supabase)
- ✅ RLS habilitado en todas las tablas
- ✅ Políticas por rol (admin vs usuario)
- ✅ Verificación de propiedad de datos (user_id)

#### API Routes
- ✅ Autenticación obligatoria en `/admin/*`
- ✅ Validación de entrada en todos los endpoints
- ✅ Manejo de errores sin exposición de detalles

#### Emails
- ✅ HTML escapado para evitar XSS
- ✅ Sanitización de datos antes de insertar
- ✅ Sin logs sensibles en errores

### 🚨 Riesgos Identificados

| Riesgo | Severidad | Estado | Solución |
|--------|-----------|--------|----------|
| XSS en emails | Media | ✅ ARREGLADO | Función escapeHtml() |
| Sin validación de entrada | Media | ✅ ARREGLADO | lib/validation.ts |
| SQL Injection | Alta | ✅ SEGURO | Supabase prepared statements |
| Rate Limiting | Media | ⚠️ PENDIENTE | Vercel Firewall o middleware |
| CSRF en formularios | Baja | ✅ SEGURO | SameSite cookies por defecto |

### 📝 Checklist de Seguridad

- [x] No hay SQL injection
- [x] XSS protegido en emails
- [x] Validación de entrada implementada
- [x] Límites de longitud en campos
- [x] No hay secrets hardcodeados
- [x] RLS configurado en BD
- [x] Autenticación verificada en admin
- [ ] Rate limiting (TODO: alta prioridad)
- [ ] HTTPS forzado (TODO: configurar en Vercel)
- [ ] HSTS headers (TODO: agregar en middleware)
- [ ] CSP headers (TODO: agregar en middleware)

### 🔄 Próximos Pasos Recomendados

1. **Rate Limiting** (ALTA PRIORIDAD)
   - Implementar con Vercel Firewall
   - Limitar: 10 requests/min por IP en `/api/contact`
   - Limitar: 5 requests/min por IP en `/api/create-order`

2. **Seguridad Headers** (MEDIA PRIORIDAD)
   - Agregar middleware para HSTS, CSP, X-Frame-Options
   - Configurar en next.config.ts o middleware

3. **Logging y Monitoreo** (MEDIA PRIORIDAD)
   - Agregar logging de intentos sospechosos
   - Alertas para patrones anormales

4. **Revisión de RLS** (BAJA PRIORIDAD)
   - Auditar todas las políticas RLS
   - Documentar restricciones por rol

### 🧪 Pruebas de Seguridad

Para probar manualmente:

```bash
# Test XSS en formulario de contacto
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(1)</script>",
    "email": "test@example.com",
    "message": "Test message"
  }'
# Esperado: Error de validación (caracteres inválidos)

# Test SQL Injection
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "'; DROP TABLE contacts; --",
    "email": "test@example.com",
    "message": "Test message"
  }'
# Esperado: Error de validación, NO se ejecuta SQL
```

---

**Última auditoría:** 2026-05-02
**Próxima revisión recomendada:** 2026-08-02 (cada 3 meses)
