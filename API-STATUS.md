# Estado de la API - Vegan Guide Platform

## ✅ Estado General: OPERATIVO

Última verificación: Septiembre 2025

## 📊 Endpoints Disponibles

### 1. Recipes (/api/v1/recipes)
- **Estado**: ✅ Funcionando
- **Campos principales**:
  - `title`: Nombre de la receta
  - `description`: Descripción
  - `cookingTime`: Tiempo de cocción
  - `ingredients`: Lista de ingredientes
  - `instructions`: Instrucciones
  - `rating`: Calificación

### 2. Restaurants (/api/v1/restaurants) 
- **Estado**: ✅ Funcionando
- **Campos principales**:
  - `restaurantName`: Nombre del restaurante
  - `address`: Dirección
  - `rating`: Calificación
  - `cuisine`: Tipo de cocina
  - `contact`: Información de contacto
  - `location`: Coordenadas GPS

### 3. Doctors (/api/v1/doctors)
- **Estado**: ✅ Funcionando
- **Campos principales**:
  - `doctorName`: Nombre del doctor
  - `specialty`: Especialidad
  - `address`: Dirección
  - `contact`: Array con phone, email, facebook, instagram
  - `location`: Coordenadas GPS
  - `image`: URL de imagen

### 4. Markets (/api/v1/markets)
- **Estado**: ✅ Funcionando  
- **Campos principales**:
  - `marketName`: Nombre del mercado
  - `address`: Dirección
  - `typeMarket`: Tipo de mercado
  - `contact`: Información de contacto
  - `location`: Coordenadas GPS
  - `image`: URL de imagen

### 5. Businesses (/api/v1/businesses)
- **Estado**: ✅ Funcionando
- **Campos principales**:
  - Similar estructura a markets/restaurants

## 🔧 Configuración

### URL Base
```
https://api-guidetypescript-787324382752.europe-west1.run.app/api/v1
```

### Headers Requeridos
```javascript
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

### Parámetros de Query Comunes
- `page`: Número de página (default: 1)
- `limit`: Items por página (default: 10)
- `search`: Búsqueda de texto
- `sortBy`: Campo de ordenamiento

## 📝 Formato de Respuesta

Todas las respuestas siguen este formato:

```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [...] // Array de items
}
```

## 🛠️ Comandos Útiles

### Verificar Estado de la API
```bash
npm run debug:api
```

### Test Manual con curl
```bash
# Recipes
curl -s "https://api-guidetypescript-787324382752.europe-west1.run.app/api/v1/recipes?page=1&limit=3" | jq

# Restaurants
curl -s "https://api-guidetypescript-787324382752.europe-west1.run.app/api/v1/restaurants?page=1&limit=3" | jq

# Doctors
curl -s "https://api-guidetypescript-787324382752.europe-west1.run.app/api/v1/doctors?page=1&limit=3" | jq

# Markets
curl -s "https://api-guidetypescript-787324382752.europe-west1.run.app/api/v1/markets?page=1&limit=3" | jq
```

## ⚠️ Notas Importantes

1. **Nombres de campos**: Los campos en el backend usan nombres específicos como `doctorName`, `marketName`, `restaurantName` en lugar de un genérico `name`.

2. **Contact Array**: La información de contacto está en un array `contact[0]` con propiedades como `phone`, `email`, etc.

3. **Location**: Las coordenadas están en formato GeoJSON:
   ```json
   "location": {
     "type": "Point",
     "coordinates": [longitude, latitude]
   }
   ```

4. **Rate Limiting**: 30 requests por minuto

5. **CORS**: Configurado correctamente con `credentials: true`

## 🚀 Performance

- **Recipes**: ~200ms promedio
- **Restaurants**: ~250ms promedio  
- **Doctors**: ~180ms promedio
- **Markets**: ~190ms promedio
- **Timeout configurado**: 15 segundos

## 📱 Frontend Integration

Los hooks del frontend están optimizados para:
- Evitar loops infinitos
- Manejar errores gracefully
- Usar mock data cuando hay problemas de red
- Cachear resultados cuando es posible

---

*Generado automáticamente - Última actualización: Septiembre 2025*