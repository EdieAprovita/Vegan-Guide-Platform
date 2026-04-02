/**
 * Centralised mock factory objects for card component tests.
 *
 * WHY FACTORY OBJECTS, NOT jest.mock() CALLS:
 * Jest hoists jest.mock() to the TOP of each file before any imports execute.
 * A jest.mock() call inside a helper function is NOT hoisted, so the real
 * module gets loaded first and the mock has no effect.
 *
 * The solution: keep jest.mock() in each test file (so it is hoisted) but
 * import the factory body from this shared module to remove duplication:
 *
 *   import { nextLinkMock, cardMock, ... } from "@/__tests__/setup/mock-components";
 *
 *   jest.mock("next/link", () => nextLinkMock);
 *   jest.mock("@/components/ui/card", () => cardMock);
 *   jest.mock("lucide-react", () => lucideReactMock);
 *   ...
 *
 * The jest.mock() calls stay per-file; the implementation bodies live here.
 */

// ---------------------------------------------------------------------------
// next/link
// ---------------------------------------------------------------------------
export const nextLinkMock = {
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
};

// ---------------------------------------------------------------------------
// next/image
// ---------------------------------------------------------------------------
export const nextImageMock = {
  __esModule: true,
  default: ({
    src,
    alt,
    className,
    fill,
    width,
    height,
  }: {
    src: string;
    alt: string;
    className?: string;
    fill?: boolean;
    width?: number;
    height?: number;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      data-fill={fill ? "true" : undefined}
      width={width}
      height={height}
    />
  ),
};

// ---------------------------------------------------------------------------
// lucide-react — superset of all icons used across card tests
// ---------------------------------------------------------------------------
export const lucideReactMock = {
  Star: ({ className }: { className?: string }) => (
    <svg data-testid="icon-star" className={className} />
  ),
  MapPin: ({ className }: { className?: string }) => (
    <svg data-testid="icon-map-pin" className={className} />
  ),
  Phone: ({ className }: { className?: string }) => (
    <svg data-testid="icon-phone" className={className} />
  ),
  Mail: ({ className }: { className?: string }) => (
    <svg data-testid="icon-mail" className={className} />
  ),
  Globe: ({ className }: { className?: string }) => (
    <svg data-testid="icon-globe" className={className} />
  ),
  ExternalLink: ({ className }: { className?: string }) => (
    <svg data-testid="icon-external-link" className={className} />
  ),
  Clock: ({ className }: { className?: string }) => (
    <svg data-testid="icon-clock" className={className} />
  ),
  Users: ({ className }: { className?: string }) => (
    <svg data-testid="icon-users" className={className} />
  ),
  ChefHat: ({ className }: { className?: string }) => (
    <svg data-testid="icon-chef-hat" className={className} />
  ),
  MoreVertical: () => <svg data-testid="icon-more-vertical" />,
  Edit: () => <svg data-testid="icon-edit" />,
  Trash2: () => <svg data-testid="icon-trash2" />,
  Flag: () => <svg data-testid="icon-flag" />,
};

// ---------------------------------------------------------------------------
// @/components/ui/card
// ---------------------------------------------------------------------------
export const cardMock = {
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h3 data-testid="card-title" className={className}>
      {children}
    </h3>
  ),
};

// ---------------------------------------------------------------------------
// @/components/ui/badge
// ---------------------------------------------------------------------------
export const badgeMock = {
  Badge: ({
    children,
    className,
    variant,
  }: {
    children: React.ReactNode;
    className?: string;
    variant?: string;
  }) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
};

// ---------------------------------------------------------------------------
// @/components/ui/button
// ---------------------------------------------------------------------------
export const buttonMock = {
  Button: ({
    children,
    asChild,
    className,
    variant,
    size,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    className?: string;
    variant?: string;
    size?: string;
    onClick?: () => void;
    disabled?: boolean;
  }) => {
    if (asChild) return <>{children}</>;
    return (
      <button
        onClick={onClick}
        className={className}
        data-variant={variant}
        data-size={size}
        disabled={disabled}
      >
        {children}
      </button>
    );
  },
};

// ---------------------------------------------------------------------------
// @/components/ui/avatar
// ---------------------------------------------------------------------------
export const avatarMock = {
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img data-testid="avatar-image" src={src} alt={alt} />
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="avatar-fallback">{children}</span>
  ),
};

// ---------------------------------------------------------------------------
// @/components/ui/dropdown-menu
// ---------------------------------------------------------------------------
export const dropdownMenuMock = {
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode; align?: string }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button data-testid="dropdown-item" onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
};

// ---------------------------------------------------------------------------
// @/lib/utils — cn() utility
// ---------------------------------------------------------------------------
export const utilsMock = {
  cn: (...args: (string | undefined | false | null)[]) => args.filter(Boolean).join(" "),
};
