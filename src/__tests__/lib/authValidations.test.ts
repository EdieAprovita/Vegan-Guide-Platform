import { loginSchema, registerSchema } from "@/lib/validations/auth";

describe("loginSchema", () => {
  const validData = { email: "test@example.com", password: "Password1" };

  it("accepts valid data", () => {
    expect(loginSchema.parse(validData)).toEqual(validData);
  });

  it("rejects invalid email", () => {
    expect(() => loginSchema.parse({ ...validData, email: "invalid" })).toThrow();
  });

  it("rejects short password", () => {
    expect(() => loginSchema.parse({ ...validData, password: "short" })).toThrow();
  });
});

describe("registerSchema", () => {
  const base = {
    username: "tester",
    email: "test@example.com",
    password: "Password1",
    confirmPassword: "Password1",
    role: "user" as const,
  };

  it("accepts valid data", () => {
    expect(registerSchema.parse(base)).toEqual(base);
  });

  it("requires matching passwords", () => {
    expect(() => registerSchema.parse({ ...base, confirmPassword: "Other123" })).toThrow();
  });

  it("requires strong password", () => {
    expect(() =>
      registerSchema.parse({ ...base, password: "weak", confirmPassword: "weak" })
    ).toThrow();
  });
});
