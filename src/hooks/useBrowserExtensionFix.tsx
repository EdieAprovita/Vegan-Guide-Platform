import React, { useEffect } from "react";

/**
 * Hook para manejar conflictos de hidratación causados por extensiones del navegador
 * Este hook limpia atributos inyectados por extensiones que causan warnings de hidratación
 */
export function useBrowserExtensionFix() {
  useEffect(() => {
    // Lista de atributos conocidos que inyectan las extensiones
    const extensionAttributes = [
      "bbai-tooltip-injected",
      "cz-shortcut-listen",
      "data-grammarly-extension",
      "data-new-gr-c-s-check-loaded",
      "data-gr-ext-installed",
      "data-lt-installed",
      "data-adblock-key",
      "data-honey-extension-installed",
    ];

    // Función para limpiar atributos de extensiones
    const cleanExtensionAttributes = () => {
      const html = document.documentElement;
      const body = document.body;

      // Limpiar atributos del elemento html
      extensionAttributes.forEach((attr) => {
        if (html.hasAttribute(attr)) {
          html.removeAttribute(attr);
        }
        if (body.hasAttribute(attr)) {
          body.removeAttribute(attr);
        }
      });
    };

    // Ejecutar limpieza inmediatamente
    cleanExtensionAttributes();

    // Observar cambios en el DOM para limpiar atributos inyectados dinámicamente
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes") {
          const target = mutation.target as Element;
          const attributeName = mutation.attributeName;

          if (attributeName && extensionAttributes.includes(attributeName)) {
            target.removeAttribute(attributeName);
          }
        }
      });
    });

    // Observar cambios en html y body
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: extensionAttributes,
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: extensionAttributes,
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);
}

/**
 * Componente wrapper que aplica el fix automáticamente
 */
export function BrowserExtensionProvider({ children }: { children: React.ReactNode }) {
  useBrowserExtensionFix();
  return <>{children}</>;
}
