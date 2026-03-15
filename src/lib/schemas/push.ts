import { z } from "zod";

// Mirrors NotificationSettings in push-notifications.tsx — every field is
// optional so callers can send partial updates (PATCH semantics over PUT).
// .refine() ensures that an empty body {} is rejected: at least one field
// must be present to constitute a meaningful update.
export const notificationSettingsSchema = z
  .object({
    enabled: z.boolean().optional(),
    newRestaurants: z.boolean().optional(),
    newRecipes: z.boolean().optional(),
    communityUpdates: z.boolean().optional(),
    healthTips: z.boolean().optional(),
    promotions: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one setting must be provided",
  });
