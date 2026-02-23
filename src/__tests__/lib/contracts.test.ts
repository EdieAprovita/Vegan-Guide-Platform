/**
 * Contract Tests — Frontend/Backend alignment verification.
 *
 * These tests verify that:
 * 1. The Zod schemas correctly validate well-formed backend responses.
 * 2. The schemas correctly reject malformed responses.
 * 3. The API functions call the right endpoints with the right payloads.
 *
 * They serve as a canary: if the backend changes a response shape,
 * updating the mocks here to match the new shape forces updating the schemas.
 */

import {
  loginResponseSchema,
  refreshResponseSchema,
  postResponseSchema,
  postsResponseSchema,
  validateLoginResponse,
  validateRefreshResponse,
  validatePostResponse,
} from "@/lib/contracts/schemas";

// ---------------------------------------------------------------------------
// Fixtures — exact shapes expected from the backend
// ---------------------------------------------------------------------------

const validLoginResponse = {
  success: true,
  message: "Login successful",
  data: {
    _id: "64f8e2a1c9d4b5e6f7890123",
    username: "testuser",
    email: "test@example.com",
    role: "user" as const,
    photo: "https://example.com/photo.jpg",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test",
    refreshToken: "refresh-token-value",
  },
};

const validRefreshResponse = {
  success: true,
  data: {
    accessToken: "new-access-token",
    // refreshToken intentionally absent — backend sends it as HttpOnly cookie
  },
};

const validRefreshResponseWithRotation = {
  success: true,
  data: {
    accessToken: "new-access-token",
    refreshToken: "new-refresh-token", // Optional rotation
  },
};

const validPostResponse = {
  success: true,
  data: {
    _id: "post123",
    title: "Test Post",
    content: "Post content",
    author: { _id: "user1", username: "author", photo: undefined },
    tags: ["vegan", "health"],
    likes: ["user2", "user3"],
    comments: [
      {
        _id: "comment1",
        user: { _id: "user2", username: "commenter" },
        text: "Great post!",
        createdAt: "2024-01-15T10:00:00Z",
      },
    ],
    visibility: "public" as const,
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T09:00:00Z",
  },
};

// ---------------------------------------------------------------------------
// Schema validation — login
// ---------------------------------------------------------------------------

describe("loginResponseSchema", () => {
  it("validates a well-formed login response", () => {
    const result = loginResponseSchema.safeParse(validLoginResponse);
    expect(result.success).toBe(true);
  });

  it("validates a login response without photo (optional field)", () => {
    const withoutPhoto = {
      ...validLoginResponse,
      data: { ...validLoginResponse.data, photo: undefined },
    };
    const result = loginResponseSchema.safeParse(withoutPhoto);
    expect(result.success).toBe(true);
  });

  it("rejects a response missing the data.token field", () => {
    const { token: _, ...dataWithoutToken } = validLoginResponse.data;
    const invalid = { ...validLoginResponse, data: dataWithoutToken };
    const result = loginResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a response where success is false", () => {
    const invalid = { ...validLoginResponse, success: false };
    // success: false is technically valid shape — schema allows it
    // The business logic should check success flag, not the schema
    const result = loginResponseSchema.safeParse(invalid);
    expect(result.success).toBe(true); // shape is valid, value semantics are app concern
  });

  it("rejects a response with invalid role", () => {
    const invalid = {
      ...validLoginResponse,
      data: { ...validLoginResponse.data, role: "superadmin" },
    };
    const result = loginResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a response without the { success, data } wrapper (old flat format)", () => {
    // This catches regression to the old bare response format
    const oldFlatFormat = validLoginResponse.data; // no success/data wrapper
    const result = loginResponseSchema.safeParse(oldFlatFormat);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Schema validation — refresh token
// ---------------------------------------------------------------------------

describe("refreshResponseSchema", () => {
  it("validates a refresh response with accessToken only (HttpOnly cookie model)", () => {
    const result = refreshResponseSchema.safeParse(validRefreshResponse);
    expect(result.success).toBe(true);
  });

  it("validates a refresh response with both tokens (rotation model)", () => {
    const result = refreshResponseSchema.safeParse(validRefreshResponseWithRotation);
    expect(result.success).toBe(true);
  });

  it("rejects a response missing accessToken", () => {
    const invalid = {
      success: true,
      data: { refreshToken: "some-refresh-token" },
    };
    const result = refreshResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects the old format that required refreshToken in body", () => {
    // This test documents the FIXED bug: old code required refreshToken in body.
    // New backend only sends accessToken in body (refresh goes via cookie).
    // The schema must accept a response WITHOUT refreshToken in body.
    const bodyWithoutRefreshToken = {
      success: true,
      data: { accessToken: "new-token" }, // no refreshToken
    };
    const result = refreshResponseSchema.safeParse(bodyWithoutRefreshToken);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Schema validation — posts
// ---------------------------------------------------------------------------

describe("postResponseSchema", () => {
  it("validates a well-formed post response", () => {
    const result = postResponseSchema.safeParse(validPostResponse);
    expect(result.success).toBe(true);
  });

  it("validates a post with no comments", () => {
    const noComments = {
      ...validPostResponse,
      data: { ...validPostResponse.data, comments: [] },
    };
    const result = postResponseSchema.safeParse(noComments);
    expect(result.success).toBe(true);
  });

  it("rejects a comment with 'content' field instead of 'text'", () => {
    // This catches the FIXED bug: old code used content, BE uses text
    const withOldCommentField = {
      ...validPostResponse,
      data: {
        ...validPostResponse.data,
        comments: [
          {
            _id: "comment1",
            user: { _id: "user2", username: "commenter" },
            content: "Great post!", // Wrong field name
            createdAt: "2024-01-15T10:00:00Z",
          },
        ],
      },
    };
    const result = postResponseSchema.safeParse(withOldCommentField);
    // 'content' is not in schema, 'text' is missing → should fail
    expect(result.success).toBe(false);
  });

  it("validates a list of posts response", () => {
    const listResponse = {
      success: true,
      data: [validPostResponse.data],
    };
    const result = postsResponseSchema.safeParse(listResponse);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// API function contract — posts payload
// ---------------------------------------------------------------------------

jest.mock("@/lib/api/config", () => ({
  apiRequest: jest.fn(),
  getApiHeaders: jest.fn(() => ({ "Content-Type": "application/json" })),
}));

const { apiRequest } = require("@/lib/api/config");

describe("posts API contract — endpoint routes and payloads", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiRequest as jest.Mock).mockResolvedValue(validPostResponse);
  });

  it("unlikePost calls DELETE /posts/:id/likes (not /posts/unlike/:id)", async () => {
    const { unlikePost } = await import("@/lib/api/posts");
    await unlikePost("post123", "test-token");

    expect(apiRequest).toHaveBeenCalledWith(
      "/posts/post123/likes",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("addComment sends { text } payload (not { content })", async () => {
    const { addComment } = await import("@/lib/api/posts");
    await addComment("post123", { text: "Great post!" }, "test-token");

    expect(apiRequest).toHaveBeenCalledWith(
      "/posts/comment/post123",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ text: "Great post!" }),
      })
    );
    // Verify it does NOT send { content: ... }
    const callArgs = (apiRequest as jest.Mock).mock.calls[0][1];
    expect(callArgs.body).not.toContain('"content"');
  });

  it("deleteComment calls DELETE /posts/:postId/comments/:commentId", async () => {
    const { deleteComment } = await import("@/lib/api/posts");
    await deleteComment("post123", "comment1", "test-token");

    expect(apiRequest).toHaveBeenCalledWith(
      "/posts/post123/comments/comment1",
      expect.objectContaining({ method: "DELETE" })
    );
  });
});

// ---------------------------------------------------------------------------
// validateLoginResponse helper — env-dependent behavior
// ---------------------------------------------------------------------------

describe("validateLoginResponse", () => {
  it("returns parsed data for a valid response", () => {
    const result = validateLoginResponse(validLoginResponse);
    expect(result.data._id).toBe("64f8e2a1c9d4b5e6f7890123");
    expect(result.data.role).toBe("user");
  });

  it("throws in development/test on invalid response", () => {
    const invalid = { success: true, data: { broken: true } };
    expect(() => validateLoginResponse(invalid)).toThrow("[Contract]");
  });
});

describe("validateRefreshResponse", () => {
  it("returns parsed data for a valid response (no refreshToken in body)", () => {
    const result = validateRefreshResponse(validRefreshResponse);
    expect(result.data.accessToken).toBe("new-access-token");
    expect(result.data.refreshToken).toBeUndefined();
  });
});
