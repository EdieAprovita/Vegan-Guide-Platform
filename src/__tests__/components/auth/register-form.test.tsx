import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "@/components/auth/register-form";

// ---------------------------------------------------------------------------
// Shadcn Form primitives — use real react-hook-form controller logic so field
// state (value, onChange, onBlur) is wired up correctly in jsdom.
// ---------------------------------------------------------------------------
jest.mock("@/components/ui/form", () => {
  const React = require("react") as typeof import("react");
  const { Controller, FormProvider, useFormContext } =
    require("react-hook-form") as typeof import("react-hook-form");

  // Context that carries the current field name so FormMessage can read errors.
  const FormFieldNameContext = React.createContext<string>("");

  return {
    // Use real FormProvider so useFormContext() works inside FormMessage.
    Form: FormProvider,
    FormField: ({
      name,
      control,
      render: renderFn,
    }: {
      name: string;
      control: object;
      render: (args: { field: object; fieldState: object }) => React.ReactNode;
    }) => (
      <FormFieldNameContext.Provider value={name}>
        <Controller
          name={name}
          control={control as Parameters<typeof Controller>[0]["control"]}
          render={({ field, fieldState }) => renderFn({ field, fieldState })}
        />
      </FormFieldNameContext.Provider>
    ),
    FormItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    FormLabel: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
      <label htmlFor={htmlFor}>{children}</label>
    ),
    FormControl: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    FormMessage: ({ id, children }: { id?: string; children?: React.ReactNode }) => {
      const fieldName = React.useContext(FormFieldNameContext);
      const { formState } = useFormContext();
      const error = fieldName
        ? (formState.errors[fieldName] as { message?: string } | undefined)
        : undefined;
      const message = error?.message ?? children;
      return (
        <span id={id} role="alert">
          {message}
        </span>
      );
    },
  };
});

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    type,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    className?: string;
  }) => (
    <button type={type} disabled={disabled}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) => {
    const { className: _cls, ...rest } = props;
    return <input {...rest} />;
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildProps(overrides?: Partial<Parameters<typeof RegisterForm>[0]>) {
  return {
    onSubmit: jest.fn().mockResolvedValue(undefined),
    onLogin: jest.fn(),
    isLoading: false,
    ...overrides,
  };
}

type UserInstance = ReturnType<typeof userEvent.setup>;

async function fillValidForm(user: UserInstance) {
  await user.type(screen.getByPlaceholderText("Enter your username"), "veganlover");
  await user.type(screen.getByPlaceholderText("Enter your email"), "vegan@example.com");
  await user.selectOptions(screen.getByRole("combobox"), "user");
  await user.type(screen.getByPlaceholderText("Create a strong password"), "Password1");
  await user.type(screen.getByPlaceholderText("Confirm your password"), "Password1");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("RegisterForm", () => {
  describe("rendering", () => {
    it("renders the Join Verde Guide heading", () => {
      render(<RegisterForm {...buildProps()} />);
      expect(screen.getByText("Join Verde Guide")).toBeInTheDocument();
    });

    it("renders all required input fields", () => {
      render(<RegisterForm {...buildProps()} />);
      expect(screen.getByPlaceholderText("Enter your username")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Create a strong password")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Confirm your password")).toBeInTheDocument();
    });

    it("renders the account type selector", () => {
      render(<RegisterForm {...buildProps()} />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Regular User" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Professional" })).toBeInTheDocument();
    });

    it("renders the Create Account submit button", () => {
      render(<RegisterForm {...buildProps()} />);
      expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
    });

    it("shows 'Creating account...' and disables the button when isLoading is true", () => {
      render(<RegisterForm {...buildProps({ isLoading: true })} />);
      const btn = screen.getByRole("button", { name: "Creating account..." });
      expect(btn).toBeDisabled();
    });

    it("renders the sign-in link button", () => {
      render(<RegisterForm {...buildProps()} />);
      expect(screen.getByRole("button", { name: /sign in here/i })).toBeInTheDocument();
    });
  });

  describe("navigation callback", () => {
    it("calls onLogin when sign-in link is clicked", async () => {
      const user = userEvent.setup();
      const props = buildProps();
      render(<RegisterForm {...props} />);
      await user.click(screen.getByRole("button", { name: /sign in here/i }));
      expect(props.onLogin).toHaveBeenCalledTimes(1);
    });
  });

  describe("form submission — happy path", () => {
    it("calls onSubmit with all valid data", async () => {
      const user = userEvent.setup();
      const props = buildProps();
      render(<RegisterForm {...props} />);

      await fillValidForm(user);
      await user.click(screen.getByRole("button", { name: "Create Account" }));

      await waitFor(() => {
        expect(props.onSubmit).toHaveBeenCalledWith({
          username: "veganlover",
          email: "vegan@example.com",
          password: "Password1",
          confirmPassword: "Password1",
          role: "user",
        });
      });
    });

    it("calls onSubmit with role=professional when that option is selected", async () => {
      const user = userEvent.setup();
      const props = buildProps();
      render(<RegisterForm {...props} />);

      await user.type(screen.getByPlaceholderText("Enter your username"), "prouser");
      await user.type(screen.getByPlaceholderText("Enter your email"), "pro@example.com");
      await user.selectOptions(screen.getByRole("combobox"), "professional");
      await user.type(screen.getByPlaceholderText("Create a strong password"), "Password1");
      await user.type(screen.getByPlaceholderText("Confirm your password"), "Password1");
      await user.click(screen.getByRole("button", { name: "Create Account" }));

      await waitFor(() => {
        expect(props.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ role: "professional" })
        );
      });
    });
  });

  describe("form validation", () => {
    it("does not call onSubmit when username is missing", async () => {
      const user = userEvent.setup();
      const props = buildProps();
      render(<RegisterForm {...props} />);

      await user.type(screen.getByPlaceholderText("Enter your email"), "vegan@example.com");
      await user.selectOptions(screen.getByRole("combobox"), "user");
      await user.type(screen.getByPlaceholderText("Create a strong password"), "Password1");
      await user.type(screen.getByPlaceholderText("Confirm your password"), "Password1");
      await user.click(screen.getByRole("button", { name: "Create Account" }));

      expect(props.onSubmit).not.toHaveBeenCalled();
    });

    it("does not call onSubmit when email is invalid", async () => {
      const user = userEvent.setup();
      const props = buildProps();
      render(<RegisterForm {...props} />);

      await user.type(screen.getByPlaceholderText("Enter your username"), "veganlover");
      await user.type(screen.getByPlaceholderText("Enter your email"), "not-an-email");
      await user.selectOptions(screen.getByRole("combobox"), "user");
      await user.type(screen.getByPlaceholderText("Create a strong password"), "Password1");
      await user.type(screen.getByPlaceholderText("Confirm your password"), "Password1");
      await user.click(screen.getByRole("button", { name: "Create Account" }));

      expect(props.onSubmit).not.toHaveBeenCalled();
    });

    it("does not call onSubmit when passwords do not match", async () => {
      const user = userEvent.setup();
      const props = buildProps();
      render(<RegisterForm {...props} />);

      await user.type(screen.getByPlaceholderText("Enter your username"), "veganlover");
      await user.type(screen.getByPlaceholderText("Enter your email"), "vegan@example.com");
      await user.selectOptions(screen.getByRole("combobox"), "user");
      await user.type(screen.getByPlaceholderText("Create a strong password"), "Password1");
      await user.type(screen.getByPlaceholderText("Confirm your password"), "Password2");
      await user.click(screen.getByRole("button", { name: "Create Account" }));

      expect(props.onSubmit).not.toHaveBeenCalled();
    });

    it("does not call onSubmit when password is too short", async () => {
      const user = userEvent.setup();
      const props = buildProps();
      render(<RegisterForm {...props} />);

      await user.type(screen.getByPlaceholderText("Enter your username"), "veganlover");
      await user.type(screen.getByPlaceholderText("Enter your email"), "vegan@example.com");
      await user.selectOptions(screen.getByRole("combobox"), "user");
      await user.type(screen.getByPlaceholderText("Create a strong password"), "P1a");
      await user.type(screen.getByPlaceholderText("Confirm your password"), "P1a");
      await user.click(screen.getByRole("button", { name: "Create Account" }));

      expect(props.onSubmit).not.toHaveBeenCalled();
    });

    it("does not call onSubmit when the empty placeholder option is selected", async () => {
      const user = userEvent.setup();
      const props = buildProps();
      render(<RegisterForm {...props} />);

      await user.type(screen.getByPlaceholderText("Enter your username"), "veganlover");
      await user.type(screen.getByPlaceholderText("Enter your email"), "vegan@example.com");
      // Select the blank placeholder option, which is not a valid enum value
      await user.selectOptions(screen.getByRole("combobox"), "");
      await user.type(screen.getByPlaceholderText("Create a strong password"), "Password1");
      await user.type(screen.getByPlaceholderText("Confirm your password"), "Password1");
      await user.click(screen.getByRole("button", { name: "Create Account" }));

      expect(props.onSubmit).not.toHaveBeenCalled();
    });

    it("shows a validation error when email is invalid", async () => {
      const user = userEvent.setup();
      const props = buildProps();
      render(<RegisterForm {...props} />);

      await user.type(screen.getByPlaceholderText("Enter your username"), "veganlover");
      await user.type(screen.getByPlaceholderText("Enter your email"), "not-an-email");
      await user.selectOptions(screen.getByRole("combobox"), "user");
      await user.type(screen.getByPlaceholderText("Create a strong password"), "Password1");
      await user.type(screen.getByPlaceholderText("Confirm your password"), "Password1");
      await user.click(screen.getByRole("button", { name: "Create Account" }));

      const alerts = await screen.findAllByRole("alert");
      const messages = alerts.map((el) => el.textContent);
      expect(messages).toContain("Please enter a valid email address");
    });

    it("shows a validation error when passwords do not match", async () => {
      const user = userEvent.setup();
      const props = buildProps();
      render(<RegisterForm {...props} />);

      await user.type(screen.getByPlaceholderText("Enter your username"), "veganlover");
      await user.type(screen.getByPlaceholderText("Enter your email"), "vegan@example.com");
      await user.selectOptions(screen.getByRole("combobox"), "user");
      await user.type(screen.getByPlaceholderText("Create a strong password"), "Password1");
      await user.type(screen.getByPlaceholderText("Confirm your password"), "Password2");
      await user.click(screen.getByRole("button", { name: "Create Account" }));

      const alerts = await screen.findAllByRole("alert");
      const messages = alerts.map((el) => el.textContent);
      expect(messages).toContain("Passwords don't match");
    });
  });

  describe("error recovery", () => {
    it("swallows the error thrown by onSubmit so the form does not crash", async () => {
      const user = userEvent.setup();
      const props = buildProps({
        onSubmit: jest.fn().mockRejectedValue(new Error("Email already taken")),
      });
      render(<RegisterForm {...props} />);

      await fillValidForm(user);
      await expect(
        user.click(screen.getByRole("button", { name: "Create Account" }))
      ).resolves.not.toThrow();

      await waitFor(() => {
        expect(props.onSubmit).toHaveBeenCalledTimes(1);
      });
    });
  });
});
