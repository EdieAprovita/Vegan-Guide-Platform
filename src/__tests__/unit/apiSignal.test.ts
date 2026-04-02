import {
  getPosts,
  getPost,
  getNearbyPosts,
  getPostsByTags,
  getAdvancedPosts,
} from "@/lib/api/posts";
import {
  getProfessions,
  getProfession,
  getNearbyProfessions,
  getProfessionsByCategory,
  getProfessionalProfiles,
  getProfessionalProfile,
  getNearbyProfessionalProfiles,
  getAdvancedProfessionalProfiles,
} from "@/lib/api/professions";
import {
  getSanctuaries,
  getNearbySanctuaries,
  getSanctuariesByType,
  getAdvancedSanctuaries,
} from "@/lib/api/sanctuaries";
import { apiRequest } from "@/lib/api/config";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("@/lib/api/config", () => ({
  apiRequest: jest.fn(),
  getApiHeaders: jest.fn(() => ({ "Content-Type": "application/json" })),
  shouldUseApiFallback: jest.fn(() => false),
  isNonApiTransportError: jest.fn(() => true),
}));

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

beforeEach(() => {
  jest.clearAllMocks();
  mockApiRequest.mockResolvedValue({ success: true, data: [] });
});

// ---------------------------------------------------------------------------
// H-14 — posts.ts signal forwarding
// ---------------------------------------------------------------------------

describe("H-14: posts.ts — signal forwarding", () => {
  it("getPosts forwards AbortSignal to apiRequest", async () => {
    const signal = new AbortController().signal;
    await getPosts(undefined, signal);
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal })
    );
  });

  it("getPost forwards AbortSignal to apiRequest", async () => {
    const signal = new AbortController().signal;
    await getPost("abc123", signal);
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/posts/abc123",
      expect.objectContaining({ signal })
    );
  });

  it("getNearbyPosts forwards AbortSignal to apiRequest", async () => {
    const signal = new AbortController().signal;
    await getNearbyPosts({ latitude: 40.0, longitude: -3.0 }, signal);
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal })
    );
  });

  it("getPostsByTags forwards AbortSignal to apiRequest", async () => {
    const signal = new AbortController().signal;
    await getPostsByTags({ tags: "vegan" }, signal);
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal })
    );
  });

  it("getAdvancedPosts forwards AbortSignal to apiRequest", async () => {
    const signal = new AbortController().signal;
    await getAdvancedPosts({}, signal);
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal })
    );
  });

  it("getPosts works without signal (backwards-compatible)", async () => {
    await getPosts({ page: 1 });
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.stringContaining("/posts"),
      expect.objectContaining({ signal: undefined })
    );
  });
});

// ---------------------------------------------------------------------------
// H-14 — professions.ts signal forwarding
// ---------------------------------------------------------------------------

describe("H-14: professions.ts — signal forwarding", () => {
  it("getProfessions forwards AbortSignal to apiRequest", async () => {
    const signal = new AbortController().signal;
    await getProfessions(undefined, signal);
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.stringContaining("/professions"),
      expect.objectContaining({ signal })
    );
  });

  it("getProfession forwards AbortSignal to apiRequest", async () => {
    const signal = new AbortController().signal;
    await getProfession("id-1", signal);
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/professions/id-1",
      expect.objectContaining({ signal })
    );
  });

  it("getNearbyProfessions forwards AbortSignal to apiRequest", async () => {
    const signal = new AbortController().signal;
    await getNearbyProfessions({ latitude: 40.0, longitude: -3.0 }, signal);
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal })
    );
  });

  it("getProfessionsByCategory forwards AbortSignal to apiRequest", async () => {
    const signal = new AbortController().signal;
    await getProfessionsByCategory({ category: "nutrition" }, signal);
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal })
    );
  });

  it("getProfessionalProfiles forwards AbortSignal to apiRequest", async () => {
    const signal = new AbortController().signal;
    await getProfessionalProfiles(undefined, signal);
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.stringContaining("/professionalProfile"),
      expect.objectContaining({ signal })
    );
  });

  it("getProfessionalProfile forwards AbortSignal to apiRequest", async () => {
    const signal = new AbortController().signal;
    await getProfessionalProfile("id-2", signal);
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/professionalProfile/id-2",
      expect.objectContaining({ signal })
    );
  });

  it("getNearbyProfessionalProfiles forwards AbortSignal to apiRequest", async () => {
    const signal = new AbortController().signal;
    await getNearbyProfessionalProfiles({ latitude: 40.0, longitude: -3.0 }, signal);
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal })
    );
  });

  it("getAdvancedProfessionalProfiles forwards AbortSignal to apiRequest", async () => {
    const signal = new AbortController().signal;
    await getAdvancedProfessionalProfiles({}, signal);
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.stringContaining("/professionalProfile"),
      expect.objectContaining({ signal })
    );
  });
});

// ---------------------------------------------------------------------------
// H-15 — sanctuaries.ts fallback pattern
// ---------------------------------------------------------------------------

describe("H-15: sanctuaries.ts — transport error fallback", () => {
  beforeEach(() => {
    // Re-import mocked helpers so we can control them per test
    const config = require("@/lib/api/config");
    (config.shouldUseApiFallback as jest.Mock).mockReturnValue(true);
    (config.isNonApiTransportError as jest.Mock).mockReturnValue(true);
  });

  it("getSanctuaries returns empty fallback on transport error in fallback mode", async () => {
    mockApiRequest.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const result = await getSanctuaries();

    expect(result).toEqual({ success: true, data: [] });
  });

  it("getSanctuaries re-throws when shouldUseApiFallback is false", async () => {
    const config = require("@/lib/api/config");
    (config.shouldUseApiFallback as jest.Mock).mockReturnValue(false);
    mockApiRequest.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(getSanctuaries()).rejects.toThrow("Failed to fetch");
  });

  it("getNearbySanctuaries returns empty fallback on transport error in fallback mode", async () => {
    mockApiRequest.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const result = await getNearbySanctuaries({ latitude: 40.0, longitude: -3.0 });

    expect(result).toEqual({ success: true, data: [] });
  });

  it("getSanctuariesByType returns empty fallback on transport error in fallback mode", async () => {
    mockApiRequest.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const result = await getSanctuariesByType("rescue");

    expect(result).toEqual({ success: true, data: [] });
  });

  it("getAdvancedSanctuaries returns empty fallback on transport error in fallback mode", async () => {
    mockApiRequest.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const result = await getAdvancedSanctuaries({});

    expect(result).toEqual({ success: true, data: [] });
  });
});

// M-08 tests (FormData Content-Type) live in a dedicated file that does NOT
// mock @/lib/api/config, allowing the real apiRequest to be tested:
// src/__tests__/unit/apiFormData.test.ts
