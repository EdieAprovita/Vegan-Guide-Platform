# Cambios Requeridos en Backend - API v2.3.0

**Fecha:** 17 de Enero de 2025
**Autor:** Frontend Team
**Para:** Backend Team
**Propósito:** Documentar cambios, confirmaciones y migraciones necesarias en el backend

---

## Resumen Ejecutivo

Este documento especifica los cambios, confirmaciones y migraciones que el equipo de backend necesita implementar o confirmar para alinear la API con el contrato v2.3.0 y las necesidades del frontend.

**Items Críticos:**
- ✅ Confirmar funcionamiento de `/auth/refresh-token`
- ✅ Migrar esquema de Reviews (breaking change)
- ✅ Confirmar validaciones exactas
- ⏸️ Implementar soporte de backward compatibility para Reviews

**Timeline Estimado:** 1-2 semanas

---

## Tabla de Contenidos

1. [Endpoints a Confirmar](#1-endpoints-a-confirmar)
2. [Migración de Reviews](#2-migración-de-reviews)
3. [Validaciones](#3-validaciones)
4. [Rate Limiting](#4-rate-limiting)
5. [Estructura de Respuestas](#5-estructura-de-respuestas)
6. [Testing en Staging](#6-testing-en-staging)

---

## 1. Endpoints a Confirmar

### 1.1 POST /auth/refresh-token

**Status:** Mencionado en contrato, no confirmado funcionamiento

#### Request Esperado:

```http
POST /api/v1/auth/refresh-token HTTP/1.1
Content-Type: application/json
Cookie: jwt=<optional>

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response Esperado:

```http
HTTP/1.1 200 OK
Set-Cookie: jwt=<nuevo_access_token>; HttpOnly; Secure; SameSite=Strict; Max-Age=900
Content-Type: application/json

{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Casos de Error:

**Refresh token inválido:**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "success": false,
  "message": "Invalid refresh token",
  "error": "Unauthorized"
}
```

**Refresh token expirado:**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "success": false,
  "message": "Refresh token expired",
  "error": "TokenExpiredError"
}
```

**Refresh token revocado:**
```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "success": false,
  "message": "Refresh token has been revoked",
  "error": "Forbidden"
}
```

#### Preguntas para Backend:

1. ✅ ¿Este endpoint ya está implementado y desplegado en producción?
2. ✅ ¿El refreshToken se invalida al usarse (rotating refresh)?
3. ✅ ¿Se actualiza la cookie `jwt` automáticamente en la respuesta?
4. ✅ ¿Hay límite de rate limiting para este endpoint?
5. ✅ ¿Qué pasa si llega un request con refreshToken válido pero usuario eliminado?

#### Testing Requerido:

```bash
# Test 1: Refresh token válido
curl -X POST https://api-guidetypescript-787324382752.europe-west1.run.app/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<token_valido>"}'

# Expected: 200 + nuevo accessToken y refreshToken

# Test 2: Refresh token inválido
curl -X POST https://api-guidetypescript-787324382752.europe-west1.run.app/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "invalid_token"}'

# Expected: 401 Unauthorized

# Test 3: Sin refreshToken en body
curl -X POST https://api-guidetypescript-787324382752.europe-west1.run.app/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 400 Bad Request
```

#### Implementación Sugerida (Si no existe):

```javascript
// controllers/authController.js
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
        error: 'Bad Request'
      });
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Verificar que no esté en blacklist
    const isBlacklisted = await RefreshToken.findOne({
      token: refreshToken,
      isRevoked: true
    });

    if (isBlacklisted) {
      return res.status(403).json({
        success: false,
        message: 'Refresh token has been revoked',
        error: 'Forbidden'
      });
    }

    // Buscar usuario
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        error: 'Unauthorized'
      });
    }

    // Generar nuevos tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // OPCIONAL: Invalidar refresh token anterior (rotating refresh)
    await RefreshToken.updateOne(
      { token: refreshToken },
      { isRevoked: true, revokedAt: new Date() }
    );

    // Guardar nuevo refresh token
    await RefreshToken.create({
      token: newRefreshToken,
      user: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
    });

    // Establecer cookie con access token
    res.cookie('jwt', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutos
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        error: 'Unauthorized'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired',
        error: 'TokenExpiredError'
      });
    }

    next(error);
  }
};
```

#### Checklist Backend:

- [ ] Endpoint `/auth/refresh-token` existe y funciona
- [ ] Retorna estructura correcta: `{success, data: {accessToken, refreshToken}}`
- [ ] Actualiza cookie `jwt` con nuevo access token
- [ ] Maneja todos los casos de error correctamente
- [ ] Implementa rotating refresh (invalida token anterior)
- [ ] Tiene rate limiting apropiado (5 requests/15min)
- [ ] Testeado en staging environment

---

### 1.2 POST /auth/logout

**Status:** Mencionado en contrato, no usado por frontend

#### Request Esperado:

```http
POST /api/v1/auth/logout HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Cookie: jwt=<access_token>
```

#### Response Esperado:

```http
HTTP/1.1 200 OK
Set-Cookie: jwt=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
Content-Type: application/json

{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Comportamiento Esperado:

1. ✅ Blacklistear el access token actual
2. ✅ Invalidar el refresh token asociado al usuario
3. ✅ Eliminar cookie `jwt` (Max-Age=0)
4. ✅ Retornar 200 OK

#### Implementación Sugerida:

```javascript
exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];

    if (token) {
      // Blacklistear access token
      await TokenBlacklist.create({
        token: token,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 min
      });

      // Invalidar refresh token del usuario
      await RefreshToken.updateMany(
        { user: req.user._id, isRevoked: false },
        { isRevoked: true, revokedAt: new Date() }
      );
    }

    // Eliminar cookie
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};
```

#### Checklist Backend:

- [ ] Endpoint `/auth/logout` existe
- [ ] Blacklistea access token
- [ ] Invalida refresh token
- [ ] Elimina cookie `jwt`
- [ ] Testeado

---

### 1.3 POST /auth/revoke-all-tokens

**Status:** Mencionado en contrato, no implementado en frontend

#### Request Esperado:

```http
POST /api/v1/auth/revoke-all-tokens HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response Esperado:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "All tokens revoked successfully"
}
```

#### Comportamiento Esperado:

1. ✅ Invalidar **TODOS** los refresh tokens del usuario
2. ✅ Blacklistear access token actual
3. ✅ Retornar 200 OK

**Caso de Uso:** Usuario sospecha que su cuenta fue comprometida y quiere cerrar sesión en todos los dispositivos

#### Implementación Sugerida:

```javascript
exports.revokeAllTokens = async (req, res, next) => {
  try {
    // Invalidar todos los refresh tokens del usuario
    const result = await RefreshToken.updateMany(
      { user: req.user._id, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() }
    );

    console.log(`Revoked ${result.modifiedCount} refresh tokens for user ${req.user._id}`);

    // Blacklistear access token actual
    const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];
    if (token) {
      await TokenBlacklist.create({
        token: token,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      });
    }

    res.status(200).json({
      success: true,
      message: 'All tokens revoked successfully'
    });
  } catch (error) {
    next(error);
  }
};
```

#### Checklist Backend:

- [ ] Endpoint `/auth/revoke-all-tokens` existe
- [ ] Invalida TODOS los refresh tokens del usuario
- [ ] Blacklistea access token actual
- [ ] Retorna mensaje de éxito
- [ ] Testeado

---

### 1.4 Verificación de Estructura de Respuestas

#### Todas las respuestas deben seguir este formato:

**Success:**
```json
{
  "success": true,
  "data": <objeto_o_array>,
  "message": "Optional success message",
  "pagination": {  // Solo si aplica
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "ErrorType",
  "errors": [  // Solo para validation errors
    {
      "field": "field_name",
      "message": "Specific error",
      "value": "invalid_value"
    }
  ]
}
```

#### Checklist Backend:

- [ ] Todas las responses siguen formato estándar
- [ ] Validation errors incluyen array `errors` con detalles
- [ ] Responses paginadas incluyen objeto `pagination`
- [ ] Status codes son consistentes:
  - 200 OK (success)
  - 201 Created (resource created)
  - 400 Bad Request (validation error)
  - 401 Unauthorized (auth error)
  - 403 Forbidden (permission error)
  - 404 Not Found (resource not found)
  - 409 Conflict (duplicate)
  - 429 Too Many Requests (rate limit)
  - 500 Internal Server Error (server error)

---

## 2. Migración de Reviews

### 2.1 Estado Actual de la Base de Datos

#### Preguntas Críticas:

1. ✅ ¿Cuántas reviews existen actualmente en producción?
   ```javascript
   db.reviews.count()
   ```

2. ✅ ¿Las reviews actuales tienen el campo `comment` o ya fueron migradas?
   ```javascript
   db.reviews.findOne()
   ```

3. ✅ ¿El modelo de Review en backend ya requiere `title` y `content` como obligatorios?
   ```javascript
   // Verificar el schema en models/Review.js
   ```

### 2.2 Esquema Objetivo (Según Contrato)

```javascript
// models/Review.js
const reviewSchema = new mongoose.Schema({
  // Campos obligatorios
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please provide review content'],
    minlength: [10, 'Content must be at least 10 characters'],
    maxlength: [1000, 'Content cannot exceed 1000 characters']
  },

  // Campos opcionales
  visitDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return v <= new Date();  // No puede ser en el futuro
      },
      message: 'Visit date cannot be in the future'
    }
  },
  recommendedDishes: [{
    type: String,
    maxlength: [50, 'Each dish name cannot exceed 50 characters']
  }],
  tags: [{
    type: String,
    maxlength: [30, 'Each tag cannot exceed 30 characters']
  }],

  // Relaciones
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entityType: {
    type: String,
    required: true,
    enum: ['Restaurant', 'Recipe', 'Market', 'Doctor', 'Business', 'Sanctuary']
  },
  entity: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'entityType'
  },

  // Helpful votes
  helpfulCount: {
    type: Number,
    default: 0
  },
  helpfulVotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
reviewSchema.index({ entity: 1, author: 1 }, { unique: true });
reviewSchema.index({ title: 'text', content: 'text' });
```

### 2.3 Script de Migración Propuesto

#### Opción A: Migración Completa (Recomendado para <10K reviews)

```javascript
// scripts/migrate-reviews.js

const mongoose = require('mongoose');
const Review = require('./models/Review');

async function migrateReviews() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Encontrar todas las reviews con campo 'comment' (formato antiguo)
    const oldReviews = await Review.find({
      comment: { $exists: true },
      title: { $exists: false }
    });

    console.log(`Found ${oldReviews.length} reviews to migrate`);

    let migrated = 0;
    let errors = 0;

    for (const review of oldReviews) {
      try {
        // Generar título desde comment (primeros 50 chars)
        let title = review.comment.trim().substring(0, 50);
        if (review.comment.length > 50) {
          title += '...';
        }

        // Si el título generado es <5 chars, usar fallback
        if (title.length < 5) {
          title = `Review ${review.rating} stars`;
        }

        // Actualizar review
        await Review.updateOne(
          { _id: review._id },
          {
            $set: {
              title: title,
              content: review.comment,
              visitDate: review.createdAt,  // Default a fecha de creación
              recommendedDishes: [],        // Array vacío
              tags: []                      // Array vacío
            },
            $unset: {
              comment: ''  // Eliminar campo antiguo
            }
          }
        );

        migrated++;

        if (migrated % 100 === 0) {
          console.log(`Migrated ${migrated} reviews...`);
        }

      } catch (error) {
        console.error(`Error migrating review ${review._id}:`, error.message);
        errors++;
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Successfully migrated: ${migrated}`);
    console.log(`Errors: ${errors}`);
    console.log(`Total processed: ${migrated + errors}`);

    // Verificar
    const remaining = await Review.countDocuments({ comment: { $exists: true } });
    console.log(`Reviews with 'comment' field remaining: ${remaining}`);

    await mongoose.disconnect();

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Ejecutar
migrateReviews();
```

**Ejecutar:**
```bash
# En staging primero!
NODE_ENV=staging MONGODB_URI=<staging_uri> node scripts/migrate-reviews.js

# Después en producción
NODE_ENV=production MONGODB_URI=<production_uri> node scripts/migrate-reviews.js
```

#### Opción B: Migración con Backward Compatibility (Recomendado para >10K reviews)

**Fase 1: Actualizar modelo para aceptar ambos formatos**

```javascript
// models/Review.js (temporal)
const reviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true, min: 1, max: 5 },

  // TEMPORAL: Ambos campos opcionales durante transición
  comment: {
    type: String,
    minlength: 10,
    maxlength: 1000,
    // Deprecated: usar 'content' en su lugar
  },
  title: {
    type: String,
    minlength: 5,
    maxlength: 100,
    trim: true,
    // Será required después de migración
  },
  content: {
    type: String,
    minlength: 10,
    maxlength: 1000,
    // Será required después de migración
  },

  visitDate: { type: Date },
  recommendedDishes: [{ type: String, maxlength: 50 }],
  tags: [{ type: String, maxlength: 30 }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entityType: { type: String, required: true, enum: ['Restaurant', 'Recipe', 'Market', 'Doctor', 'Business', 'Sanctuary'] },
  entity: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'entityType' },
  helpfulCount: { type: Number, default: 0 },
  helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Validación custom durante transición
reviewSchema.pre('validate', function(next) {
  // Si tiene 'content', todo ok
  if (this.content) {
    return next();
  }

  // Si tiene 'comment', migrar automáticamente
  if (this.comment && !this.content) {
    this.content = this.comment;

    // Generar título si no existe
    if (!this.title) {
      this.title = this.comment.substring(0, 50).trim();
      if (this.comment.length > 50) {
        this.title += '...';
      }
      if (this.title.length < 5) {
        this.title = `Review ${this.rating} stars`;
      }
    }
  }

  next();
});

// Virtual para mantener compatibilidad en GET requests
reviewSchema.virtual('comment').get(function() {
  return this.content;  // Retornar content como comment
});
```

**Fase 2: Migración en background**

```javascript
// scripts/migrate-reviews-background.js

const BATCH_SIZE = 100;
const DELAY_BETWEEN_BATCHES = 1000; // 1 segundo

async function migrateInBatches() {
  let skip = 0;
  let migrated = 0;

  while (true) {
    const reviews = await Review.find({
      comment: { $exists: true },
      title: { $exists: false }
    })
    .limit(BATCH_SIZE)
    .skip(skip);

    if (reviews.length === 0) {
      break;  // No hay más reviews
    }

    for (const review of reviews) {
      try {
        let title = review.comment.substring(0, 50).trim();
        if (review.comment.length > 50) title += '...';
        if (title.length < 5) title = `Review ${review.rating} stars`;

        await Review.updateOne(
          { _id: review._id },
          {
            $set: {
              title: title,
              content: review.comment,
              visitDate: review.createdAt,
              recommendedDishes: [],
              tags: []
            }
            // NO eliminar 'comment' aún (backward compatibility)
          }
        );

        migrated++;
      } catch (error) {
        console.error(`Error migrating ${review._id}:`, error.message);
      }
    }

    console.log(`Migrated batch: ${migrated} total`);

    // Delay entre batches para no sobrecargar DB
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));

    skip += BATCH_SIZE;
  }

  console.log(`Migration complete: ${migrated} reviews migrated`);
}

migrateInBatches();
```

**Fase 3: Cleanup (después de 2-4 semanas)**

```javascript
// scripts/cleanup-old-reviews.js

async function cleanupOldFields() {
  // Eliminar campo 'comment' deprecated
  const result = await Review.updateMany(
    { comment: { $exists: true } },
    { $unset: { comment: '' } }
  );

  console.log(`Cleaned up ${result.modifiedCount} reviews`);

  // Actualizar modelo para hacer title y content required
  // models/Review.js - cambiar:
  // title: { type: String, required: true, ... }
  // content: { type: String, required: true, ... }
}
```

### 2.4 Estrategia Recomendada

**Para Vegan Guide Platform:**

Basándome en el análisis, recomiendo **Opción B (Backward Compatibility)** porque:

1. ✅ Sin downtime
2. ✅ Rollback fácil
3. ✅ Migración gradual
4. ✅ Frontend y backend pueden desplegarse independientemente
5. ✅ Testing más seguro

**Timeline:**

- **Semana 1:** Backend implementa soporte dual + migración en staging
- **Semana 2:** Frontend se actualiza (usa nuevos campos)
- **Semana 3:** Migración en producción (background, sin downtime)
- **Semana 4:** Monitoring y validación
- **Semana 5-6:** Cleanup (eliminar campo 'comment' deprecated)

### 2.5 Testing de Migración

```bash
# Test 1: Verificar reviews antiguas
curl https://api-guidetypescript-787324382752.europe-west1.run.app/api/v1/restaurants/123/reviews

# Expected: Todas las reviews tienen 'title', 'content', 'comment' (deprecated)

# Test 2: Crear review con formato nuevo
curl -X POST https://api-guidetypescript-787324382752.europe-west1.run.app/api/v1/restaurants/123/reviews \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "title": "Excellent food",
    "content": "The best vegan tacos I have ever had. Highly recommend!",
    "visitDate": "2025-01-15",
    "recommendedDishes": ["Tacos al pastor", "Guacamole"],
    "tags": ["authentic", "family-friendly"]
  }'

# Expected: 201 Created

# Test 3: Crear review con formato antiguo (debería adaptarse)
curl -X POST https://api-guidetypescript-787324382752.europe-west1.run.app/api/v1/restaurants/123/reviews \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "comment": "Good food, nice ambiance"
  }'

# Expected: 201 Created (backend genera 'title' y 'content' automáticamente)
```

### Checklist Backend - Migración de Reviews:

- [ ] Responder: ¿Cuántas reviews existen actualmente?
- [ ] Decidir estrategia: Migración completa (A) o Backward compatibility (B)
- [ ] Implementar soporte dual en modelo (si Opción B)
- [ ] Crear y testear script de migración en staging
- [ ] Ejecutar migración en staging
- [ ] Validar que no hay data loss
- [ ] Coordinar con frontend para deploy
- [ ] Ejecutar migración en producción
- [ ] Monitoring post-migración
- [ ] Documentar proceso

---

## 3. Validaciones

### 3.1 Password Validation

#### Regex Exacto (según contrato):

```regex
/^(?=[^\n]{8,128}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).*$/
```

#### Preguntas para Backend:

1. ✅ ¿Este es el regex EXACTO que backend valida?
2. ✅ ¿Backend acepta otros caracteres especiales además de `@$!%*?&`?
   - Ejemplo: `#`, `^`, `()`, `[]`, etc.
3. ✅ ¿Hay validación de caracteres Unicode? (emojis, acentos)
4. ✅ ¿Cuál es el mensaje de error exacto que backend retorna?

#### Implementación Esperada:

```javascript
// validators/auth.js
const passwordRegex = /^(?=[^\n]{8,128}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).*$/;

function validatePassword(password) {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }

  if (password.length > 128) {
    return { valid: false, message: 'Password must not exceed 128 characters' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  if (!/[@$!%*?&]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (@$!%*?&)' };
  }

  return { valid: true };
}

module.exports = { validatePassword };
```

#### Testing:

```javascript
// tests/validators/auth.test.js
describe('Password Validation', () => {
  const testCases = [
    { password: 'password', valid: false, reason: 'no uppercase, number, special' },
    { password: 'PASSWORD', valid: false, reason: 'no lowercase, number, special' },
    { password: 'Password', valid: false, reason: 'no number, special' },
    { password: 'Password123', valid: false, reason: 'no special' },
    { password: 'Password!', valid: false, reason: 'no number' },
    { password: 'Pass1!', valid: false, reason: 'less than 8 chars' },
    { password: 'Password123!', valid: true },
    { password: 'MyPass@2024', valid: true },
    { password: 'Secure$Pass1', valid: true },
    { password: 'A1b2C3d4!', valid: true }
  ];

  testCases.forEach(({ password, valid, reason }) => {
    it(`should ${valid ? 'accept' : 'reject'} "${password}" (${reason || 'valid'})`, () => {
      const result = validatePassword(password);
      expect(result.valid).toBe(valid);
    });
  });
});
```

### 3.2 Review Validation

#### Validaciones Requeridas (según contrato):

```javascript
// validators/review.js
function validateReview(data) {
  const errors = [];

  // Rating
  if (!data.rating || data.rating < 1 || data.rating > 5) {
    errors.push({
      field: 'rating',
      message: 'Rating must be between 1 and 5',
      value: data.rating
    });
  }

  // Title
  if (!data.title || data.title.trim().length < 5) {
    errors.push({
      field: 'title',
      message: 'Title must be at least 5 characters',
      value: data.title
    });
  }

  if (data.title && data.title.length > 100) {
    errors.push({
      field: 'title',
      message: 'Title cannot exceed 100 characters',
      value: data.title
    });
  }

  // Content
  if (!data.content || data.content.trim().length < 10) {
    errors.push({
      field: 'content',
      message: 'Content must be at least 10 characters',
      value: data.content
    });
  }

  if (data.content && data.content.length > 1000) {
    errors.push({
      field: 'content',
      message: 'Content cannot exceed 1000 characters',
      value: data.content
    });
  }

  // Visit Date (opcional, pero no puede ser futura)
  if (data.visitDate) {
    const visitDate = new Date(data.visitDate);
    if (visitDate > new Date()) {
      errors.push({
        field: 'visitDate',
        message: 'Visit date cannot be in the future',
        value: data.visitDate
      });
    }
  }

  // Recommended Dishes (opcional)
  if (data.recommendedDishes) {
    if (!Array.isArray(data.recommendedDishes)) {
      errors.push({
        field: 'recommendedDishes',
        message: 'Recommended dishes must be an array',
        value: data.recommendedDishes
      });
    } else {
      data.recommendedDishes.forEach((dish, index) => {
        if (dish.length > 50) {
          errors.push({
            field: `recommendedDishes[${index}]`,
            message: 'Each dish name cannot exceed 50 characters',
            value: dish
          });
        }
      });
    }
  }

  // Tags (opcional)
  if (data.tags) {
    if (!Array.isArray(data.tags)) {
      errors.push({
        field: 'tags',
        message: 'Tags must be an array',
        value: data.tags
      });
    } else {
      data.tags.forEach((tag, index) => {
        if (tag.length > 30) {
          errors.push({
            field: `tags[${index}]`,
            message: 'Each tag cannot exceed 30 characters',
            value: tag
          });
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Checklist Backend - Validaciones:

- [ ] Confirmar password regex exacto
- [ ] Confirmar lista completa de caracteres especiales aceptados
- [ ] Confirmar validaciones de Review (title, content, arrays)
- [ ] Confirmar límites de arrays (recommendedDishes, tags)
- [ ] Confirmar si visitDate valida que no sea futuro
- [ ] Compartir tests unitarios de validaciones
- [ ] Documentar mensajes de error exactos

---

## 4. Rate Limiting

### 4.1 Headers Requeridos

#### Backend debe retornar estos headers en TODAS las responses:

```http
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1609459200
```

#### Implementación Sugerida (Express):

```javascript
// middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de requests
  message: {
    success: false,
    message: 'API rate limit exceeded',
    error: 'TooManyRequests'
  },
  standardHeaders: true, // Retornar headers `RateLimit-*`
  legacyHeaders: false, // Deshabilitar headers `X-RateLimit-*`
  handler: (req, res) => {
    const resetTime = new Date(req.rateLimit.resetTime);
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

    res.status(429).header('Retry-After', retryAfter).json({
      success: false,
      message: 'API rate limit exceeded',
      error: 'TooManyRequests'
    });
  }
});

module.exports = limiter;
```

#### Rate Limits Específicos (según contrato):

```javascript
// middleware/rateLimiters.js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts',
    error: 'TooManyRequests'
  },
  standardHeaders: true
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,
  message: {
    success: false,
    message: 'Too many registration attempts',
    error: 'TooManyRequests'
  },
  standardHeaders: true
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30,
  message: {
    success: false,
    message: 'Search rate limit exceeded',
    error: 'TooManyRequests'
  },
  standardHeaders: true
});

module.exports = {
  authLimiter,
  registerLimiter,
  searchLimiter
};
```

#### Uso en Rutas:

```javascript
// routes/auth.js
const { authLimiter, registerLimiter } = require('../middleware/rateLimiters');

router.post('/login', authLimiter, authController.login);
router.post('/register', registerLimiter, authController.register);
```

### Checklist Backend - Rate Limiting:

- [ ] Confirmar que headers `RateLimit-*` se retornan
- [ ] Confirmar comportamiento en 429 (incluye `Retry-After`)
- [ ] Confirmar si rate limiting es por IP, usuario o ambos
- [ ] Confirmar whitelist para IPs de desarrollo/testing
- [ ] Confirmar rate limits específicos por endpoint
- [ ] Documentar rate limits de todos los endpoints

---

## 5. Estructura de Respuestas

### 5.1 Response Estándar

**Todas las responses exitosas deben seguir:**

```json
{
  "success": true,
  "data": <objeto_o_array>,
  "message": "Optional success message",
  "pagination": {  // Solo si aplica
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

**Ejemplo - Single Resource:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "restaurantName": "El Buen Sabor",
    "address": "123 Main St",
    "rating": 4.5
  }
}
```

**Ejemplo - List con Paginación:**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "restaurantName": "..." },
    { "_id": "...", "restaurantName": "..." }
  ],
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

### 5.2 Error Response Estándar

**Todas las responses de error deben seguir:**

```json
{
  "success": false,
  "message": "Error general message",
  "error": "ErrorType",
  "errors": [  // Solo para validation errors
    {
      "field": "field_name",
      "message": "Specific error message",
      "value": "invalid_value"
    }
  ]
}
```

**Ejemplo - Validation Error:**
```json
HTTP 400 Bad Request

{
  "success": false,
  "message": "Validation failed",
  "error": "ValidationError",
  "errors": [
    {
      "field": "title",
      "message": "Title must be at least 5 characters",
      "value": "Hi"
    },
    {
      "field": "content",
      "message": "Content must be at least 10 characters",
      "value": "Good"
    }
  ]
}
```

**Ejemplo - Authentication Error:**
```json
HTTP 401 Unauthorized

{
  "success": false,
  "message": "Invalid or expired token",
  "error": "Unauthorized"
}
```

### Checklist Backend - Estructura de Respuestas:

- [ ] Todas las responses siguen formato estándar
- [ ] Field `success` siempre presente (true/false)
- [ ] Field `data` presente en success responses
- [ ] Field `message` presente en error responses
- [ ] Field `error` presente en error responses (tipo de error)
- [ ] Array `errors` presente solo en validation errors
- [ ] Objeto `pagination` presente en list responses
- [ ] Consistente en TODOS los endpoints

---

## 6. Testing en Staging

### 6.1 Ambiente de Staging Requerido

**Prerrequisitos:**

- [ ] URL de staging environment
- [ ] Base de datos de staging (con datos realistas)
- [ ] Acceso para frontend team
- [ ] Logs accesibles
- [ ] Monitoring básico

### 6.2 Test Cases Críticos

#### Test Suite 1: Refresh Token Flow

```bash
#!/bin/bash

# Test 1: Login y obtener tokens
echo "Test 1: Login"
RESPONSE=$(curl -s -X POST https://staging-api.../api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Password123!"}' \
  -c cookies.txt)

echo $RESPONSE | jq .

# Extraer refreshToken
REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.data.refreshToken')

# Test 2: Usar refresh token
echo "Test 2: Refresh token"
NEW_TOKENS=$(curl -s -X POST https://staging-api.../api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

echo $NEW_TOKENS | jq .

# Test 3: Usar token inválido
echo "Test 3: Invalid refresh token"
INVALID_RESPONSE=$(curl -s -X POST https://staging-api.../api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "invalid_token"}')

echo $INVALID_RESPONSE | jq .
# Expected: 401 Unauthorized
```

#### Test Suite 2: Reviews Migration

```bash
#!/bin/bash

# Test 1: Leer reviews antiguas
echo "Test 1: Get old reviews"
curl -s https://staging-api.../api/v1/restaurants/123/reviews | jq .
# Expected: Todas tienen 'title', 'content', y opcionalmente 'comment'

# Test 2: Crear review con formato nuevo
echo "Test 2: Create review (new format)"
curl -s -X POST https://staging-api.../api/v1/restaurants/123/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "title": "Excellent food",
    "content": "The best vegan tacos...",
    "visitDate": "2025-01-15",
    "recommendedDishes": ["Tacos", "Guacamole"],
    "tags": ["authentic"]
  }' | jq .
# Expected: 201 Created

# Test 3: Crear review con formato antiguo (backward compatibility)
echo "Test 3: Create review (old format)"
curl -s -X POST https://staging-api.../api/v1/restaurants/123/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "comment": "Good food"
  }' | jq .
# Expected: 201 Created (backend genera title/content)
```

#### Test Suite 3: Validations

```bash
#!/bin/bash

# Test 1: Password inválido
echo "Test 1: Invalid password"
curl -s -X POST https://staging-api.../api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password"
  }' | jq .
# Expected: 400 con errores de validación

# Test 2: Review sin title
echo "Test 2: Review without title"
curl -s -X POST https://staging-api.../api/v1/restaurants/123/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "content": "Great food"
  }' | jq .
# Expected: 400 Validation Error
```

### 6.3 Performance Testing

```bash
# Test de carga básico con Apache Bench
ab -n 1000 -c 10 https://staging-api.../api/v1/restaurants?page=1&limit=10

# Expected:
# - 95% de requests < 500ms
# - 0% de errores
# - Rate limiting funciona correctamente
```

### Checklist Backend - Testing:

- [ ] Staging environment disponible
- [ ] Frontend team tiene acceso
- [ ] Refresh token flow testeado
- [ ] Migración de reviews testeada
- [ ] Backward compatibility testeada
- [ ] Validaciones testeadas
- [ ] Rate limiting testeado
- [ ] Performance acceptable (<500ms p95)
- [ ] Documentación de staging actualizada

---

## 7. Timeline y Milestones

### Semana 1: Confirmaciones y Preparación

**Backend Tasks:**
- [ ] Responder todas las preguntas de este documento
- [ ] Confirmar funcionamiento de `/auth/refresh-token`
- [ ] Preparar script de migración de reviews
- [ ] Testear script en staging
- [ ] Proveer acceso a staging para frontend

**Milestone:** Todos los endpoints confirmados, script de migración listo

---

### Semana 2: Implementación de Refresh Token

**Backend Tasks:**
- [ ] Implementar `/auth/logout` (si no existe)
- [ ] Implementar `/auth/revoke-all-tokens` (si no existe)
- [ ] Implementar blacklist de tokens
- [ ] Testear en staging
- [ ] Documentar flujo completo

**Milestone:** Sistema de refresh token 100% funcional en staging

---

### Semana 3: Migración de Reviews

**Backend Tasks:**
- [ ] Implementar soporte dual (comment + title/content)
- [ ] Ejecutar migración en staging
- [ ] Validar que no hay data loss
- [ ] Testear backward compatibility
- [ ] Coordinar con frontend para testing conjunto

**Milestone:** Migración exitosa en staging, 0 data loss

---

### Semana 4: Deploy en Producción

**Backend Tasks:**
- [ ] Deploy de código con soporte dual
- [ ] Ejecutar migración en producción (ventana de mantenimiento)
- [ ] Monitoring intensivo (logs, errors, performance)
- [ ] Hotfix cualquier issue crítico

**Milestone:** Sistema funcionando en producción

---

### Semana 5-6: Validación y Cleanup

**Backend Tasks:**
- [ ] Validar métricas de éxito
- [ ] Resolver issues menores
- [ ] Ejecutar cleanup (eliminar campo 'comment' deprecated)
- [ ] Actualizar documentación
- [ ] Post-mortem meeting

**Milestone:** Migración completada, documentación actualizada

---

## 8. Contacto y Coordinación

**Puntos de Contacto:**
- **Backend Lead:** [Nombre]
- **DevOps:** [Nombre]
- **Frontend Lead:** [Nombre]

**Canales de Comunicación:**
- **Slack:** `#api-v2-migration`
- **Reuniones:** Sincronización semanal (Lunes 10am)
- **Emergencias:** [Canal de emergencias]

**Documentos Relacionados:**
- [BACKEND_DISCUSSION_POINTS.md](BACKEND_DISCUSSION_POINTS.md) - Preguntas detalladas
- [API_DISCREPANCIES_v2.3.0.md](API_DISCREPANCIES_v2.3.0.md) - Análisis técnico
- [FRONTEND_CHANGES_REQUIRED.md](FRONTEND_CHANGES_REQUIRED.md) - Cambios en frontend

---

## Apéndice: Comandos Útiles

### Verificar Estado de Reviews

```javascript
// En MongoDB
db.reviews.aggregate([
  {
    $group: {
      _id: null,
      total: { $sum: 1 },
      withComment: { $sum: { $cond: [{ $ifNull: ['$comment', false] }, 1, 0] } },
      withTitle: { $sum: { $cond: [{ $ifNull: ['$title', false] }, 1, 0] } },
      withContent: { $sum: { $cond: [{ $ifNull: ['$content', false] }, 1, 0] } }
    }
  }
])

// Output esperado después de migración:
// { total: 150, withComment: 0, withTitle: 150, withContent: 150 }
```

### Rollback de Migración

```javascript
// Si algo sale mal, rollback:
db.reviews.updateMany(
  { content: { $exists: true }, comment: { $exists: false } },
  [
    {
      $set: {
        comment: '$content'
      }
    },
    {
      $unset: ['title', 'content', 'visitDate', 'recommendedDishes', 'tags']
    }
  ]
)
```

---

**Documento preparado por:** Frontend Team
**Fecha:** 17 de Enero de 2025
**Para revisión por:** Backend Team
**Próxima acción:** Backend responde preguntas y confirma timeline
