import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  newPasswordSchema,
  forgotPasswordSchema,
  updateProfileSchema,
} from "@/lib/validations/auth";

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

describe("resetPasswordSchema", () => {
  it("accepts a valid email", () => {
    expect(resetPasswordSchema.parse({ email: "user@example.com" })).toEqual({
      email: "user@example.com",
    });
  });

  it("rejects an invalid email", () => {
    expect(() => resetPasswordSchema.parse({ email: "not-an-email" })).toThrow();
  });
});

describe("newPasswordSchema", () => {
  it("accepts matching strong passwords", () => {
    const data = { password: "Password1", confirmPassword: "Password1" };
    expect(newPasswordSchema.parse(data)).toEqual(data);
  });

  it("rejects non-matching passwords", () => {
    expect(() =>
      newPasswordSchema.parse({ password: "Password1", confirmPassword: "Other123" })
    ).toThrow();
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts a valid email", () => {
    expect(forgotPasswordSchema.parse({ email: "user@example.com" })).toEqual({
      email: "user@example.com",
    });
  });

  it("rejects missing email", () => {
    expect(() => forgotPasswordSchema.parse({ email: "" })).toThrow();
  });
});

describe("updateProfileSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    expect(updateProfileSchema.parse({})).toEqual({});
  });

  it("accepts valid optional fields", () => {
    const data = {
      username: "newuser",
      email: "new@example.com",
      photo: "https://example.com/photo.jpg",
    };
    expect(updateProfileSchema.parse(data)).toEqual(data);
  });
});
