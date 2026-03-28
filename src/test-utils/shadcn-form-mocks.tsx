/**
 * Shared mock factories for shadcn/ui form primitives used in auth form tests.
 *
 * Extracts the common `jest.mock(...)` factories so each test file calls
 * `jest.mock("@/components/ui/form", () => createFormMock())` instead of
 * duplicating ~50 lines of mock setup.
 *
 * These use real `react-hook-form` Controller logic so field state
 * (value, onChange, onBlur) is wired up correctly in jsdom, and
 * FormMessage reads actual Zod validation errors via `useFormContext()`.
 */

import type React from "react";

/* ---------- @/components/ui/form ---------- */

export function createFormMock() {
  const ReactImpl = require("react") as typeof import("react");

  const { Controller, FormProvider, useFormContext } =
    require("react-hook-form") as typeof import("react-hook-form");

  const FormFieldNameContext = ReactImpl.createContext<string>("");

  return {
    Form: FormProvider,
    FormField: ({
      name,
      control,
      render: renderFn,
    }: {
      name: string;
      control: object;
      render: (args: { field: object; fieldState: object }) => React.ReactElement;
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
      const fieldName = ReactImpl.useContext(FormFieldNameContext);
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
}

/* ---------- @/components/ui/button ---------- */

export function createButtonMock() {
  return {
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
  };
}

/* ---------- @/components/ui/input ---------- */

export function createInputMock() {
  return {
    Input: (props: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) => {
      const { className: _cls, ...rest } = props;
      return <input {...rest} />;
    },
  };
}
