import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Providers } from "@/app/providers";

// Mock next-themes (requires window.matchMedia not available in jsdom)
jest.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme">{children}</div>
  ),
  useTheme: () => ({ theme: "system", setTheme: jest.fn() }),
}));

// Mock i18n
jest.mock("@/lib/i18n", () => ({
  I18nProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="i18n">{children}</div>
  ),
  useTranslation: () => (key: string) => key,
  useLocale: () => ({ locale: "es", setLocale: jest.fn() }),
}));

jest.mock("@tanstack/react-query", () => ({
  QueryClient: jest.fn().mockImplementation(() => ({})),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query">{children}</div>
  ),
}));

jest.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session">{children}</div>
  ),
}));

jest.mock("@/components/auth/auth-provider", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth">{children}</div>
  ),
}));

jest.mock("sonner", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

// Mock the custom sonner wrapper that uses useTheme from next-themes
jest.mock("@/components/ui/sonner", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

describe("Providers component", () => {
  it("renders nested providers and children", () => {
    render(
      <Providers>
        <span>content</span>
      </Providers>
    );

    expect(screen.getByTestId("session")).toBeInTheDocument();
    expect(screen.getByTestId("auth")).toBeInTheDocument();
    expect(screen.getByTestId("toaster")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
