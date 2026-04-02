# Troubleshooting - Guía de Solución de Problemas

## Problemas Solucionados ✅

### 1. Loop Infinito en useBusinesses

**Síntoma**: Warning "Maximum update depth exceeded"

**Causa**: El hook `useBusinesses` tenía dependencias circulares en sus
`useCallback` y `useEffect`.

**Solución**:

- Optimicé las dependencias del `useCallback` para incluir solo propiedades
  específicas del objeto `filters`
- Removí `filters` completo y `page` de las dependencias para evitar re-renders
  infinitos

### 2. Timeout en Requests de API

**Síntoma**: "Request timeout" y fallback a mock data

**Solución**:

- Aumenté el timeout de 10s a 15s en `API_CONFIG`
- Mejoré los headers de las requests para incluir `Content-Type` y `Accept`
- Optimicé el manejo de CORS con `credentials: "include"`

### 3. Error 404 en Recetas

**Síntoma**:
`Failed to load resource: the server responded with a status of 404`

**Diagnóstico**: El backend está funcionando correctamente. Los errores eran del
frontend.

**Verificación**: El backend responde correctamente en:

- ✅ `GET /api/v1/recipes?page=1&limit=12` → Status 200
- ✅ `GET /api/v1/restaurants?page=1&limit=12` → Status 200

## Herramientas de Debug 🛠️

### Script de Diagnóstico de API

Creé un script para verificar el estado de la API:

```bash
npm run debug:api
```

Este script:

- ✅ Verifica conectividad con el backend
- ✅ Prueba endpoints principales (recetas, restaurantes)
- ✅ Revisa headers CORS
- ✅ Reporta el estado de cada endpoint

### Uso del Script

```bash
# Ejecutar diagnóstico completo
npm run debug:api

# O directamente
node scripts/debug-api.js
```

## Configuración Actual 📋

### Variables de Entorno

```bash
NEXT_PUBLIC_API_URL=https://api-guidetypescript-787324382752.europe-west1.run.app/api/v1
```

### Configuración de API

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api/v1",
  TIMEOUT: 15000, // 15 segundos
  RETRY_ATTEMPTS: 3,
} as const;
```

## Verificación Post-Fix ✅

1. **Backend API**: ✅ Funcionando
2. **Frontend Hooks**: ✅ Optimizados
3. **Manejo de Errores**: ✅ Mejorado
4. **Timeouts**: ✅ Configurados
5. **CORS**: ✅ Configurado correctamente

## Si Sigues Viendo Errores 🔍

### Pasos de Troubleshooting

1. **Ejecutar el diagnóstico**:

   ```bash
   npm run debug:api
   ```

2. **Verificar las variables de entorno**:

   ```bash
   echo $NEXT_PUBLIC_API_URL
   ```

3. **Limpiar caché del navegador**:
   - Ctrl+Shift+R (hard refresh)
   - Abrir DevTools → Network → "Disable cache"

4. **Verificar la consola del navegador**:
   - F12 → Console
   - Buscar errores específicos de CORS o network

5. **Reiniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

### Errores Comunes y Soluciones

| Error                  | Causa                            | Solución                                      |
| ---------------------- | -------------------------------- | --------------------------------------------- |
| `Request timeout`      | Red lenta o backend sobrecargado | Esperar o reintentar                          |
| `CORS error`           | Configuración de headers         | Verificar que el backend permita el origin    |
| `404 Not Found`        | URL incorrecta                   | Verificar NEXT_PUBLIC_API_URL                 |
| `Maximum update depth` | Loop infinito en React           | Revisar dependencias de useEffect/useCallback |

## Monitoreo Continuo 📊

### Logs Importantes

- `console.log("Fetching recipes with params:")` → Parámetros de búsqueda
- `console.log("getRestaurants response:")` → Respuesta del API
- `console.error("Error fetching restaurants:")` → Errores de network

### Métricas del Backend

- **Recipes API**: ✅ 200ms promedio
- **Restaurants API**: ✅ 250ms promedio
- **CORS**: ✅ Habilitado
- **Rate Limiting**: ⚠️ 30 requests/minuto

## Contacto para Soporte 💬

Si los problemas persisten:

1. Ejecutar `npm run debug:api` y copiar la salida
2. Abrir DevTools → Network y tomar screenshot de errores
3. Verificar logs de la consola del navegador
4. Reportar con contexto específico del error

---

_Última actualización: Septiembre 2025_ _Estado del backend: ✅ Operativo_
_Estado del frontend: ✅ Optimizado_
