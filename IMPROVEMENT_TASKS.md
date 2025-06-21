# 🛠️ Tareas de Mejora

Lista de acciones a implementar para optimizar la plataforma.

## 📁 Estructura de Carpetas Consistente
- [ ] Analizar `src/components/features` y `src/components/vegan-landing` para decidir un criterio único.
- [ ] Reorganizar los componentes bajo una misma jerarquía por dominio o tipo.
- [ ] Documentar la nueva estructura en el README.

## ⚙️ Componentes Cliente/Servidor Claros
- [ ] Revisar componentes con `"use client"` y evaluar su conversión a componentes de servidor.
- [ ] Mantener la lógica de estado en el cliente únicamente donde sea necesario.

## ✅ Validación de Variables de Entorno
- [ ] Crear un esquema con Zod para validar `process.env` en `next.config.ts`.
- [ ] Lanzar errores descriptivos cuando falten variables obligatorias.

## 🛣️ Optimización de Imports
- [ ] Alinear `tsconfig.json` y ESLint para usar los mismos aliases.
- [ ] Reemplazar rutas relativas repetitivas por imports absolutos.

## 💤 Lazy Loading y División de Código
- [ ] Utilizar `next/dynamic` para cargar de forma diferida componentes pesados (mapas, chat).
- [ ] Verificar que la división de código no afecte funcionalidades existentes.

## 🧪 Cobertura de Tests
- [ ] Añadir pruebas para páginas y componentes clave usando Testing Library.
- [ ] Incorporar mocks y utils comunes en `src/__tests__/`.

## ♿ Accesibilidad
- [ ] Incluir atributos `aria-*` y manejo de teclado en botones e inputs.
- [ ] Mostrar mensajes de error accesibles en formularios.

## 📄 Uso de React Hook Form
- [ ] Extraer la lógica repetida de formularios en hooks personalizados.
- [ ] Simplificar componentes de formulario usando esos hooks.

## 🌐 Gestión de Estado Global
- [ ] Revisar `useAuthStore` y dividirla en stores más pequeños si es necesario.
- [ ] Evitar renders globales innecesarios separando responsabilidades.

## 🌎 Internacionalización
- [ ] Configurar la infraestructura de i18n de Next.js.
- [ ] Preparar archivos de traducción para futuros idiomas.

## 📝 Documentación
- [ ] Ampliar el README con diagramas de arquitectura y ejemplos de uso.
- [ ] Explicar la estructura de carpetas y convenciones de código.

## 📦 Revisión de Dependencias
- [ ] Eliminar paquetes no utilizados del `package.json`.
- [ ] Actualizar dependencias de seguridad y linting.
