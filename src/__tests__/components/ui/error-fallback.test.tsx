import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorFallback } from "@/components/ui/error-fallback";
import { type LucideIcon } from "lucide-react";

// Mock next/link to render a plain anchor
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

// Mock lucide-react icons with accessible test ids
jest.mock("lucide-react", () => ({
  AlertTriangle: (props: Record<string, unknown>) => (
    <svg data-testid="icon-alert-triangle" />
  ),
  RefreshCw: (props: Record<string, unknown>) => (
    <svg data-testid="icon-refresh-cw" />
  ),
  Home: (props: Record<string, unknown>) => (
    <svg data-testid="icon-home" />
  ),
}));

// Mock i18n
jest.mock("@/lib/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "common.retry": "Intentar de nuevo",
        "common.goHome": "Volver al inicio",
        "common.error": "Algo salió mal",
      };
      return map[key] || key;
    },
    locale: "es",
  }),
  useLocale: () => ({ locale: "es", setLocale: jest.fn() }),
}));

// Mock the Button component to render a plain button element
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    asChild,
    className,
    variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    asChild?: boolean;
    className?: string;
    variant?: string;
  }) => {
    if (asChild) {
      // When asChild, render the single child directly
      return <>{children}</>;
    }
    return (
      <button onClick={onClick} className={className} data-variant={variant}>
        {children}
      </button>
    );
  },
}));

// Minimal cn mock
jest.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

describe("ErrorFallback", () => {
  const defaultProps = {
    title: "Something went wrong",
    reset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the title", () => {
    render(<ErrorFallback {...defaultProps} />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders the default description when none is provided", () => {
    render(<ErrorFallback {...defaultProps} />);
    expect(
      screen.getByText(
        "Ha ocurrido un error inesperado. Por favor intenta de nuevo."
      )
    ).toBeInTheDocument();
  });

  it("renders a custom description when provided", () => {
    render(<ErrorFallback {...defaultProps} description="Custom error message" />);
    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("renders the retry button with correct text", () => {
    render(<ErrorFallback {...defaultProps} />);
    expect(screen.getByText("Intentar de nuevo")).toBeInTheDocument();
  });

  it("renders the home link with correct text", () => {
    render(<ErrorFallback {...defaultProps} />);
    expect(screen.getByText("Volver al inicio")).toBeInTheDocument();
  });

  it("calls reset when the retry button is clicked", () => {
    const resetFn = jest.fn();
    render(<ErrorFallback {...defaultProps} reset={resetFn} />);
    fireEvent.click(screen.getByText("Intentar de nuevo"));
    expect(resetFn).toHaveBeenCalledTimes(1);
  });

  it("home link points to /", () => {
    render(<ErrorFallback {...defaultProps} />);
    const link = screen.getByRole("link", { name: /volver al inicio/i });
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders with role=alert for accessibility", () => {
    render(<ErrorFallback {...defaultProps} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("applies custom className to root element", () => {
    render(<ErrorFallback {...defaultProps} className="custom-class" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("custom-class");
  });

  it("renders the default AlertTriangle icon", () => {
    render(<ErrorFallback {...defaultProps} />);
    expect(screen.getByTestId("icon-alert-triangle")).toBeInTheDocument();
  });

  it("renders a custom icon when provided", () => {
    const CustomIcon = () => <svg data-testid="custom-icon" />;
    render(
      <ErrorFallback {...defaultProps} icon={CustomIcon as unknown as LucideIcon} />
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("icon-alert-triangle")).not.toBeInTheDocument();
  });

  it("renders the RefreshCw icon inside the retry button area", () => {
    render(<ErrorFallback {...defaultProps} />);
    expect(screen.getByTestId("icon-refresh-cw")).toBeInTheDocument();
  });

  it("renders the Home icon inside the home link area", () => {
    render(<ErrorFallback {...defaultProps} />);
    expect(screen.getByTestId("icon-home")).toBeInTheDocument();
  });
});
