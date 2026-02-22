# Actualizaciones de Documentación Existente

**Fecha:** 17 de Enero de 2025
**Autor:** Frontend Team
**Propósito:** Actualizar documentación existente para reflejar API v2.3.0

---

## Resumen

Hay 4 archivos de documentación existentes que necesitan actualizarse para mantener consistencia con el contrato API v2.3.0:

1. [API-STATUS.md](../API-STATUS.md) - Agregar v2.3.0, endpoints, rate limiting
2. [README.md](../README.md) - Corregir variables de entorno, agregar tokens
3. [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) - Agregar sección de tokens
4. [CODEX-FIXES-REPORT.md](../CODEX-FIXES-REPORT.md) - Archivar o actualizar

---

## 1. API-STATUS.md

### Cambios Requeridos:

#### Agregar Versión y Changelog

**Línea 1 - Agregar:**
```markdown
# API Status - v2.3.0

**Última actualización:** 17 de Enero de 2025
**Changelog:** Ver [BACKEND_CHANGES_REQUIRED.md](docs/BACKEND_CHANGES_REQUIRED.md) y [API_DISCREPANCIES_v2.3.0.md](docs/API_DISCREPANCIES_v2.3.0.md)
```

#### Actualizar Tabla de Endpoints

**Agregar nuevos endpoints:**
```markdown
| Endpoint | Method | Status | Notas |
|----------|--------|--------|-------|
| `/api/v1/restaurants` | GET | ✅ Operacional | Paginación funcional |
| `/api/v1/recipes` | GET | ✅ Operacional | Paginación funcional |
| `/api/v1/doctors` | GET | ✅ Operacional | Búsqueda geoespacial |
| `/api/v1/markets` | GET | ✅ Operacional | Búsqueda geoespacial |
| `/api/v1/businesses` | GET | ✅ Operacional | Búsqueda geoespacial |
| `/auth/refresh-token` | POST | ⚠️ Pendiente confirmación | Ver [BACKEND_DISCUSSION_POINTS.md](docs/BACKEND_DISCUSSION_POINTS.md) |
| `/auth/logout` | POST | ⚠️ No usado en frontend | Implementación pendiente |
| `/auth/revoke-all-tokens` | POST | ❌ No implementado | Feature futura |
```

#### Agregar Sección de Rate Limiting

**Después de la tabla de endpoints:**
```markdown
## Rate Limiting

Según contrato API v2.3.0, se implementan los siguientes límites:

| Endpoint | Ventana | Límite | Acción en Exceso |
|----------|---------|--------|------------------|
| `/users/login` | 15 min | 5 intentos | 429 + Retry-After |
| `/users/register` | 1 hora | 3 intentos | 429 + Retry-After |
| `/restaurants` (búsqueda) | 1 min | 30 requests | 429 + Retry-After |
| General | 15 min | 100 requests | 429 + Retry-After |

**Headers retornados por backend:**
- `RateLimit-Limit`: Límite total de requests
- `RateLimit-Remaining`: Requests restantes en ventana actual
- `RateLimit-Reset`: Timestamp Unix cuando se resetea el límite

**Ejemplo:**
```http
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1609459200
```

**Nota:** Frontend lee estos headers y muestra warning cuando `RateLimit-Remaining < 10`
```

#### Agregar Sección de Autenticación

**Nueva sección:**
```markdown
## Sistema de Autenticación

### Tokens Duales

La API utiliza un sistema de **dos tokens**:

1. **Access Token (JWT)**
   - Duración: 15 minutos
   - Almacenado en: Cookie HttpOnly `jwt`
   - Uso: Autenticación de requests
   - Se renueva: Automáticamente vía refresh token

2. **Refresh Token (JWT)**
   - Duración: 7 días
   - Almacenado en: localStorage del frontend
   - Uso: Renovar access token expirado
   - Endpoint: `POST /auth/refresh-token`

### Flujo de Autenticación

```
1. Usuario hace login
   ↓
2. Backend retorna:
   - Cookie 'jwt' con access token
   - Body con refreshToken
   ↓
3. Frontend guarda refreshToken en localStorage
   ↓
4. Cada request incluye cookie automáticamente (credentials: 'include')
   ↓
5. Después de 15 min, access token expira
   ↓
6. Frontend detecta 401
   ↓
7. Frontend llama /auth/refresh-token con refreshToken
   ↓
8. Backend retorna nuevo access token + nuevo refresh token
   ↓
9. Frontend reintenta request original
   ↓
10. Si refresh falla → redirigir a login
```

### Endpoints de Autenticación

- `POST /users/login` - Iniciar sesión
- `POST /users/register` - Registrar usuario
- `POST /auth/refresh-token` - Renovar access token
- `POST /auth/logout` - Cerrar sesión (blacklistea tokens)
- `POST /auth/revoke-all-tokens` - Cerrar sesión en todos dispositivos

**Ver:** [BACKEND_DISCUSSION_POINTS.md](docs/BACKEND_DISCUSSION_POINTS.md) para detalles de implementación
```

---

## 2. README.md

### Cambios Requeridos:

#### Corregir Variables de Entorno

**Buscar sección "Environment Variables" y actualizar:**

```diff
## Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
- NEXT_PUBLIC_API_URL=http://localhost:5000/api
+ NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
+ # ⚠️ IMPORTANTE: Debe incluir /api/v1 al final

# Production
+ NEXT_PUBLIC_API_URL=https://api-guidetypescript-787324382752.europe-west1.run.app/api/v1

# NextAuth
NEXTAUTH_SECRET=your-super-secret-key-change-in-production
- NEXTAUTH_URL=http://localhost:3000
+ NEXTAUTH_URL=http://localhost:3000
+ AUTH_SECRET=your-super-secret-key-change-in-production
+ AUTH_URL=http://localhost:3000

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Default Location (Bogotá, Colombia)
NEXT_PUBLIC_DEFAULT_LAT=4.6097
NEXT_PUBLIC_DEFAULT_LNG=-74.0817

# Debug (optional)
NEXT_PUBLIC_DEBUG=true
NODE_ENV=development
```
```

#### Agregar Sección de Autenticación

**Agregar nueva sección después de "Features":**

```markdown
## Autenticación y Seguridad

### Sistema de Tokens Duales

La aplicación utiliza un sistema de autenticación seguro con dos tokens:

1. **Access Token (15 minutos)**
   - JWT almacenado en cookie HttpOnly
   - Se envía automáticamente en cada request
   - No accesible via JavaScript (protección XSS)

2. **Refresh Token (7 días)**
   - JWT almacenado en localStorage
   - Usado para renovar access token expirado
   - Rotación automática en cada uso

### Flujo de Sesión

- Login → Tokens se guardan automáticamente
- Navegación → Access token en cookie se envía automáticamente
- Después de 15 min → Refresh automático transparente
- Logout → Tokens se invalidan en backend

### Configuración

El sistema de refresh está implementado en:
- Interceptor: `src/lib/api/config.ts`
- Auth functions: `src/lib/api/auth.ts`
- NextAuth config: `src/lib/auth.ts`

**Ver documentación técnica:** [docs/API_DISCREPANCIES_v2.3.0.md](docs/API_DISCREPANCIES_v2.3.0.md#11-sistema-de-refresh-token-no-implementado)
```

#### Agregar Sección de Troubleshooting

```markdown
## Common Issues

### "Session expired" después de 15 minutos

**Causa:** Access token expiró y refresh automático falló

**Solución:**
1. Verificar que `refreshToken` existe en localStorage:
   ```javascript
   localStorage.getItem('refreshToken')
   ```
2. Ver logs en Network tab para request a `/auth/refresh-token`
3. Si falla, verificar con backend que endpoint funciona
4. Como último recurso: limpiar localStorage y re-login

### Reviews no se crean

**Causa:** Estructura de review cambió en API v2.3.0

**Solución:**
- Verificar que formulario tiene campos: `title` (5-100 chars) y `content` (10-1000 chars)
- `title` y `content` son obligatorios
- Ver [docs/API_DISCREPANCIES_v2.3.0.md](docs/API_DISCREPANCIES_v2.3.0.md#12-estructura-de-reviews-completamente-diferente) para detalles

### Rate limit exceeded

**Síntoma:** Error 429 "Too Many Requests"

**Solución:**
- Esperar el tiempo indicado en el mensaje
- Verificar que no hay loops de requests
- Ver [TROUBLESHOOTING.md](TROUBLESHOOTING.md#rate-limiting) para más detalles
```

---

## 3. TROUBLESHOOTING.md

### Cambios Requeridos:

#### Eliminar Sección Desactualizada sobre Paginación

**Buscar y ELIMINAR o actualizar:**

```diff
- ## Paginación no funciona
-
- **Síntoma:** Ambas requests retornan los mismos datos:
- ```
- GET /api/v1/recipes?page=1&limit=2
- GET /api/v1/recipes?page=2&limit=2
- ```
-
- **Causa:** Backend no respeta parámetros page/limit
```

**Reemplazar con:**

```markdown
## ✅ Paginación Corregida

**Status:** Funcional en API v2.3.0

El backend ahora soporta paginación correctamente en todos los endpoints.

**Parámetros:**
- `page` (default: 1) - Número de página
- `limit` (default: 10, max: 100) - Items por página

**Response incluye:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Si encuentras problemas:**
1. Verificar que parámetros `page` y `limit` se envían en query string
2. Verificar que response incluye objeto `pagination`
3. Contactar backend team si pagination no funciona
```

#### Agregar Sección de Tokens Expirados

**Nueva sección:**

```markdown
## Tokens Expirados

### Síntoma

- Requests fallan con 401 Unauthorized después de 15 minutos
- Usuario es redirigido a login inesperadamente
- Mensaje "Session expired" aparece

### Causa

El access token (JWT) expira después de 15 minutos. El sistema debería refrescarlo automáticamente, pero algo falló.

### Debug

**Paso 1: Verificar refresh token en localStorage**

Abrir DevTools Console y ejecutar:
```javascript
console.log(localStorage.getItem('refreshToken'));
```

- Si es `null`: Token no se guardó en login → Bug en `src/lib/api/auth.ts`
- Si existe: Continuar al paso 2

**Paso 2: Ver Network tab**

1. Abrir DevTools → Network
2. Reproducir el error (esperar 15 min o forzar token expirado)
3. Buscar request a `/auth/refresh-token`
4. Verificar:
   - Si la request se hizo → Continuar al paso 3
   - Si NO se hizo → Bug en interceptor `src/lib/api/config.ts`

**Paso 3: Verificar response de refresh**

Si la request se hizo pero falló:

- **401 Unauthorized:** Refresh token inválido o expirado
  - Solución: Re-login necesario
  - Causa: Backend rechazó refresh token

- **500 Internal Server Error:** Error en backend
  - Solución: Contactar backend team
  - Causa: Bug en backend

- **Timeout:** Backend no responde
  - Solución: Verificar que backend está up
  - Causa: Backend down o network issues

### Solución

**Si refresh token no existe:**
```javascript
// En src/lib/api/auth.ts, función login()
// Verificar que esta línea existe:
if (data.data.refreshToken) {
  localStorage.setItem('refreshToken', data.data.refreshToken);
}
```

**Si refresh request no se hace:**
```javascript
// En src/lib/api/config.ts, función apiRequest()
// Verificar que interceptor de 401 existe
if (response.status === 401 && !options._retry) {
  const refreshToken = localStorage.getItem('refreshToken');
  // ... código de refresh
}
```

**Si refresh request falla:**
- Contactar backend team
- Verificar que endpoint `/auth/refresh-token` funciona
- Verificar logs del backend

**Si loop infinito de refresh:**
- Verificar que flag `_retry` se usa correctamente
- Debe haber máximo 1 reintento

### Prevención

Para evitar este problema:
1. Asegurar que `credentials: 'include'` está en todos los fetch
2. Verificar que login guarda refreshToken en localStorage
3. Verificar que interceptor de 401 funciona correctamente
4. Testing regular del flujo de refresh
```

#### Agregar Sección de Rate Limiting

**Nueva sección:**

```markdown
## Rate Limiting

### Síntoma

- Error 429 "Too Many Requests"
- Mensaje "API rate limit exceeded"
- No se pueden hacer requests por un tiempo

### Causa

Excediste el límite de requests permitidos en la ventana de tiempo.

**Límites por endpoint:**

| Endpoint | Ventana | Límite |
|----------|---------|--------|
| `/users/login` | 15 min | 5 intentos |
| `/users/register` | 1 hora | 3 intentos |
| `/restaurants` (búsqueda) | 1 min | 30 requests |
| General | 15 min | 100 requests |

### Debug

**Ver headers en DevTools:**

Abrir DevTools → Network → Seleccionar cualquier request → Headers

Buscar:
```
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1737120000
Retry-After: 300
```

- `RateLimit-Remaining: 0` → Límite alcanzado
- `Retry-After: 300` → Esperar 300 segundos (5 minutos)

### Solución

**Inmediata:**
- Esperar el tiempo indicado en `Retry-After`
- No hacer más requests hasta que se resetee

**Prevención:**
1. Verificar que no hay loops de requests infinitos
2. Implementar debouncing en búsquedas
3. Usar caché local cuando sea posible
4. Verificar que componentes no se re-renderizan constantemente

**Si el límite es demasiado bajo:**
- Contactar backend team
- Discutir whitelist para IPs de desarrollo
- Discutir aumentar límites si es necesario

### Warning Proactivo

Frontend debería mostrar warning cuando `RateLimit-Remaining < 10`:

```typescript
// En src/lib/api/config.ts
if (rateLimitRemaining && parseInt(rateLimitRemaining) < 10) {
  toast.warning(
    `Rate limit approaching: ${rateLimitRemaining} requests remaining`
  );
}
```

Si no ves este warning, verificar que está implementado.
```

---

## 4. CODEX-FIXES-REPORT.md

### Opciones:

#### Opción A: Archivar (Recomendado)

**Si el issue de paginación fue resuelto:**

```bash
# Crear carpeta archive si no existe
mkdir -p docs/archive

# Mover archivo
mv CODEX-FIXES-REPORT.md docs/archive/CODEX-FIXES-REPORT-2025-01-17.md

# Agregar nota al final
echo "\n\n---\n\n**Status:** Archivado el 17 de Enero de 2025\n**Razón:** Issue de paginación resuelto en API v2.3.0\n**Ver:** [API_DISCREPANCIES_v2.3.0.md](../API_DISCREPANCIES_v2.3.0.md) para análisis actualizado" >> docs/archive/CODEX-FIXES-REPORT-2025-01-17.md
```

#### Opción B: Actualizar (Si issue persiste)

**Agregar sección al principio:**

```markdown
## ⚠️ Status Update - 17 de Enero de 2025

**Issue reportado:** Paginación no funcional (page/limit no respetados)

**Status actual:** [PENDIENTE CONFIRMACIÓN]

**Acciones tomadas:**
1. Documentado en [API_DISCREPANCIES_v2.3.0.md](docs/API_DISCREPANCIES_v2.3.0.md)
2. Preguntado a backend en [BACKEND_DISCUSSION_POINTS.md](docs/BACKEND_DISCUSSION_POINTS.md)
3. Esperando respuesta de backend team

**Próximos pasos:**
- Backend confirma si issue está resuelto
- Si resuelto: Archivar este documento
- Si NO resuelto: Crear ticket en backend repo

**Testing:**
```bash
# Script de testing disponible
node scripts/test-pagination.js
```

---

[Resto del contenido original...]
```

---

## 5. Crear Nuevo Archivo: API-INTEGRATION-GUIDE.md

**Ubicación:** `docs/API-INTEGRATION-GUIDE.md`

**Contenido:** (Ver contrato original sección 9 para inspiración)

```markdown
# API Integration Guide - Vegan Guide Platform

**Version:** 2.3.0
**Date:** 17 de Enero de 2025
**For:** Frontend Developers

---

## Quick Start

### 1. Base URL

**Development:**
```
http://localhost:5001/api/v1
```

**Production:**
```
https://api-guidetypescript-787324382752.europe-west1.run.app/api/v1
```

### 2. Authentication

All authenticated requests must include:

```javascript
fetch(url, {
  credentials: 'include',  // CRITICAL: Sends cookies
  headers: {
    'Authorization': `Bearer ${token}`,  // Optional if using cookies
  }
})
```

### 3. API Clients

All API clients are in `src/lib/api/`:

```
src/lib/api/
├── config.ts           # Central config + interceptor
├── auth.ts             # Auth endpoints
├── restaurants.ts      # Restaurants CRUD
├── reviews.ts          # Reviews system
├── doctors.ts          # Doctors CRUD
├── markets.ts          # Markets CRUD
├── businesses.ts       # Businesses CRUD
├── recipes.ts          # Recipes CRUD
└── search.ts           # Unified search
```

## Common Patterns

### Authentication

```typescript
import { login } from '@/lib/api/auth';

const userData = await login({ email, password });
// Tokens saved automatically
```

### Creating a Review

```typescript
import { addRestaurantReview } from '@/lib/api/restaurants';

const review = await addRestaurantReview(restaurantId, {
  rating: 5,
  title: "Excellent food",
  content: "The best vegan tacos I've ever had...",
  visitDate: "2025-01-15",
  recommendedDishes: ["Tacos al pastor", "Guacamole"],
  tags: ["authentic", "family-friendly"]
}, token);
```

### Geospatial Search

```typescript
import { getNearbyRestaurants } from '@/lib/api/restaurants';

const restaurants = await getNearbyRestaurants({
  latitude: 40.7128,
  longitude: -74.0060,
  radius: 5000,  // meters
  minRating: 4
});
```

## Error Handling

```typescript
try {
  const data = await getRestaurants({ page: 1, limit: 10 });
} catch (error) {
  if (error.message.includes('401')) {
    // Interceptor already tried refresh, user must re-login
    router.push('/login');
  } else if (error.message.includes('429')) {
    // Rate limit exceeded
    toast.error('Too many requests. Please wait.');
  } else {
    toast.error(error.message);
  }
}
```

## Troubleshooting

See [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) for detailed debugging guide.

**Quick Links:**
- [Tokens expired](../TROUBLESHOOTING.md#tokens-expirados)
- [Rate limiting](../TROUBLESHOOTING.md#rate-limiting)
- [Reviews not creating](../TROUBLESHOOTING.md#reviews-no-se-crean)

---

**For complete API specification:** See [API v2.3.0 Contract](./API-CONTRACT-v2.3.0.md)
```

---

## Checklist de Actualización

### Documentos Existentes

- [ ] `API-STATUS.md` actualizado (versión, endpoints, rate limiting, auth)
- [ ] `README.md` actualizado (env vars, auth section, troubleshooting)
- [ ] `TROUBLESHOOTING.md` actualizado (paginación, tokens, rate limiting)
- [ ] `CODEX-FIXES-REPORT.md` archivado o actualizado

### Documentos Nuevos

- [ ] `docs/API-INTEGRATION-GUIDE.md` creado
- [ ] `docs/BACKEND_DISCUSSION_POINTS.md` ya existe
- [ ] `docs/API_DISCREPANCIES_v2.3.0.md` ya existe
- [ ] `docs/BACKEND_CHANGES_REQUIRED.md` ya existe
- [ ] `docs/FRONTEND_CHANGES_REQUIRED.md` ya existe

### Referencias Cruzadas

- [ ] Todos los docs nuevos referenciados en README
- [ ] TROUBLESHOOTING referencia docs técnicos
- [ ] API-STATUS referencia análisis de discrepancias
- [ ] Links internos verificados (no rotos)

---

## Prioridad de Actualización

**Inmediata (Pre-reunión):**
1. No actualizar docs existentes aún
2. Usar docs nuevos (BACKEND_DISCUSSION_POINTS, etc.) para reunión

**Post-reunión:**
1. Actualizar API-STATUS.md con confirmaciones de backend
2. Actualizar README.md con nueva info de auth
3. Actualizar TROUBLESHOOTING.md con nuevas secciones
4. Archivar o actualizar CODEX-FIXES-REPORT.md
5. Crear API-INTEGRATION-GUIDE.md

**Post-implementación:**
1. Validar que toda la documentación refleja la realidad
2. Actualizar screenshots si es necesario
3. Agregar ejemplos de código actualizados
4. Hacer PR de documentación separado

---

**Documento preparado por:** Frontend Team
**Fecha:** 17 de Enero de 2025
**Status:** Ready to apply (post-backend meeting)
