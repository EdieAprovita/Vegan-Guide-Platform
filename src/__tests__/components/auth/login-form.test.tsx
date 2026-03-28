import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/auth/login-form";
import { expectValidationBlocked, expectValidationMessage } from "@/test-utils/auth-form-test-utils";

jest.mock("@/components/ui/form", () => require("@/test-utils/shadcn-form-mocks").createFormMock());
jest.mock("@/components/ui/button", () =>
  require("@/test-utils/shadcn-form-mocks").createButtonMock()
);
jest.mock("@/components/ui/input", () =>
  require("@/test-utils/shadcn-form-mocks").createInputMock()
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildProps(overrides?: Partial<Parameters<typeof LoginForm>[0]>) {
  return {
    onSubmit: jest.fn().mockResolvedValue(undefined),
    onForgotPassword: jest.fn(),
    onRegister: jest.fn(),
    isLoading: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("LoginForm", () => {
  describe("rendering", () => {
    it("renders the welcome heading", () => {
      render(<LoginForm {...buildProps()} />);
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    });

    it("renders email and password inputs", () => {
      render(<LoginForm {...buildProps()} />);
      expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
    });

    it("renders the Sign In submit button", () => {
      render(<LoginForm {...buildProps()} />);
      expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    });

    it("shows 'Signing in...' label and disables button when isLoading is true", () => {
      render(<LoginForm {...buildProps({ isLoading: true })} />);
      const btn = screen.getByRole("button", { name: "Signing in..." });
      expect(btn).toBeDisabled();
    });

    it("renders the forgot password button", () => {
      render(<LoginForm {...buildProps()} />);
      expect(screen.getByRole("button", { name: /forgot your password/i })).toBeInTheDocument();
    });

    it("renders the sign up link button", () => {
      render(<LoginForm {...buildProps()} />);
      expect(screen.getByRole("button", { name: /sign up here/i })).toBeInTheDocument();
    });
  });

  describe("navigation callbacks", () => {
    it("calls onForgotPassword when the forgot-password button is clicked", async () => {
      const user = userEvent.setup();
      const props = buildProps();
      render(<LoginForm {...props} />);
      await user.click(screen.getByRole("button", { name: /forgot your password/i }));
      expect(props.onForgotPassword).toHaveBeenCalledTimes(1);
    });

    it("calls onRegister when the sign-up link is clicked", async () => {
      const user = userEvent.setup();
      const props = buildProps();
      render(<LoginForm {...props} />);
      await user.click(screen.getByRole("button", { name: /sign up here/i }));
      expect(props.onRegister).toHaveBeenCalledTimes(1);
    });
  });

  describe("form submission — happy path", () => {
    it("calls onSubmit with valid credentials", async () => {
      const user = userEvent.setup();
      const props = buildProps();
      render(<LoginForm {...props} />);

      await user.type(screen.getByPlaceholderText("Enter your email"), "user@example.com");
      await user.type(screen.getByPlaceholderText("Enter your password"), "Password1");
      await user.click(screen.getByRole("button", { name: "Sign In" }));

      await waitFor(() => {
        expect(props.onSubmit).toHaveBeenCalledWith({
          email: "user@example.com",
          password: "Password1",
        });
      });
    });
  });

  describe("form submission — error path", () => {
    const validationCases = [
      {
        name: "email is empty",
        fill: async (user: ReturnType<typeof userEvent.setup>) => {
          await user.type(screen.getByPlaceholderText("Enter your password"), "Password1");
        },
      },
      {
        name: "password is empty",
        fill: async (user: ReturnType<typeof userEvent.setup>) => {
          await user.type(screen.getByPlaceholderText("Enter your email"), "user@example.com");
        },
      },
      {
        name: "email is malformed",
        fill: async (user: ReturnType<typeof userEvent.setup>) => {
          await user.type(screen.getByPlaceholderText("Enter your email"), "not-an-email");
          await user.type(screen.getByPlaceholderText("Enter your password"), "Password1");
        },
      },
      {
        name: "password lacks uppercase letter",
        fill: async (user: ReturnType<typeof userEvent.setup>) => {
          await user.type(screen.getByPlaceholderText("Enter your email"), "user@example.com");
          await user.type(screen.getByPlaceholderText("Enter your password"), "password1");
        },
      },
    ];

    test.each(validationCases)(
      "does not call onSubmit when $name",
      async ({ fill }) => {
        const user = userEvent.setup();
        const props = buildProps();
        render(<LoginForm {...props} />);
        await fill(user);
        await user.click(screen.getByRole("button", { name: "Sign In" }));
        await expectValidationBlocked(props.onSubmit);
      }
    );

    const errorMessageCases = [
      {
        name: "email is malformed",
        fill: async (user: ReturnType<typeof userEvent.setup>) => {
          await user.type(screen.getByPlaceholderText("Enter your email"), "not-an-email");
          await user.type(screen.getByPlaceholderText("Enter your password"), "Password1");
        },
        message: "Please enter a valid email address",
      },
      {
        name: "password lacks uppercase letter",
        fill: async (user: ReturnType<typeof userEvent.setup>) => {
          await user.type(screen.getByPlaceholderText("Enter your email"), "user@example.com");
          await user.type(screen.getByPlaceholderText("Enter your password"), "password1");
        },
        message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      },
    ];

    test.each(errorMessageCases)(
      "shows a validation error when $name",
      async ({ fill, message }) => {
        const user = userEvent.setup();
        const props = buildProps();
        render(<LoginForm {...props} />);
        await fill(user);
        await user.click(screen.getByRole("button", { name: "Sign In" }));
        await expectValidationMessage(message);
      }
    );

    it("swallows the error thrown by onSubmit so the form does not crash", async () => {
      const user = userEvent.setup();
      const props = buildProps({
        onSubmit: jest.fn().mockRejectedValue(new Error("Invalid credentials")),
      });
      render(<LoginForm {...props} />);

      await user.type(screen.getByPlaceholderText("Enter your email"), "user@example.com");
      await user.type(screen.getByPlaceholderText("Enter your password"), "Password1");

      // Should not throw
      await expect(
        user.click(screen.getByRole("button", { name: "Sign In" }))
      ).resolves.not.toThrow();

      await waitFor(() => {
        expect(props.onSubmit).toHaveBeenCalledTimes(1);
      });
    });
  });
});
