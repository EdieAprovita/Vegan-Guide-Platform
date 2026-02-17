# Cambios Requeridos en Frontend - API v2.3.0

**Fecha:** 17 de Enero de 2025
**Autor:** Frontend Team
**Status:** Implementation Guide (Post-Backend Meeting)
**Propósito:** Roadmap detallado de implementación una vez backend confirme cambios

---

## Resumen Ejecutivo

Este documento detalla TODOS los cambios de código requeridos en el frontend para alinear con el contrato API v2.3.0. Debe usarse DESPUÉS de la reunión con backend y confirmación de que los endpoints necesarios están disponibles.

**Estimación:** 8-10 horas de desarrollo
**Archivos a modificar:** 8
**Archivos a crear:** 5
**Total:** 13 archivos

---

## Orden de Implementación

### Fase 1: Refresh Token System (CRÍTICO)

#### 1.1 Actualizar [src/lib/api/config.ts](src/lib/api/config.ts)

**Líneas:** 45-120
**Cambio:** Agregar interceptor de 401 para refresh automático

**Diff:**
```diff
export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
      ...options,
      signal: controller.signal,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

+   // ✅ Interceptor de 401 para refresh automático
+   if (response.status === 401 && !options._retry) {
+     const refreshToken = localStorage.getItem('refreshToken');
+
+     if (refreshToken) {
+       try {
+         const { refreshToken: refreshTokenApi } = await import('./auth');
+         const newTokens = await refreshTokenApi(refreshToken);
+
+         localStorage.setItem('refreshToken', newTokens.refreshToken);
+
+         // Reintentar request original
+         return apiRequest(url, { ...options, _retry: true });
+       } catch (refreshError) {
+         localStorage.removeItem('refreshToken');
+         window.location.href = '/login';
+         throw refreshError;
+       }
+     } else {
+       window.location.href = '/login';
+       throw new Error('Session expired');
+     }
+   }

    if (!response.ok) {
      // ... resto del código sin cambios
    }

    // ... resto sin cambios
  } catch (error) {
    // ... resto sin cambios
  }
};
```

**Testing:**
```typescript
// tests/api/config.test.ts
describe('apiRequest - Refresh Token', () => {
  it('should automatically refresh on 401', async () => {
    // Mock 401 response
    // Mock successful refresh
    // Verify retry
  });

  it('should redirect to login if refresh fails', async () => {
    // Mock 401 response
    // Mock failed refresh
    // Verify redirect
  });
});
```

---

#### 1.2 Actualizar [src/lib/api/auth.ts](src/lib/api/auth.ts)

**Cambio:** Agregar funciones de refresh, logout, revoke

**Código a agregar:**
```typescript
/**
 * Refresca el access token usando refresh token
 */
export async function refreshToken(refreshToken: string) {
  const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  return data.data; // { accessToken, refreshToken }
}

/**
 * Cierra sesión y blacklistea el token actual
 */
export async function logout(token: string) {
  try {
    await fetch(`${API_CONFIG.BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Backend logout failed:', error);
    // No throw - queremos limpiar frontend aunque backend falle
  }
}

/**
 * Revoca todos los tokens del usuario (cierra sesión en todos dispositivos)
 */
export async function revokeAllTokens(token: string) {
  await fetch(`${API_CONFIG.BASE_URL}/auth/revoke-all-tokens`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

// Actualizar función de login para guardar refreshToken
export async function login(credentials: { email: string; password: string }) {
  const response = await fetch(`${API_CONFIG.BASE_URL}/users/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();

  // ✅ Guardar refresh token en localStorage
  if (data.data.refreshToken) {
    localStorage.setItem('refreshToken', data.data.refreshToken);
  }

  return data.data;
}
```

---

#### 1.3 Actualizar [src/components/auth/register-client.tsx](src/components/auth/register-client.tsx)

**Línea:** 19
**Cambio:** Agregar `credentials: "include"`

**Diff:**
```diff
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, {
  method: "POST",
+ credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username,
    email,
    password,
  }),
});
```

**Impacto:** 1 línea, 5 segundos de cambio

---

### Fase 2: Sistema de Reviews (CRÍTICO)

#### 2.1 Actualizar [src/types/index.ts](src/types/index.ts)

**Líneas:** 120-150
**Cambio:** Actualizar interface Review

**Diff:**
```diff
export interface Review {
  _id: string;
- user: {
-   _id: string;
-   username: string;
-   photo?: string;
- };
+ author: string | {
+   _id: string;
+   username: string;
+   photo?: string;
+ };
  rating: number;
- comment: string;
+ title: string;                // 5-100 chars, requerido
+ content: string;              // 10-1000 chars, requerido
+ visitDate?: string;           // ISO 8601, opcional
+ recommendedDishes?: string[]; // Max 50 chars c/u, opcional
+ tags?: string[];              // Max 30 chars c/u, opcional
- resourceType: "restaurant" | "recipe" | "market" | "doctor" | "business" | "sanctuary";
- resourceId: string;
+ entityType: 'Restaurant' | 'Recipe' | 'Market' | 'Doctor' | 'Business' | 'Sanctuary';
+ entity: string;
- helpful: string[];
+ helpfulVotes: string[];
  helpfulCount: number;
- createdAt: string;
- updatedAt: string;
+ timestamps: {
+   createdAt: string;
+   updatedAt: string;
+ };
}

+ // Tipo para crear review
+ export interface CreateReviewData {
+   rating: number;
+   title: string;
+   content: string;
+   visitDate?: string;
+   recommendedDishes?: string[];
+   tags?: string[];
+ }
```

---

#### 2.2 Crear [src/lib/validations/review.ts](src/lib/validations/review.ts)

**Archivo nuevo**

```typescript
import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),

  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),

  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(1000, 'Content cannot exceed 1000 characters'),

  visitDate: z.string().datetime().optional(),

  recommendedDishes: z.array(
    z.string().max(50, 'Each dish name cannot exceed 50 characters')
  ).max(10, 'Cannot recommend more than 10 dishes').optional(),

  tags: z.array(
    z.string().max(30, 'Each tag cannot exceed 30 characters')
  ).max(10, 'Cannot have more than 10 tags').optional(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
```

---

#### 2.3 Actualizar [src/components/features/reviews/review-form.tsx](src/components/features/reviews/review-form.tsx)

**Líneas:** 15-100
**Cambio:** Agregar nuevos campos y validaciones

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema, ReviewFormData } from '@/lib/validations/review';

interface Props {
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onCancel?: () => void;
}

export default function ReviewForm({ onSubmit, onCancel }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dishes, setDishes] = useState<string[]>([]);
  const [currentDish, setCurrentDish] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  });

  const handleFormSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        recommendedDishes: dishes.length > 0 ? dishes : undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      reset();
      setDishes([]);
      setTags([]);
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDish = () => {
    if (currentDish.trim() && dishes.length < 10) {
      setDishes([...dishes, currentDish.trim()]);
      setCurrentDish('');
    }
  };

  const removeDish = (index: number) => {
    setDishes(dishes.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (currentTag.trim() && tags.length < 10) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Rating *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              {...register('rating', { valueAsNumber: true })}
              className="star-button"
            >
              ⭐
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Title * <span className="text-gray-500 text-xs">(5-100 characters)</span>
        </label>
        <input
          type="text"
          {...register('title')}
          placeholder="Excellent food"
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Your Review * <span className="text-gray-500 text-xs">(10-1000 characters)</span>
        </label>
        <textarea
          {...register('content')}
          rows={4}
          placeholder="Tell us about your experience..."
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>

      {/* Visit Date */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Visit Date (optional)
        </label>
        <input
          type="date"
          {...register('visitDate')}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.visitDate && (
          <p className="text-red-500 text-sm mt-1">{errors.visitDate.message}</p>
        )}
      </div>

      {/* Recommended Dishes */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Recommended Dishes (optional) <span className="text-gray-500 text-xs">Max 10</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={currentDish}
            onChange={(e) => setCurrentDish(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDish())}
            placeholder="Dish name"
            maxLength={50}
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <button
            type="button"
            onClick={addDish}
            disabled={!currentDish.trim() || dishes.length >= 10}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {dishes.map((dish, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2"
            >
              {dish}
              <button
                type="button"
                onClick={() => removeDish(index)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Tags (optional) <span className="text-gray-500 text-xs">Max 10</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Tag"
            maxLength={30}
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <button
            type="button"
            onClick={addTag}
            disabled={!currentTag.trim() || tags.length >= 10}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 rounded-full text-sm flex items-center gap-2"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
```

---

### Fase 3: Validaciones (IMPORTANTE)

#### 3.1 Actualizar [src/lib/validations/auth.ts](src/lib/validations/auth.ts)

**Líneas:** 8-12
**Cambio:** Agregar validación completa de password

**Diff:**
```diff
export const registerSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
- password: z.string().min(8, "Password must be at least 8 characters"),
+ password: z.string()
+   .min(8, "Password must be at least 8 characters")
+   .max(128, "Password must not exceed 128 characters")
+   .regex(/^(?=.*[a-z])/, "Must contain at least one lowercase letter")
+   .regex(/^(?=.*[A-Z])/, "Must contain at least one uppercase letter")
+   .regex(/^(?=.*\d)/, "Must contain at least one number")
+   .regex(/^(?=.*[@$!%*?&])/, "Must contain at least one special character (@$!%*?&)"),
});
```

---

## Resumen de Cambios

### Archivos a Modificar (8)

| # | Archivo | Líneas | Esfuerzo | Prioridad |
|---|---------|--------|----------|-----------|
| 1 | `src/lib/api/config.ts` | +30 | 1h | P0 |
| 2 | `src/lib/api/auth.ts` | +80 | 2h | P0 |
| 3 | `src/components/auth/register-client.tsx` | +1 | 5s | P0 |
| 4 | `src/types/index.ts` | Modificar interface | 30min | P0 |
| 5 | `src/components/features/reviews/review-form.tsx` | Reescribir | 2h | P0 |
| 6 | `src/lib/validations/auth.ts` | +6 | 15min | P1 |
| 7 | `src/lib/api/restaurants.ts` | Mock condicional | 15min | P2 |
| 8 | `src/lib/api/search.ts` | lat→latitude | 15min | P2 |

### Archivos a Crear (5)

| # | Archivo | Propósito | Esfuerzo | Prioridad |
|---|---------|-----------|----------|-----------|
| 1 | `src/lib/validations/review.ts` | Validaciones Zod | 30min | P0 |
| 2 | `src/lib/adapters/review-adapter.ts` | Backward compatibility | 1h | P0 |
| 3 | `src/lib/store/rate-limit.ts` | Store de rate limit | 30min | P1 |
| 4 | `src/types/geospatial.ts` | Tipos geoespaciales | 20min | P2 |
| 5 | `src/components/ui/rate-limit-indicator.tsx` | UI de rate limit | 30min | P2 |

### Estimación Total

| Prioridad | Archivos | Tiempo Estimado |
|-----------|----------|-----------------|
| P0 (Crítico) | 7 | 6-7 horas |
| P1 (Importante) | 2 | 1 hora |
| P2 (Mejoras) | 4 | 1.5 horas |
| **TOTAL** | **13** | **8-10 horas** |

---

## Testing

### Unit Tests a Crear

```typescript
// tests/api/config.test.ts
// tests/validations/auth.test.ts
// tests/validations/review.test.ts
// tests/adapters/review-adapter.test.ts
```

### Integration Tests

```typescript
// tests/integration/auth-flow.test.ts
// tests/integration/review-crud.test.ts
```

### E2E Tests

```typescript
// e2e/auth.spec.ts
// e2e/reviews.spec.ts
```

---

## Rollback Plan

En caso de issues:

1. Revertir commits de la feature
2. Restaurar localStorage (limpiar refreshTokens)
3. Usuarios deben re-login

---

**Este documento debe usarse POST-reunión con backend**

Próximos pasos:
1. Reunión con backend (usar [BACKEND_DISCUSSION_POINTS.md](BACKEND_DISCUSSION_POINTS.md))
2. Backend confirma endpoints
3. Implementar cambios usando este documento
4. Testing exhaustivo
5. Deploy coordinado

---

**Documento preparado por:** Frontend Team
**Fecha:** 17 de Enero de 2025
**Status:** Ready for implementation (post-backend confirmation)
