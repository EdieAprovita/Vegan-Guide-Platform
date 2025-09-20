# Contrato de UI (Design System) – Verde Guide

Objetivo

- Garantizar consistencia visual, accesibilidad y mantenibilidad en toda la app.
- Usar tokens de tema y componentes base para evitar estilos ad-hoc.

Principios

- Tokens primero: usa colores y radii desde el sistema, evita hex y utilidades
  crudas.
- Accesibilidad: focus-visible consistente, contraste AA, navegación por
  teclado.
- Tipografía semántica: clases de fuente coherentes; evita bracket-notation.
- Variantes y estados: apóyate en los componentes base (Button, Input, etc.).

Tokens de color (usar)

- Fondo y texto: bg-background, text-foreground
- Superficies: bg-card, text-card-foreground, bg-popover,
  text-popover-foreground
- Interacción: primary, primary-foreground, secondary, secondary-foreground,
  accent, destructive
- Sistema: border, input, ring, muted, muted-foreground

Do/Don’t de color

- Do: bg-card + text-card-foreground para tarjetas; text-muted-foreground para
  secundario.
- Don’t: bg-white, text-gray-700/900, emerald/green/yellow directos, hex
  arbitrarios.

Tipografía

- Fuentes (Tailwind):
  - font-sans -> var(--font-inter) para body
  - font-mono -> var(--font-jetbrains-mono) solo para código
  - font-playfair-display -> var(--font-playfair-display) para
    headings/marketing
  - font-clicker-script -> var(--font-clicker-script) para acentos puntuales
- Reglas:
  - Encabezados: font-playfair-display (h1–h3), cuerpo: font-sans.
  - Evita font-[Playfair_Display]; usa font-playfair-display.

Accesibilidad y foco

- Siempre focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none en
  triggers/links.
- icon-only: añadir sr-only con label y mantener área táctil >= 40px.
- Navegación: aria-current="page" para activo; toggles con aria-expanded +
  aria-controls.

Radii y espaciado

- Usa --radius mapeado a rounded-md/lg según el componente.
- Evita rounded-3xl/full salvo chips/avatares.
- Escala 4/8 para spacing; evita px “caprichosos”.

Componentes base (patrones)

- Button (src/components/ui/button.tsx)
  - Variantes: default, destructive, outline, secondary, ghost, link.
  - Preferir default para CTA; evita gradientes custom. width: usar w-full solo
    cuando aplique.
- Input (src/components/ui/input.tsx)
  - Usa junto a FormControl/Label para aria-\*. No sobrescribir focus.
- Select (src/components/ui/select.tsx)
  - Mantener focus-visible; sin focus:ring 1px suelto. Alineado a Input/Button.
- Card (src/components/ui/card.tsx)
  - Usar bg-card, text-card-foreground; evitar text-gray-\* dentro del
    contenido.
- Dialog/Tabs/Dropdown
  - Usar data-state y clases del sistema; no añadir animaciones ad-hoc.

Imágenes y carga

- LazyImage/SafeImage para placeholders/errores; evita usar Image “a pelo” en
  listas.
- Skeleton en listados durante carga para mejor percepción.

Notificaciones

- Usar Toaster envuelto (src/components/ui/sonner.tsx). Evitar estilos inline.

Checklist de revisión (por PR)

- [ ] 0 colores crudos (white/gray/emerald/green/yellow) fuera del sistema de
      tokens.
- [ ] focus-visible en todos los triggers/links; navegación por teclado
      comprobada.
- [ ] Contraste AA mínimo en texto y elementos interactivos (light y dark).
- [ ] Tipografías usando clases semánticas (sin bracket-notation).
- [ ] Componentes base y variantes correctas; sin duplicar estilos de botón.
- [ ] Imágenes con placeholder/lazy y skeletons donde corresponde.

Notas de implementación

- Si necesitas un color “de rating”, usa text-primary/fill-primary por ahora.
  Evaluar token específico más adelante.
- Para CTAs con “look” de campaña, considerar añadir una variante brand en
  Button (futuro); mientras tanto usa variant="default" + tokens.
