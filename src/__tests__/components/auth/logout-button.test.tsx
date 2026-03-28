import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogoutButton } from "@/components/auth/logout-button";

// ---------------------------------------------------------------------------
// next-auth/react — stub signOut
// ---------------------------------------------------------------------------
const mockSignOut = jest.fn();

jest.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

// ---------------------------------------------------------------------------
// sonner — stub toast so tests don't produce side-effects
// ---------------------------------------------------------------------------
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

// ---------------------------------------------------------------------------
// Shadcn Button — render as a plain <button>
// ---------------------------------------------------------------------------
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    size?: string;
    className?: string;
  }) => (
    <button onClick={onClick} data-variant={variant} data-size={size} className={className}>
      {children}
    </button>
  ),
}));

// ---------------------------------------------------------------------------
// lucide-react — only LogOut icon is used
// ---------------------------------------------------------------------------
jest.mock("lucide-react", () => ({
  LogOut: ({ className }: { className?: string }) => (
    <svg data-testid="icon-logout" className={className} />
  ),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("LogoutButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders a button with 'Logout' label", () => {
      render(<LogoutButton />);
      expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
    });

    it("renders the LogOut icon", () => {
      render(<LogoutButton />);
      expect(screen.getByTestId("icon-logout")).toBeInTheDocument();
    });

    it("applies default variant=outline", () => {
      render(<LogoutButton />);
      const btn = screen.getByRole("button", { name: /logout/i });
      expect(btn).toHaveAttribute("data-variant", "outline");
    });

    it("accepts a custom variant prop", () => {
      render(<LogoutButton variant="destructive" />);
      const btn = screen.getByRole("button", { name: /logout/i });
      expect(btn).toHaveAttribute("data-variant", "destructive");
    });

    it("accepts a custom size prop", () => {
      render(<LogoutButton size="sm" />);
      const btn = screen.getByRole("button", { name: /logout/i });
      expect(btn).toHaveAttribute("data-size", "sm");
    });

    it("passes className to the button", () => {
      render(<LogoutButton className="custom-class" />);
      const btn = screen.getByRole("button", { name: /logout/i });
      expect(btn).toHaveClass("custom-class");
    });
  });

  describe("logout — happy path", () => {
    it("calls signOut with redirect:true when clicked", async () => {
      const user = userEvent.setup();
      mockSignOut.mockResolvedValue(undefined);
      render(<LogoutButton />);

      await user.click(screen.getByRole("button", { name: /logout/i }));

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledWith({
          callbackUrl: "/",
          redirect: true,
        });
      });
    });

    it("shows a success toast after signOut resolves", async () => {
      const user = userEvent.setup();
      mockSignOut.mockResolvedValue(undefined);
      render(<LogoutButton />);

      await user.click(screen.getByRole("button", { name: /logout/i }));

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith("Logged out successfully");
      });
    });
  });

  describe("logout — error path", () => {
    it("shows an error toast when signOut rejects", async () => {
      const user = userEvent.setup();
      mockSignOut.mockRejectedValue(new Error("Network error"));
      render(<LogoutButton />);

      await user.click(screen.getByRole("button", { name: /logout/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Failed to logout");
      });
    });

    it("does not show a success toast when signOut rejects", async () => {
      const user = userEvent.setup();
      mockSignOut.mockRejectedValue(new Error("Network error"));
      render(<LogoutButton />);

      await user.click(screen.getByRole("button", { name: /logout/i }));

      await waitFor(() => {
        expect(mockToastSuccess).not.toHaveBeenCalled();
      });
    });
  });
});
