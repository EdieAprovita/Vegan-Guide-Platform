# 🌱 Vegan Guide Platform

Una plataforma completa para la comunidad vegana que conecta usuarios con
restaurantes, mercados, doctores especializados, recetas y más.

## 🚀 Características

### 🍽️ **Restaurantes**

- Búsqueda y filtrado de restaurantes veganos
- Reseñas y calificaciones
- Información detallada (menús, horarios, ubicación)
- Sistema de recomendaciones

### 🛒 **Mercados**

- Directorio de mercados veganos y orgánicos
- Productos especializados
- Ubicaciones y horarios
- Reseñas de la comunidad

### 👨‍⚕️ **Doctores Especializados**

- Red de profesionales de la salud veganos
- Especialidades médicas
- Información de contacto y consultas
- Sistema de citas

### 📖 **Recetas**

- Biblioteca de recetas veganas
- Categorías por dificultad y tiempo
- Sistema de calificaciones
- Compartir recetas propias

### 🗺️ **Mapa Interactivo**

- Visualización geográfica de todos los servicios
- Búsqueda por ubicación
- Filtros avanzados

### 👥 **Comunidad**

- Sistema de posts y comentarios
- Logros y gamificación
- Notificaciones en tiempo real

### 📱 **PWA (Progressive Web App)**

- Instalable como aplicación nativa
- Funcionalidad offline
- Notificaciones push

## 🛠️ Tecnologías

### Frontend

- **Next.js 15** - Framework de React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS utility-first
- **Shadcn/ui** - Componentes de UI modernos
- **NextAuth.js** - Autenticación
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

### Estado y Datos

- **Zustand** - Gestión de estado
- **React Query** - Caché y sincronización de datos
- **Next.js Server Actions** - Operaciones del servidor

### Herramientas de Desarrollo

- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **Jest** - Testing

## 📦 Instalación

### Prerrequisitos

- Node.js 18.17 o superior
- npm, yarn, pnpm o bun

### Pasos de instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd vegan-guide-platform
```

2. **Instalar dependencias**

```bash
npm install
# o
yarn install
# o
pnpm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus configuraciones:

```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. **Ejecutar en desarrollo**

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   ├── api/               # API routes
│   ├── doctors/           # Páginas de doctores
│   ├── markets/           # Páginas de mercados
│   ├── recipes/           # Páginas de recetas
│   ├── restaurants/       # Páginas de restaurantes
│   └── layout.tsx         # Layout principal
├── components/            # Componentes reutilizables
│   ├── auth/             # Componentes de autenticación
│   ├── features/         # Componentes específicos de features
│   ├── ui/               # Componentes de UI base
│   └── layout/           # Componentes de layout
├── hooks/                # Custom hooks
├── lib/                  # Utilidades y configuraciones
│   ├── api/              # Clientes de API
│   ├── store/            # Stores de Zustand
│   └── validations/      # Esquemas de validación
└── types/                # Definiciones de tipos TypeScript
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm run start

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🔧 Configuración

### Variables de Entorno

| Variable              | Descripción                 | Requerido |
| --------------------- | --------------------------- | --------- |
| `NEXTAUTH_SECRET`     | Clave secreta para NextAuth | ✅        |
| `NEXTAUTH_URL`        | URL base de la aplicación   | ✅        |
| `NEXT_PUBLIC_API_URL` | URL de la API backend       | ✅        |

### Configuración de Tailwind

El proyecto usa Tailwind CSS con configuración personalizada para el tema vegano
(colores verdes y naturales).

### Configuración de PWA

El proyecto incluye configuración completa de PWA con:

- Service Worker
- Manifest.json
- Iconos adaptativos
- Funcionalidad offline

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 🐳 Docker

Para construir la imagen de producción:

```bash
docker build -t vegan-guide .
docker run -p 3000:3000 vegan-guide
```

## 📱 PWA Features

- **Instalable**: Los usuarios pueden instalar la app en su dispositivo
- **Offline**: Funcionalidad básica sin conexión
- **Notificaciones**: Push notifications para actualizaciones
- **Responsive**: Diseño adaptativo para todos los dispositivos

## 🎨 Diseño y UX

- **Diseño Responsive**: Optimizado para móvil, tablet y desktop
- **Accesibilidad**: Cumple con estándares WCAG
- **Tema Vegano**: Paleta de colores verde y natural
- **Componentes Reutilizables**: Sistema de diseño consistente

## 🔐 Autenticación

El proyecto usa NextAuth.js con:

- Autenticación por credenciales
- JWT tokens
- Protección de rutas
- Gestión de sesiones

## 📊 Estado de Desarrollo

### ✅ Completado

- [x] Configuración base de Next.js 15
- [x] Sistema de autenticación
- [x] Componentes de UI base
- [x] Estructura de rutas
- [x] Configuración de PWA
- [x] Build de producción funcional

### 🚧 En Desarrollo

- [ ] Integración completa con API backend
- [ ] Sistema de reseñas
- [ ] Funcionalidad de mapas
- [ ] Sistema de notificaciones

### 📋 Pendiente

- [ ] Tests unitarios y de integración
- [ ] Optimización de performance
- [ ] Internacionalización
- [ ] Analytics y métricas

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más
detalles.

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto, contacta al equipo de
desarrollo.

---

**Vegan Guide Platform** - Conectando la comunidad vegana 🌱
