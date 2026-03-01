import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import NotFound from "@/app/not-found";

// Mock i18n
jest.mock("@/lib/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "notFound.title": "Página no encontrada",
        "notFound.subtitle": "La página que buscas no existe o fue movida",
        "notFound.goHome": "Volver al inicio",
        "notFound.search": "Buscar",
        "notFound.explore": "Explorar",
        "notFound.needHelp": "Necesitas ayuda",
        "notFound.contactUs": "Contáctanos",
        "resources.restaurants": "Restaurantes",
        "resources.recipes": "Recetas",
        "resources.doctors": "Doctores",
        "resources.markets": "Mercados",
        "resources.community": "Comunidad",
        "a11y.skipToContent": "Saltar al contenido principal",
      };
      return map[key] || key;
    },
    locale: "es",
  }),
  useLocale: () => ({ locale: "es", setLocale: jest.fn() }),
}));

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock lucide-react icons used in the page
jest.mock("lucide-react", () => ({
  Leaf: ({ className, ...rest }: { className?: string; [key: string]: unknown }) => (
    <svg data-testid="icon-leaf" className={className} />
  ),
  Home: ({ className, ...rest }: { className?: string; [key: string]: unknown }) => (
    <svg data-testid="icon-home" className={className} />
  ),
  Search: ({ className, ...rest }: { className?: string; [key: string]: unknown }) => (
    <svg data-testid="icon-search" className={className} />
  ),
  UtensilsCrossed: ({ className }: { className?: string }) => (
    <svg data-testid="icon-utensils" className={className} />
  ),
  BookOpen: ({ className }: { className?: string }) => (
    <svg data-testid="icon-book-open" className={className} />
  ),
  Stethoscope: ({ className }: { className?: string }) => (
    <svg data-testid="icon-stethoscope" className={className} />
  ),
  ShoppingBasket: ({ className }: { className?: string }) => (
    <svg data-testid="icon-shopping-basket" className={className} />
  ),
  Users: ({ className }: { className?: string }) => (
    <svg data-testid="icon-users" className={className} />
  ),
}));

// Mock shadcn Button
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    asChild,
    className,
    size,
    variant,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    className?: string;
    size?: string;
    variant?: string;
  }) => {
    if (asChild) return <>{children}</>;
    return (
      <button className={className} data-size={size} data-variant={variant}>
        {children}
      </button>
    );
  },
}));

describe("NotFound page", () => {
  it("renders the main 404 heading", () => {
    render(<NotFound />);
    expect(screen.getByText("Página no encontrada")).toBeInTheDocument();
  });

  it("renders the 404 decorative number (aria-hidden)", () => {
    render(<NotFound />);
    const number = screen.getByText("404");
    expect(number).toHaveAttribute("aria-hidden", "true");
  });

  it("renders the brand name Verde Guide", () => {
    render(<NotFound />);
    expect(screen.getByText("Verde Guide")).toBeInTheDocument();
  });

  it("renders the descriptive subtitle", () => {
    render(<NotFound />);
    expect(
      screen.getByText("La página que buscas no existe o fue movida")
    ).toBeInTheDocument();
  });

  it("renders a link back to home", () => {
    render(<NotFound />);
    const homeLinks = screen.getAllByRole("link", { name: /volver al inicio/i });
    // There is at least one home link
    expect(homeLinks.length).toBeGreaterThan(0);
    homeLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/");
    });
  });

  it("renders a link to search", () => {
    render(<NotFound />);
    const searchLink = screen.getByRole("link", { name: /buscar/i });
    expect(searchLink).toHaveAttribute("href", "/search");
  });

  it("renders all 5 suggested navigation links", () => {
    render(<NotFound />);
    const nav = screen.getByRole("navigation", { name: /secciones sugeridas/i });
    expect(nav).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /restaurantes/i })).toHaveAttribute(
      "href",
      "/restaurants"
    );
    expect(screen.getByRole("link", { name: /recetas/i })).toHaveAttribute(
      "href",
      "/recipes"
    );
    expect(screen.getByRole("link", { name: /doctores/i })).toHaveAttribute(
      "href",
      "/doctors"
    );
    expect(screen.getByRole("link", { name: /mercados/i })).toHaveAttribute(
      "href",
      "/markets"
    );
    expect(screen.getByRole("link", { name: /comunidad/i })).toHaveAttribute(
      "href",
      "/community"
    );
  });

  it("renders the 'Explorar' section label", () => {
    render(<NotFound />);
    expect(screen.getByText("Explorar")).toBeInTheDocument();
  });

  it("renders the help footer text", () => {
    render(<NotFound />);
    expect(screen.getByText(/Necesitas ayuda/)).toBeInTheDocument();
  });

  it("renders the help/contact link pointing to /", () => {
    render(<NotFound />);
    const links = screen.getAllByRole("link", { name: /Contáctanos/i });
    expect(links[0]).toHaveAttribute("href", "/");
  });

  it("renders Leaf icons", () => {
    render(<NotFound />);
    const leafIcons = screen.getAllByTestId("icon-leaf");
    expect(leafIcons.length).toBeGreaterThanOrEqual(2);
  });
});
