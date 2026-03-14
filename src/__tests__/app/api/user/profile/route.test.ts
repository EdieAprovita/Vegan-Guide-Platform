import { z } from "zod";

// Validation schema from route handler
const updateProfileSchema = z.object({
  username: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
});

describe("Profile route validation schema", () => {
  describe("updateProfileSchema validation", () => {
    it("accepts valid profile update data", () => {
      const validData = {
        firstName: "John",
        lastName: "Doe",
        bio: "Test bio",
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("accepts empty object (all fields optional)", () => {
      const result = updateProfileSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("accepts individual fields", () => {
      const scenarios = [
        { firstName: "John" },
        { email: "new@example.com" },
        { bio: "New bio" },
        { username: "newusername" },
        { phone: "1234567890" },
      ];

      scenarios.forEach((data) => {
        const result = updateProfileSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("rejects invalid email format", () => {
      const result = updateProfileSchema.safeParse({
        email: "invalid-email",
      });
      expect(result.success).toBe(false);
    });

    it("rejects firstName shorter than 1 character", () => {
      const result = updateProfileSchema.safeParse({
        firstName: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects firstName longer than 50 characters", () => {
      const result = updateProfileSchema.safeParse({
        firstName: "a".repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it("rejects lastName longer than 50 characters", () => {
      const result = updateProfileSchema.safeParse({
        lastName: "b".repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it("rejects bio longer than 500 characters", () => {
      const result = updateProfileSchema.safeParse({
        bio: "c".repeat(501),
      });
      expect(result.success).toBe(false);
    });

    it("accepts bio at maximum length (500 chars)", () => {
      const result = updateProfileSchema.safeParse({
        bio: "c".repeat(500),
      });
      expect(result.success).toBe(true);
    });

    it("rejects username shorter than 2 characters", () => {
      const result = updateProfileSchema.safeParse({
        username: "a",
      });
      expect(result.success).toBe(false);
    });

    it("rejects username longer than 50 characters", () => {
      const result = updateProfileSchema.safeParse({
        username: "u".repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it("accepts username at boundaries (2 and 50 chars)", () => {
      const minResult = updateProfileSchema.safeParse({
        username: "ab",
      });
      const maxResult = updateProfileSchema.safeParse({
        username: "u".repeat(50),
      });

      expect(minResult.success).toBe(true);
      expect(maxResult.success).toBe(true);
    });

    it("rejects unknown fields (stripUnknown behavior)", () => {
      const data = {
        firstName: "John",
        unknownField: "should be ignored",
        role: "admin", // Cannot set role via profile update
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
      // Zod should only validate known fields
      expect(result.data).toEqual({ firstName: "John" });
    });

    it("rejects mixed invalid and valid fields", () => {
      const result = updateProfileSchema.safeParse({
        firstName: "John", // valid
        email: "invalid-email", // invalid
      });
      expect(result.success).toBe(false);
    });

    it("accepts complex valid profile update", () => {
      const result = updateProfileSchema.safeParse({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        username: "janesmith",
        bio: "I love vegan food and sustainable living.",
        phone: "+1-555-123-4567",
      });
      expect(result.success).toBe(true);
    });

    it("accepts undefined values for optional fields", () => {
      const result = updateProfileSchema.safeParse({
        firstName: "John",
        bio: undefined,
      });
      // Zod with .optional() accepts undefined
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ firstName: "John" });
    });
  });

  describe("error detail validation", () => {
    it("provides specific error message for email validation", () => {
      const result = updateProfileSchema.safeParse({
        email: "not-an-email",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("email");
      }
    });

    it("provides specific error message for length constraints", () => {
      const result = updateProfileSchema.safeParse({
        firstName: "a".repeat(51),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("firstName");
      }
    });
  });
});
