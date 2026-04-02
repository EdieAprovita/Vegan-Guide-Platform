/**
 * Tests for Zod validation schemas:
 *  - restaurants: createRestaurantSchema, updateRestaurantSchema, restaurantReviewSchema
 *  - markets:     createMarketSchema, updateMarketSchema, marketReviewSchema
 *  - doctors:     createDoctorSchema, updateDoctorSchema, doctorReviewSchema
 */

import {
  createRestaurantSchema,
  updateRestaurantSchema,
  restaurantReviewSchema,
} from "@/lib/validations/restaurants";

import {
  createMarketSchema,
  updateMarketSchema,
  marketReviewSchema,
} from "@/lib/validations/markets";

import {
  createDoctorSchema,
  updateDoctorSchema,
  doctorReviewSchema,
} from "@/lib/validations/doctors";

// ============================================================
// Helper that extracts all error messages from a ZodError
// ============================================================
function parseErrors(
  schema: {
    safeParse: (v: unknown) => { success: boolean; error?: { errors: { message: string }[] } };
  },
  data: unknown
): string[] {
  const result = schema.safeParse(data);
  if (result.success) return [];
  return result.error?.errors.map((e) => e.message) ?? [];
}

// ============================================================
// RESTAURANT VALIDATIONS
// ============================================================

describe("createRestaurantSchema", () => {
  const valid = {
    restaurantName: "Green Bistro",
    address: "123 Plant Street",
    contact: [{ phone: "555-0100" }],
    cuisine: ["Vegan"],
  };

  it("accepts a valid restaurant payload", () => {
    expect(createRestaurantSchema.parse(valid)).toMatchObject(valid);
  });

  it("accepts an optional location field", () => {
    const withLocation = {
      ...valid,
      location: { type: "Point", coordinates: [-74.006, 40.7128] },
    };
    expect(createRestaurantSchema.parse(withLocation)).toMatchObject(withLocation);
  });

  it("rejects when restaurantName is missing", () => {
    const errors = parseErrors(createRestaurantSchema, { ...valid, restaurantName: "" });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects restaurantName shorter than 2 characters", () => {
    const errors = parseErrors(createRestaurantSchema, { ...valid, restaurantName: "A" });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects restaurantName longer than 100 characters", () => {
    const longName = "A".repeat(101);
    const errors = parseErrors(createRestaurantSchema, { ...valid, restaurantName: longName });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects address shorter than 5 characters", () => {
    const errors = parseErrors(createRestaurantSchema, { ...valid, address: "123" });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects empty contact array", () => {
    const errors = parseErrors(createRestaurantSchema, { ...valid, contact: [] });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects invalid facebook URL in contact", () => {
    const errors = parseErrors(createRestaurantSchema, {
      ...valid,
      contact: [{ facebook: "not-a-url" }],
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects empty cuisine array", () => {
    const errors = parseErrors(createRestaurantSchema, { ...valid, cuisine: [] });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("accepts valid contact with facebook and instagram URLs", () => {
    const withUrls = {
      ...valid,
      contact: [
        {
          phone: "555-0200",
          facebook: "https://facebook.com/bistro",
          instagram: "https://instagram.com/bistro",
        },
      ],
    };
    expect(() => createRestaurantSchema.parse(withUrls)).not.toThrow();
  });
});

describe("updateRestaurantSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    expect(updateRestaurantSchema.parse({})).toEqual({});
  });

  it("accepts a partial update with only restaurantName", () => {
    expect(updateRestaurantSchema.parse({ restaurantName: "New Name" })).toMatchObject({
      restaurantName: "New Name",
    });
  });

  it("rejects an invalid partial field", () => {
    const errors = parseErrors(updateRestaurantSchema, { restaurantName: "A" });
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe("restaurantReviewSchema", () => {
  const valid = { rating: 4, comment: "Really enjoyed the food." };

  it("accepts a valid review", () => {
    expect(restaurantReviewSchema.parse(valid)).toEqual(valid);
  });

  it("accepts rating boundary values 1 and 5", () => {
    expect(() => restaurantReviewSchema.parse({ ...valid, rating: 1 })).not.toThrow();
    expect(() => restaurantReviewSchema.parse({ ...valid, rating: 5 })).not.toThrow();
  });

  it("rejects rating below 1", () => {
    const errors = parseErrors(restaurantReviewSchema, { ...valid, rating: 0 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects rating above 5", () => {
    const errors = parseErrors(restaurantReviewSchema, { ...valid, rating: 6 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects comment shorter than 10 characters", () => {
    const errors = parseErrors(restaurantReviewSchema, { ...valid, comment: "Short" });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects comment longer than 500 characters", () => {
    const errors = parseErrors(restaurantReviewSchema, { ...valid, comment: "A".repeat(501) });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects missing comment", () => {
    const errors = parseErrors(restaurantReviewSchema, { rating: 4 });
    expect(errors.length).toBeGreaterThan(0);
  });
});

// ============================================================
// MARKET VALIDATIONS
// ============================================================

describe("createMarketSchema", () => {
  const valid = {
    marketName: "Green Farmers Market",
    address: "456 Organic Avenue",
    contact: [{ phone: "555-0200" }],
    products: ["vegetables", "fruits"],
    hours: [{ day: "Saturday", open: "08:00", close: "14:00" }],
  };

  it("accepts a valid market payload", () => {
    expect(createMarketSchema.parse(valid)).toMatchObject(valid);
  });

  it("accepts an optional location field", () => {
    const withLocation = {
      ...valid,
      location: { type: "Point", coordinates: [-73.935, 40.73] },
    };
    expect(createMarketSchema.parse(withLocation)).toMatchObject(withLocation);
  });

  it("rejects when marketName is missing", () => {
    const errors = parseErrors(createMarketSchema, { ...valid, marketName: "" });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects marketName shorter than 2 characters", () => {
    const errors = parseErrors(createMarketSchema, { ...valid, marketName: "X" });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects marketName longer than 100 characters", () => {
    const errors = parseErrors(createMarketSchema, { ...valid, marketName: "M".repeat(101) });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects address shorter than 5 characters", () => {
    const errors = parseErrors(createMarketSchema, { ...valid, address: "123" });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects empty contact array", () => {
    const errors = parseErrors(createMarketSchema, { ...valid, contact: [] });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects invalid email in contact", () => {
    const errors = parseErrors(createMarketSchema, {
      ...valid,
      contact: [{ email: "not-an-email" }],
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects invalid website URL in contact", () => {
    const errors = parseErrors(createMarketSchema, {
      ...valid,
      contact: [{ website: "not-a-url" }],
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects empty products array", () => {
    const errors = parseErrors(createMarketSchema, { ...valid, products: [] });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects empty hours array", () => {
    const errors = parseErrors(createMarketSchema, { ...valid, hours: [] });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects hours entry with missing day", () => {
    const errors = parseErrors(createMarketSchema, {
      ...valid,
      hours: [{ day: "", open: "08:00", close: "14:00" }],
    });
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe("updateMarketSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    expect(updateMarketSchema.parse({})).toEqual({});
  });

  it("accepts a partial update with only marketName", () => {
    expect(updateMarketSchema.parse({ marketName: "New Market Name" })).toMatchObject({
      marketName: "New Market Name",
    });
  });

  it("rejects an invalid partial field", () => {
    const errors = parseErrors(updateMarketSchema, { marketName: "X" });
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe("marketReviewSchema", () => {
  const valid = { rating: 5, comment: "Wonderful fresh produce!" };

  it("accepts a valid review", () => {
    expect(marketReviewSchema.parse(valid)).toEqual(valid);
  });

  it("accepts boundary ratings 1 and 5", () => {
    expect(() => marketReviewSchema.parse({ ...valid, rating: 1 })).not.toThrow();
    expect(() => marketReviewSchema.parse({ ...valid, rating: 5 })).not.toThrow();
  });

  it("rejects rating below 1", () => {
    const errors = parseErrors(marketReviewSchema, { ...valid, rating: 0 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects rating above 5", () => {
    const errors = parseErrors(marketReviewSchema, { ...valid, rating: 6 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects comment shorter than 10 characters", () => {
    const errors = parseErrors(marketReviewSchema, { ...valid, comment: "Too short" });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects comment longer than 500 characters", () => {
    const errors = parseErrors(marketReviewSchema, { ...valid, comment: "C".repeat(501) });
    expect(errors.length).toBeGreaterThan(0);
  });
});

// ============================================================
// DOCTOR VALIDATIONS
// ============================================================

describe("createDoctorSchema", () => {
  const valid = {
    name: "Dr. Emily Green",
    specialty: "Nutrition",
    address: "789 Health Boulevard",
    contact: [{ phone: "555-0300" }],
    education: ["MD, Harvard Medical School"],
    experience: "10 years of nutritional medicine practice.",
    languages: ["English", "Spanish"],
  };

  it("accepts a valid doctor payload", () => {
    expect(createDoctorSchema.parse(valid)).toMatchObject(valid);
  });

  it("accepts an optional location field", () => {
    const withLocation = {
      ...valid,
      location: { type: "Point", coordinates: [-73.99, 40.73] },
    };
    expect(createDoctorSchema.parse(withLocation)).toMatchObject(withLocation);
  });

  it("rejects when name is missing", () => {
    const errors = parseErrors(createDoctorSchema, { ...valid, name: "" });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects name shorter than 2 characters", () => {
    const errors = parseErrors(createDoctorSchema, { ...valid, name: "D" });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects name longer than 100 characters", () => {
    const errors = parseErrors(createDoctorSchema, { ...valid, name: "N".repeat(101) });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects when specialty is missing", () => {
    const errors = parseErrors(createDoctorSchema, { ...valid, specialty: "" });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects specialty shorter than 2 characters", () => {
    const errors = parseErrors(createDoctorSchema, { ...valid, specialty: "N" });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects address shorter than 5 characters", () => {
    const errors = parseErrors(createDoctorSchema, { ...valid, address: "123" });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects empty contact array", () => {
    const errors = parseErrors(createDoctorSchema, { ...valid, contact: [] });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects invalid email in contact", () => {
    const errors = parseErrors(createDoctorSchema, {
      ...valid,
      contact: [{ email: "invalid-email" }],
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects empty education array", () => {
    const errors = parseErrors(createDoctorSchema, { ...valid, education: [] });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects experience shorter than 10 characters", () => {
    const errors = parseErrors(createDoctorSchema, { ...valid, experience: "Short." });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects empty languages array", () => {
    const errors = parseErrors(createDoctorSchema, { ...valid, languages: [] });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("accepts valid contact with email and website URL", () => {
    const withEmail = {
      ...valid,
      contact: [
        {
          phone: "555-0400",
          email: "doctor@example.com",
          website: "https://doctor.example.com",
        },
      ],
    };
    expect(() => createDoctorSchema.parse(withEmail)).not.toThrow();
  });
});

describe("updateDoctorSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    expect(updateDoctorSchema.parse({})).toEqual({});
  });

  it("accepts a partial update with only name", () => {
    expect(updateDoctorSchema.parse({ name: "Dr. Updated Name" })).toMatchObject({
      name: "Dr. Updated Name",
    });
  });

  it("rejects an invalid partial field", () => {
    const errors = parseErrors(updateDoctorSchema, { name: "D" });
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe("doctorReviewSchema", () => {
  const valid = { rating: 5, comment: "Excellent doctor, very knowledgeable." };

  it("accepts a valid review", () => {
    expect(doctorReviewSchema.parse(valid)).toEqual(valid);
  });

  it("accepts boundary ratings 1 and 5", () => {
    expect(() => doctorReviewSchema.parse({ ...valid, rating: 1 })).not.toThrow();
    expect(() => doctorReviewSchema.parse({ ...valid, rating: 5 })).not.toThrow();
  });

  it("rejects rating below 1", () => {
    const errors = parseErrors(doctorReviewSchema, { ...valid, rating: 0 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects rating above 5", () => {
    const errors = parseErrors(doctorReviewSchema, { ...valid, rating: 6 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects comment shorter than 10 characters", () => {
    const errors = parseErrors(doctorReviewSchema, { ...valid, comment: "Too short" });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects comment longer than 500 characters", () => {
    const errors = parseErrors(doctorReviewSchema, { ...valid, comment: "D".repeat(501) });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects missing rating field", () => {
    const errors = parseErrors(doctorReviewSchema, { comment: "Good doctor overall." });
    expect(errors.length).toBeGreaterThan(0);
  });
});
