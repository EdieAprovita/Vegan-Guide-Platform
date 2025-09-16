import { render, screen } from "@testing-library/react";
import { Providers } from "@/app/providers";

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
