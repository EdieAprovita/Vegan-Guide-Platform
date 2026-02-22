# Puntos de Discusión con Backend - API v2.3.0

**Fecha:** 17 de Enero de 2025
**Autor:** Frontend Team
**Status:** Draft
**Propósito:** Alinear implementación frontend-backend según contrato API v2.3.0

---

## Resumen Ejecutivo

Este documento contiene las preguntas críticas y puntos de decisión que deben ser discutidos con el equipo de backend para alinear la implementación del frontend con el contrato API v2.3.0. Se identificaron **3 discrepancias críticas** que requieren decisiones arquitecturales conjuntas.

**Prioridad de Discusión:**
1. Sistema de Refresh Token (CRÍTICO)
2. Migración de Reviews (CRÍTICO)
3. Validaciones (IMPORTANTE)

---

## 1. Sistema de Refresh Token

### Contexto

Según el contrato API v2.3.0:
- **Access Token:** Válido por 15 minutos
- **Refresh Token:** Válido por 7 días
- **Endpoint:** `POST /auth/refresh-token`
- **Cookie HttpOnly:** Cookie `jwt` con access token

**Status actual en frontend:**
- ❌ NO hay implementación de refresh token
- ❌ NO hay interceptor para refrescar automáticamente
- ❌ Usuario debe re-login manualmente cada 15 minutos

### Preguntas para Backend

#### 1.1 Implementación del Endpoint

**P1:** ¿El endpoint `POST /auth/refresh-token` ya está implementado y testeado en producción?

**P2:** ¿Cuál es la estructura exacta de request y response?
```json
// Request esperado
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response esperado
{
  "success": true,
  "data": {
    "accessToken": "nuevo_access_token",
    "refreshToken": "nuevo_refresh_token_o_mismo"
  }
}
```

**P3:** ¿Se actualiza la cookie `jwt` automáticamente en la response de `/auth/refresh-token`?

#### 1.2 Política de Revocación

**P4:** ¿Cuál es la política de revocación de refresh tokens?

**Opciones a considerar:**

- **Opción A: Rotating Refresh Tokens (Recomendado)**
  - Cada vez que se usa un refresh token, se genera uno nuevo
  - El refresh token anterior se invalida inmediatamente
  - Más seguro: si un token es robado, tiene ventana de uso limitada
  - **Estándar OAuth2**

- **Opción B: Multiple Active Refresh Tokens**
  - Un usuario puede tener N refresh tokens activos (uno por dispositivo)
  - Útil para usuarios con múltiples dispositivos
  - Requiere manejo de revocación selectiva

- **Opción C: Single Refresh Token**
  - Solo 1 refresh token válido a la vez por usuario
  - Hacer login en un nuevo dispositivo invalida el anterior
  - Más simple pero peor UX multi-dispositivo

**Pregunta clave:** ¿Cuál política está implementada actualmente?

**Recomendación Frontend:** Opción A (más seguro, mejor balance)

#### 1.3 Blacklist y Gestión de Tokens

**P5:** ¿Existe un sistema de blacklist para tokens revocados?
- ¿Tokens se guardan en Redis?
- ¿Tokens se guardan en MongoDB?
- ¿Cuál es el TTL de los tokens en blacklist?

**P6:** ¿Qué pasa si llega un request con:
- Access token válido pero refresh token revocado?
- Access token expirado y refresh token válido?
- Ambos tokens expirados?

**P7:** ¿El endpoint `/auth/logout` blacklistea el access token actual?

**P8:** ¿El endpoint `/auth/revoke-all-tokens` blacklistea TODOS los tokens del usuario?

#### 1.4 Headers y Seguridad

**P9:** ¿La cookie `jwt` tiene los siguientes atributos?
```
- HttpOnly: true
- Secure: true (en producción)
- SameSite: Strict o Lax
- Max-Age: 900 (15 minutos)
```

**P10:** ¿El refresh token debe enviarse en:
- Body del POST? (recomendado para refresh)
- Header Authorization?
- Cookie separada?

#### 1.5 Testing y Edge Cases

**P11:** ¿Cómo podemos testear el flujo de refresh en desarrollo?
- ¿Endpoint para reducir TTL de tokens temporalmente?
- ¿Ambiente de staging con tokens de corta duración?

**P12:** ¿Qué status code retorna `/auth/refresh-token` si:
- Refresh token inválido → 401?
- Refresh token expirado → 401?
- Refresh token revocado → 403?
- Usuario bloqueado → 403?

### Propuesta de Implementación Frontend

Si backend confirma que el sistema está funcionando, implementaremos:

```typescript
// En src/lib/api/config.ts
export const apiRequest = async <T>(url, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      credentials: 'include',  // Importante para cookies
    });

    // Interceptor de 401
    if (response.status === 401 && !options._retry) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // Llamar al endpoint de refresh
          const newTokens = await refreshTokenApi(refreshToken);

          // Guardar nuevo refresh token
          localStorage.setItem('refreshToken', newTokens.refreshToken);

          // Reintentar request original con nuevo access token
          return apiRequest(url, { ...options, _retry: true });
        } catch (refreshError) {
          // Refresh falló, limpiar y redirigir a login
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          throw refreshError;
        }
      } else {
        // No hay refresh token, redirigir a login
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
```

### Decisiones Requeridas

- [ ] Confirmar que `/auth/refresh-token` funciona y está desplegado
- [ ] Definir política de revocación (A, B o C)
- [ ] Confirmar estructura exacta de request/response
- [ ] Definir status codes para diferentes errores
- [ ] Establecer plan de testing (staging environment)
- [ ] Documentar flujo completo para frontend

---

## 2. Migración de Reviews

### Contexto

**Breaking Change Identificado:**

**Estructura actual (frontend):**
```typescript
interface Review {
  _id: string;
  rating: number;
  comment: string;  // Campo actual
  author: string;
  // ... otros campos
}
```

**Estructura según contrato v2.3.0:**
```typescript
interface Review {
  _id: string;
  rating: number;              // 1-5, requerido
  title: string;               // 5-100 chars, REQUERIDO
  content: string;             // 10-1000 chars, REQUERIDO (antes "comment")
  visitDate?: string;          // ISO 8601, opcional
  recommendedDishes?: string[]; // Max 50 chars c/u, opcional
  tags?: string[];             // Max 30 chars c/u, opcional
  author: string;
  entityType: 'Restaurant' | 'Recipe' | 'Market' | ...;
  entity: string;
  // ... otros campos
}
```

**Impacto:**
- Todos los componentes de review actuales usan `comment`
- Formularios no tienen campos `title`, `visitDate`, `recommendedDishes`, `tags`
- Reviews existentes en DB tienen `comment` pero no `title` ni `content`
- Backend probablemente rechazará requests sin `title` (400 Validation Error)

### Preguntas para Backend

#### 2.1 Estado Actual de la Base de Datos

**P1:** ¿Cuántas reviews existen actualmente en la base de datos?

**P2:** ¿Las reviews actuales tienen el campo `comment` o ya fueron migradas a `title`/`content`?

**P3:** ¿El modelo de Review en backend ya requiere `title` y `content` como campos obligatorios?

#### 2.2 Estrategia de Migración

**P4:** ¿Qué estrategia de migración prefiere backend?

**Opciones:**

**Opción A: Backend Migra Primero, Frontend Después**
- Backend ejecuta script de migración en DB
- Backend actualiza validaciones
- Frontend se adapta a nueva estructura
- **Pros:** Un solo deploy, cambio limpio
- **Contras:** Puede requerir downtime, riesgoso

**Opción B: Backward Compatibility Temporal (RECOMENDADO)**
- Backend soporta AMBOS formatos durante 2-4 semanas
- Backend acepta `comment` O `title`/`content`
- Backend retorna ambos campos durante transición
- Migración gradual en background
- Frontend se actualiza progresivamente
- **Pros:** Sin downtime, rollback fácil, bajo riesgo
- **Contras:** Más complejo temporalmente

**Opción C: Deploy Coordinado Simultáneo**
- Backend y frontend se despliegan al mismo tiempo
- Requiere ventana de mantenimiento coordinada
- **Pros:** Cambio rápido y limpio
- **Contras:** Alto riesgo, coordinación difícil

**Pregunta clave:** ¿Cuál opción prefiere backend?

**Recomendación Frontend:** Opción B (más seguro, permite testing gradual)

#### 2.3 Transformación de Datos

Si backend elige Opción B (backward compatibility), necesitamos decidir:

**P5: Generación del campo `title` desde `comment`**

**Opciones:**

1. **Primeros 50 caracteres de `comment`:**
   ```javascript
   title = comment.substring(0, 50).trim() + (comment.length > 50 ? "..." : "")
   ```
   - Pros: Simple, automático
   - Contras: Puede no ser descriptivo

2. **Usar IA/NLP para generar título:**
   ```javascript
   title = generateTitleWithAI(comment)
   ```
   - Pros: Títulos más descriptivos
   - Contras: Costo, complejidad, latencia

3. **Título genérico con metadata:**
   ```javascript
   title = `Review from ${username} - ${restaurantName}`
   ```
   - Pros: Siempre válido
   - Contras: No informativo

**Pregunta:** ¿Qué estrategia prefiere backend?

**Recomendación Frontend:** Opción 1 (simple y rápido)

**P6: Campo `visitDate` para reviews antiguas**

**Opciones:**
1. Usar `createdAt` como default
2. Dejar como `null`/`undefined`
3. Usar fecha fija histórica

**Pregunta:** ¿Qué prefiere backend?

**Recomendación:** Usar `createdAt` (más realista)

**P7: Campos `recommendedDishes` y `tags`**

Para reviews antiguas, estas opciones:
1. Dejarlos como arrays vacíos `[]`
2. Intentar extraer de `comment` con regex/NLP (complejo)
3. Marcar como `null`

**Recomendación:** Arrays vacíos `[]` (más simple)

#### 2.4 Script de Migración

**P8:** ¿Backend puede proporcionar/validar este script de migración?

```javascript
// Script de migración propuesto (MongoDB)
db.reviews.find({ comment: { $exists: true }, title: { $exists: false } }).forEach(review => {
  const title = review.comment.substring(0, 50).trim() +
                (review.comment.length > 50 ? "..." : "");

  db.reviews.updateOne(
    { _id: review._id },
    {
      $set: {
        title: title,
        content: review.comment,
        visitDate: review.createdAt,
        recommendedDishes: [],
        tags: []
      },
      // Opcional: conservar comment durante transición
      // $unset: { comment: "" }  // Descomentar después de transición
    }
  );
});

// Crear índices si no existen
db.reviews.createIndex({ title: "text", content: "text" });
```

**P9:** ¿Cuánto tiempo tomaría ejecutar esta migración en producción?

**P10:** ¿Hay un ambiente de staging donde podemos testear la migración primero?

#### 2.5 API Response Durante Transición

Si backend soporta backward compatibility, ¿el endpoint retorna:

**Opción A: Solo nuevos campos**
```json
{
  "title": "Great place",
  "content": "Excellent food and service..."
}
```

**Opción B: Ambos campos durante transición**
```json
{
  "comment": "Excellent food and service...",  // Deprecated
  "title": "Great place",
  "content": "Excellent food and service..."
}
```

**Pregunta:** ¿Cuál opción implementará backend?

**Recomendación:** Opción B durante transición (2-4 semanas), luego Opción A

#### 2.6 Validaciones

**P11:** ¿El backend ya valida estos límites?
- `title`: 5-100 caracteres (requerido)
- `content`: 10-1000 caracteres (requerido)
- `recommendedDishes`: cada string máx 50 caracteres
- `tags`: cada string máx 30 caracteres

**P12:** Si validación falla, ¿qué formato de error retorna backend?

```json
{
  "success": false,
  "errors": [
    {
      "field": "title",
      "message": "Title must be between 5-100 characters",
      "value": "Hi"
    },
    {
      "field": "content",
      "message": "Content must be between 10-1000 characters",
      "value": "Good"
    }
  ]
}
```

### Propuesta de Adaptador Frontend

Durante el período de transición, implementaremos un adaptador:

```typescript
// src/lib/adapters/review-adapter.ts

/**
 * Adapta reviews antiguas (comment) a nuevo formato (title/content)
 */
export function adaptReviewResponse(review: any): Review {
  // Si tiene el formato nuevo, retornar directamente
  if (review.title && review.content) {
    return review as Review;
  }

  // Si tiene formato antiguo, adaptar
  if (review.comment) {
    return {
      ...review,
      title: review.comment.substring(0, 50) + "...",
      content: review.comment,
      visitDate: review.visitDate || review.createdAt,
      recommendedDishes: review.recommendedDishes || [],
      tags: review.tags || []
    };
  }

  throw new Error('Invalid review format');
}

/**
 * Adapta request de frontend para enviar en formato correcto
 */
export function adaptReviewRequest(data: ReviewFormData) {
  return {
    rating: data.rating,
    title: data.title,
    content: data.content || data.comment, // Fallback temporal
    visitDate: data.visitDate,
    recommendedDishes: data.recommendedDishes || [],
    tags: data.tags || []
  };
}
```

### Testing Strategy

**P13:** ¿Podemos coordinar testing en staging?

**Casos de prueba críticos:**
1. Crear review con formato nuevo → debe guardarse correctamente
2. Leer review antigua migrada → debe mostrarse correctamente
3. Crear review sin `title` (formato antiguo) → debe rechazarse o adaptarse
4. Review con `recommendedDishes` → debe guardarse como array
5. Review con `tags` → debe guardarse como array
6. Validación de límites de caracteres

### Timeline Propuesto

**Semana 1: Preparación**
- Backend prepara script de migración
- Testing en staging environment
- Frontend prepara adaptador y nuevos componentes

**Semana 2: Migración en Staging**
- Backend ejecuta migración en staging
- Frontend y backend testean juntos
- Validar que no hay data loss

**Semana 3: Deploy Coordinado**
- Backend deploya soporte de ambos formatos
- Backend ejecuta migración en producción (off-peak)
- Frontend deploya adaptador y nuevos componentes

**Semana 4: Monitoring**
- Monitorear errores y logs
- Validar que todas las reviews se muestran correctamente
- Preparar para eliminar soporte de formato antiguo

**Semana 5-6: Cleanup (Opcional)**
- Backend elimina soporte de `comment` deprecated
- Frontend elimina adaptador
- Documentación actualizada

### Decisiones Requeridas

- [ ] Confirmar cantidad de reviews en DB
- [ ] Elegir estrategia de migración (A, B o C)
- [ ] Decidir cómo generar `title` desde `comment`
- [ ] Decidir valor default de `visitDate`
- [ ] Confirmar formato de error de validación
- [ ] Validar script de migración propuesto
- [ ] Establecer timeline de migración
- [ ] Coordinar ambiente de staging para testing
- [ ] Definir plan de rollback si algo falla

---

## 3. Validaciones

### Contexto

Se identificaron discrepancias entre las validaciones del contrato y las implementadas en frontend.

### 3.1 Validación de Password

**Contrato especifica:**
```regex
/^(?=[^\n]{8,128}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).*$/
```

**Requisitos:**
- 8-128 caracteres
- Al menos una letra minúscula
- Al menos una letra mayúscula
- Al menos un número
- Al menos un carácter especial de: `@$!%*?&`

**Frontend actual** (`src/lib/validations/auth.ts`):
```typescript
password: z.string().min(8, "Password must be at least 8 characters")
```
❌ Sin validación de complejidad

**Preguntas:**

**P1:** ¿El regex del contrato es exactamente el que backend valida?

**P2:** ¿Backend acepta otros caracteres especiales además de `@$!%*?&`?
- Ejemplo: `#`, `^`, `()`, etc.

**P3:** ¿Cuál es el mensaje de error exacto que backend retorna si password no cumple?

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    }
  ]
}
```

**P4:** ¿Hay casos edge con caracteres unicode?
- ¿Emojis cuentan como caracteres especiales?
- ¿Letras acentuadas (á, é, ñ) cuentan como minúsculas?

### 3.2 Validación de Review

**Contrato especifica:**
- `rating`: 1-5 (entero)
- `title`: 5-100 caracteres
- `content`: 10-1000 caracteres
- `recommendedDishes`: array, cada string máx 50 caracteres
- `tags`: array, cada string máx 30 caracteres

**Preguntas:**

**P5:** ¿El campo `title` permite emojis y caracteres especiales?

**P6:** ¿Los límites de caracteres son en:
- Caracteres Unicode (length)?
- Bytes UTF-8?
- Caracteres visuales (considerando emojis como 1)?

**P7:** ¿Hay límite máximo en la cantidad de items en arrays?
- `recommendedDishes`: ¿máx 10 items?
- `tags`: ¿máx 10 items?

**P8:** ¿Backend valida que `visitDate` no sea en el futuro?

### 3.3 Validación de Registro

**P9:** ¿Hay validación de email más allá del formato?
- ¿Blacklist de dominios desechables?
- ¿Whitelist de dominios corporativos?

**P10:** ¿Username tiene restricciones adicionales?
- Solo alfanumérico?
- Permite espacios, guiones, underscores?
- Lista de usernames prohibidos (admin, root, etc.)?

### Propuesta Frontend

Implementaremos validaciones idénticas a backend usando Zod:

```typescript
// src/lib/validations/auth.ts

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  .regex(/^(?=.*[a-z])/, "Must contain at least one lowercase letter")
  .regex(/^(?=.*[A-Z])/, "Must contain at least one uppercase letter")
  .regex(/^(?=.*\d)/, "Must contain at least one number")
  .regex(/^(?=.*[@$!%*?&])/, "Must contain at least one special character (@$!%*?&)");

// src/lib/validations/review.ts

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(5).max(100),
  content: z.string().min(10).max(1000),
  visitDate: z.string().datetime().optional(),
  recommendedDishes: z.array(z.string().max(50)).max(10).optional(),
  tags: z.array(z.string().max(30)).max(10).optional()
});
```

### Decisiones Requeridas

- [ ] Confirmar regex exacto de password
- [ ] Confirmar lista completa de caracteres especiales aceptados
- [ ] Confirmar límites de arrays (recommendedDishes, tags)
- [ ] Confirmar tipo de conteo de caracteres (Unicode vs bytes)
- [ ] Confirmar validación de visitDate (no futuro)
- [ ] Compartir esquemas de validación completos de backend

---

## 4. Rate Limiting

### Contexto

**Contrato especifica:**

| Endpoint | Ventana | Límite |
|----------|---------|--------|
| /users/login | 15 min | 5 intentos |
| /users/register | 1 hora | 3 intentos |
| /restaurants (búsqueda) | 1 min | 30 requests |
| General | 15 min | 100 requests |

**Headers esperados:**
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1609459200
```

**Preguntas:**

**P1:** ¿Backend ya retorna estos headers en todas las responses?

**P2:** ¿Qué pasa cuando se excede el límite?
- Status code: 429 Too Many Requests?
- ¿Se incluye header `Retry-After`?

**P3:** ¿Rate limiting es por:
- IP address?
- Usuario autenticado?
- Combinación de ambos?

**P4:** ¿Hay whitelist para:
- IPs de desarrollo?
- IPs de testing/CI?
- Usuarios admin?

**P5:** ¿Cómo afecta rate limiting a refresh tokens?
- ¿Está el endpoint `/auth/refresh-token` sujeto a rate limiting?
- ¿Qué límite tiene?

### Propuesta Frontend

Si backend confirma headers, implementaremos:

```typescript
// Leer headers y mostrar warning si quedan pocos requests
const rateLimitRemaining = response.headers.get('RateLimit-Remaining');
const rateLimitReset = response.headers.get('RateLimit-Reset');

if (rateLimitRemaining && parseInt(rateLimitRemaining) < 10) {
  showWarning(`Rate limit approaching: ${rateLimitRemaining} requests remaining`);
}

// Manejo de 429
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  showError(`Rate limit exceeded. Please wait ${retryAfter} seconds.`);
}
```

### Decisiones Requeridas

- [ ] Confirmar que headers RateLimit-* se retornan
- [ ] Confirmar comportamiento en 429
- [ ] Confirmar si rate limiting es por IP o usuario
- [ ] Confirmar whitelist para desarrollo
- [ ] Documentar rate limits de todos los endpoints

---

## 5. Parámetros Geoespaciales

### Contexto

**Inconsistencia detectada:**

Algunos endpoints en frontend usan:
- `latitude` / `longitude`

Otros usan:
- `lat` / `lng`

**Contrato menciona:**
> Backend acepta tanto `latitude`/`longitude` como `lat`/`lng`

**Preguntas:**

**P1:** ¿Backend realmente acepta ambos formatos en todos los endpoints?

**P2:** ¿Cuál es el formato preferido/recomendado?

**P3:** ¿El formato de coordenadas GeoJSON es `[longitude, latitude]` (estándar) o `[latitude, longitude]`?

**P4:** ¿Hay validación de rangos?
- Latitude: -90 a 90
- Longitude: -180 a 180

**P5:** ¿El parámetro `radius` está en:
- Metros?
- Kilómetros?
- Millas?

**Contrato dice:** metros (1-50000)

### Propuesta Frontend

Estandarizar en `latitude`/`longitude` (más descriptivo):

```typescript
interface GeospatialParams {
  latitude: number;   // -90 a 90
  longitude: number;  // -180 a 180
  radius?: number;    // En metros, default 5000
}
```

### Decisiones Requeridas

- [ ] Confirmar que backend acepta ambos formatos
- [ ] Recomendar formato estándar
- [ ] Confirmar unidad de `radius` (metros)
- [ ] Confirmar formato GeoJSON `[lng, lat]`
- [ ] Actualizar documentación con formato preferido

---

## 6. Endpoints Faltantes o No Utilizados

### 6.1 `/auth/logout`

**Status:** Endpoint existe en contrato, pero frontend no lo usa

**Pregunta:** ¿Qué hace exactamente este endpoint?
- ¿Blacklistea el access token actual?
- ¿Invalida el refresh token?
- ¿Elimina la cookie `jwt`?

**Propuesta:** Frontend debe llamar a este endpoint en el flujo de logout:

```typescript
const handleLogout = async () => {
  const token = session?.user?.token;

  if (token) {
    try {
      await logoutApi(token);  // Llamar al backend
    } catch (error) {
      console.error("Backend logout failed:", error);
    }
  }

  localStorage.removeItem('refreshToken');
  await signOut({ callbackUrl: '/login' });
};
```

### 6.2 `/auth/revoke-all-tokens`

**Status:** Endpoint en contrato, no implementado en frontend

**Pregunta:** ¿Qué casos de uso tiene este endpoint?
- ¿Usuario sospecha que su cuenta fue comprometida?
- ¿Cerrar sesión en todos los dispositivos?

**Propuesta:** Agregar botón en configuración de usuario:

```
Settings > Security > Sign out all devices
```

### Decisiones Requeridas

- [ ] Confirmar comportamiento de `/auth/logout`
- [ ] Confirmar casos de uso de `/auth/revoke-all-tokens`
- [ ] Decidir dónde exponer "Sign out all devices" en UI

---

## 7. Timeline y Coordinación

### Propuesta de Fases

**Semana 1: Análisis y Preparación**
- **Backend:**
  - Revisar este documento
  - Responder todas las preguntas
  - Preparar ambiente de staging
  - Validar script de migración de reviews

- **Frontend:**
  - Esperar respuestas de backend
  - Preparar adaptador de reviews
  - Preparar validaciones actualizadas

**Semana 2: Implementación de Refresh Token**
- **Backend:**
  - Confirmar que `/auth/refresh-token` funciona
  - Documentar flujo completo
  - Testear en staging

- **Frontend:**
  - Implementar interceptor de refresh
  - Implementar endpoints de logout/revoke
  - Testing en staging

**Semana 3: Migración de Reviews**
- **Backend:**
  - Ejecutar migración en staging
  - Habilitar soporte de ambos formatos
  - Testear backward compatibility

- **Frontend:**
  - Actualizar componentes de review
  - Implementar nuevos campos en formularios
  - Testing con reviews antiguas y nuevas

**Semana 4: Deploy Coordinado**
- **Backend:**
  - Deploy de soporte dual (comment + title/content)
  - Migración en producción (ventana de mantenimiento)
  - Monitoring intensivo

- **Frontend:**
  - Deploy de adaptador y nuevos componentes
  - Monitoring de errores
  - Validar que todo funciona

**Semana 5-6: Validación y Cleanup**
- **Ambos equipos:**
  - Validar métricas de éxito
  - Resolver issues encontrados
  - Documentación actualizada
  - Eliminar código deprecated

### Checkpoints

- [ ] **Checkpoint 1 (Fin Semana 1):** Todas las preguntas respondidas
- [ ] **Checkpoint 2 (Fin Semana 2):** Refresh token funcionando en staging
- [ ] **Checkpoint 3 (Fin Semana 3):** Migración de reviews exitosa en staging
- [ ] **Checkpoint 4 (Fin Semana 4):** Deploy en producción exitoso
- [ ] **Checkpoint 5 (Fin Semana 6):** Cleanup completado

### Comunicación

**Canales:**
- **Slack:** Canal dedicado `#api-v2-migration`
- **Reuniones:** Sincronización semanal (30 min)
- **Documentación:** Este documento + respuestas de backend

**Puntos de contacto:**
- **Frontend Lead:** [Nombre]
- **Backend Lead:** [Nombre]
- **DevOps:** [Nombre] (para ambientes de staging)

---

## 8. Casos de Prueba Críticos

### 8.1 Refresh Token

| Caso | Acción | Resultado Esperado |
|------|--------|-------------------|
| RT-1 | Login → esperar 16 min → hacer request | Refresh automático, request exitoso |
| RT-2 | Hacer logout | Refresh token invalidado |
| RT-3 | Usar refresh token inválido | 401, redirigir a login |
| RT-4 | Usar refresh token expirado | 401, redirigir a login |
| RT-5 | Login en 2 dispositivos (si rotating) | Solo último refresh token válido |

### 8.2 Migración de Reviews

| Caso | Acción | Resultado Esperado |
|------|--------|-------------------|
| RV-1 | Leer review antigua (solo comment) | Se muestra correctamente con adaptador |
| RV-2 | Crear review nueva (title/content) | Se guarda correctamente |
| RV-3 | Review con recommendedDishes | Array se guarda correctamente |
| RV-4 | Review con tags | Array se guarda correctamente |
| RV-5 | title con < 5 caracteres | 400 Validation Error |
| RV-6 | content con < 10 caracteres | 400 Validation Error |

### 8.3 Validaciones

| Caso | Acción | Resultado Esperado |
|------|--------|-------------------|
| PW-1 | Password sin mayúscula | Error de validación |
| PW-2 | Password sin minúscula | Error de validación |
| PW-3 | Password sin número | Error de validación |
| PW-4 | Password sin carácter especial | Error de validación |
| PW-5 | Password con 7 caracteres | Error de validación |

### 8.4 Rate Limiting

| Caso | Acción | Resultado Esperado |
|------|--------|-------------------|
| RL-1 | 5 logins fallidos en 15 min | 429 en el 6to intento |
| RL-2 | 3 registros en 1 hora | 429 en el 4to intento |
| RL-3 | Exceder límite general | 429 con Retry-After header |
| RL-4 | Leer header RateLimit-Remaining | Warning UI cuando < 10 |

---

## 9. Rollback Plan

En caso de que algo falle durante el deploy:

### Rollback de Refresh Token

**Síntoma:** Usuarios reportan loops de login, 401 constantes

**Acción:**
1. Frontend: Revertir interceptor de refresh
2. Frontend: Eliminar llamadas a `/auth/refresh-token`
3. Backend: (no requiere rollback si endpoint es nuevo)

**Validación:**
- Usuarios pueden hacer login normalmente
- Sesiones duran hasta expirar naturalmente

### Rollback de Migración de Reviews

**Síntoma:** Reviews no se muestran, errores 400 al crear reviews

**Acción:**
1. Backend: Revertir a aceptar solo `comment` (si se desplegó soporte dual)
2. Frontend: Revertir componentes a usar `comment`
3. Backend: Revertir migración de DB (si es posible)

**Validación:**
- Todas las reviews se muestran correctamente
- Usuarios pueden crear reviews con `comment`

### Comunicación de Rollback

Si se requiere rollback:
1. Notificar en Slack `#api-v2-migration` inmediatamente
2. Actualizar status page (si existe)
3. Post-mortem en 48 horas
4. Reprogramar deploy después de fix

---

## 10. Métricas de Éxito

### Post-Implementación

**Refresh Token:**
- ✅ 0 errores 401 inesperados en logs (filtrar expected 401s)
- ✅ Tasa de re-login forzado < 1% de sesiones activas
- ✅ Latencia de refresh < 500ms p95

**Reviews:**
- ✅ 100% de reviews migradas sin pérdida de datos
- ✅ 0 errores 400 al crear nuevas reviews
- ✅ Todas las reviews se renderizan correctamente en frontend

**Validaciones:**
- ✅ 0 complaints de usuarios sobre passwords rechazados incorrectamente
- ✅ Tasa de error de validación en registro < 5%

**General:**
- ✅ 0 incidentes relacionados con la migración
- ✅ Uptime > 99.9% durante período de migración
- ✅ Documentación técnica 100% actualizada

---

## Apéndice A: Estructura de Errores Backend

**Pregunta:** ¿Todos los errores de backend siguen este formato?

```json
{
  "success": false,
  "message": "Error general message",
  "error": "Error type",
  "errors": [
    {
      "field": "field_name",
      "message": "Specific error message",
      "value": "invalid_value"
    }
  ]
}
```

**Validar:**
- [ ] Formato consistente en todos los endpoints
- [ ] `errors` array siempre presente en errores de validación
- [ ] `error` campo siempre presente con tipo de error

---

## Apéndice B: Variables de Entorno

**Frontend necesita confirmar:**

```env
# API URL (debe incluir /api/v1)
NEXT_PUBLIC_API_URL=https://api-guidetypescript-787324382752.europe-west1.run.app/api/v1

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-frontend-domain.com
```

**Preguntas:**
- ¿La URL base del contrato es correcta?
- ¿Hay alguna variable de entorno adicional requerida?

---

## Apéndice C: Respuestas de Backend

**Este espacio será llenado por el equipo de backend con las respuestas a todas las preguntas de este documento.**

---

## Próximos Pasos Inmediatos

1. **Enviar este documento al equipo de backend** para revisión
2. **Programar reunión de alineación** (1.5 horas)
3. **Backend responde las preguntas** en Apéndice C
4. **Actualizar el plan de implementación** basado en respuestas
5. **Comenzar Semana 1** de timeline propuesto

---

**Documento preparado por:** Frontend Team
**Fecha:** 17 de Enero de 2025
**Versión:** 1.0 (Draft)
**Próxima revisión:** Después de respuestas de backend
