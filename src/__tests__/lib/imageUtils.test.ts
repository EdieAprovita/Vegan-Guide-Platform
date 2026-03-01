import {
  isNextImageAvailable,
  isValidImageUrl,
  getFallbackImage,
  getPlaceholderImage,
  preloadImage,
  getOptimizedDimensions,
  shouldOptimizeImage,
} from "@/lib/image-utils";

// ---------------------------------------------------------------------------
describe("isNextImageAvailable", () => {
  // jsdom provides window; we manipulate __NEXT_DATA__ directly instead of
  // redefining the window property (which is non-configurable in jsdom).
  // eslint-disable-next-line
  const win = window as unknown as Record<string, unknown>;

  afterEach(() => {
    delete win.__NEXT_DATA__;
  });

  it("returns true when window.__NEXT_DATA__ is set", () => {
    win.__NEXT_DATA__ = { props: {}, page: "", query: {}, buildId: "" };
    expect(isNextImageAvailable()).toBe(true);
  });

  it("returns false when window is defined but __NEXT_DATA__ is absent", () => {
    delete win.__NEXT_DATA__;
    expect(isNextImageAvailable()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
describe("isValidImageUrl", () => {
  it("returns false for an empty string", () => {
    expect(isValidImageUrl("")).toBe(false);
  });

  it("returns true for data URLs", () => {
    expect(isValidImageUrl("data:image/png;base64,abc123")).toBe(true);
  });

  it("returns true for relative paths starting with /", () => {
    expect(isValidImageUrl("/images/photo.jpg")).toBe(true);
    expect(isValidImageUrl("/")).toBe(true);
  });

  it("returns true for http URLs", () => {
    expect(isValidImageUrl("http://example.com/image.png")).toBe(true);
  });

  it("returns true for https URLs", () => {
    expect(isValidImageUrl("https://cdn.example.com/photo.webp")).toBe(true);
  });

  it("returns false for ftp URLs", () => {
    expect(isValidImageUrl("ftp://example.com/file.png")).toBe(false);
  });

  it("returns false for plain strings that are not URLs", () => {
    expect(isValidImageUrl("not-a-url")).toBe(false);
  });

  it("returns false for javascript: URLs", () => {
    expect(isValidImageUrl("javascript:alert(1)")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
describe("getFallbackImage", () => {
  it("returns a base64 data:image/svg+xml string", () => {
    const result = getFallbackImage();
    expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it("includes the default 200x200 dimensions in the decoded SVG", () => {
    const result = getFallbackImage();
    const base64 = result.replace("data:image/svg+xml;base64,", "");
    const decoded = atob(base64);
    expect(decoded).toContain('width="200"');
    expect(decoded).toContain('height="200"');
  });

  it("uses custom width and height when provided", () => {
    const result = getFallbackImage(400, 300);
    const decoded = atob(result.replace("data:image/svg+xml;base64,", ""));
    expect(decoded).toContain('width="400"');
    expect(decoded).toContain('height="300"');
  });

  it("includes the fallback text", () => {
    const decoded = atob(getFallbackImage().replace("data:image/svg+xml;base64,", ""));
    expect(decoded).toContain("Image not available");
  });
});

// ---------------------------------------------------------------------------
describe("getPlaceholderImage", () => {
  it("returns a base64 data:image/svg+xml string", () => {
    const result = getPlaceholderImage();
    expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it("includes the default 200x200 dimensions", () => {
    const result = getPlaceholderImage();
    const decoded = atob(result.replace("data:image/svg+xml;base64,", ""));
    expect(decoded).toContain('width="200"');
    expect(decoded).toContain('height="200"');
  });

  it("uses custom width and height when provided", () => {
    const result = getPlaceholderImage(800, 600);
    const decoded = atob(result.replace("data:image/svg+xml;base64,", ""));
    expect(decoded).toContain('width="800"');
    expect(decoded).toContain('height="600"');
  });

  it("includes the loading text", () => {
    const decoded = atob(getPlaceholderImage().replace("data:image/svg+xml;base64,", ""));
    expect(decoded).toContain("Loading...");
  });
});

// ---------------------------------------------------------------------------
describe("preloadImage", () => {
  beforeEach(() => {
    // Provide a minimal Image mock for jsdom
    class MockImage {
      src = "";
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
    }

    Object.defineProperty(globalThis, "Image", {
      value: MockImage,
      writable: true,
      configurable: true,
    });
  });

  it("rejects immediately for an invalid URL", async () => {
    await expect(preloadImage("not-a-valid-url")).rejects.toThrow("Invalid image URL");
  });

  it("resolves when the image loads successfully (https URL)", async () => {
    // Simulate onload firing after src is set
    class LoadingImage {
      _src = "";
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(value: string) {
        this._src = value;
        // Trigger onload asynchronously
        Promise.resolve().then(() => this.onload?.());
      }
    }

    Object.defineProperty(globalThis, "Image", {
      value: LoadingImage,
      writable: true,
      configurable: true,
    });

    await expect(preloadImage("https://example.com/photo.jpg")).resolves.toBeUndefined();
  });

  it("rejects when the image fails to load", async () => {
    class ErrorImage {
      _src = "";
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(value: string) {
        this._src = value;
        Promise.resolve().then(() => this.onerror?.());
      }
    }

    Object.defineProperty(globalThis, "Image", {
      value: ErrorImage,
      writable: true,
      configurable: true,
    });

    await expect(preloadImage("https://example.com/broken.jpg")).rejects.toThrow(
      "Failed to load image"
    );
  });

  it("resolves for a relative path (valid URL)", async () => {
    class LoadingImage {
      _src = "";
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(value: string) {
        this._src = value;
        Promise.resolve().then(() => this.onload?.());
      }
    }

    Object.defineProperty(globalThis, "Image", {
      value: LoadingImage,
      writable: true,
      configurable: true,
    });

    await expect(preloadImage("/images/photo.jpg")).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
describe("getOptimizedDimensions", () => {
  it("returns original dimensions when they fit within bounds", () => {
    expect(getOptimizedDimensions(100, 100, 200, 200)).toEqual({ width: 100, height: 100 });
  });

  it("scales down proportionally when width exceeds maxWidth", () => {
    const result = getOptimizedDimensions(800, 400, 400, 400);
    expect(result.width).toBe(400);
    expect(result.height).toBe(200);
  });

  it("scales down proportionally when height exceeds maxHeight", () => {
    const result = getOptimizedDimensions(400, 800, 400, 400);
    expect(result.width).toBe(200);
    expect(result.height).toBe(400);
  });

  it("handles square images correctly", () => {
    const result = getOptimizedDimensions(1000, 1000, 500, 500);
    expect(result.width).toBe(500);
    expect(result.height).toBe(500);
  });

  it("returns original dimensions when both dimensions are exactly at max bounds", () => {
    expect(getOptimizedDimensions(200, 200, 200, 200)).toEqual({ width: 200, height: 200 });
  });

  it("constrains by height when the width-constrained height would exceed maxHeight", () => {
    // Wide image: 2000x1000; maxWidth=500, maxHeight=400
    // Width constrained: 500 x 250 → 250 <= 400, so width wins
    const result = getOptimizedDimensions(2000, 1000, 500, 400);
    expect(result.width).toBe(500);
    expect(result.height).toBe(250);
  });

  it("constrains by the binding dimension for tall images", () => {
    // Tall image: 400x1600; maxWidth=500, maxHeight=400
    // Width constrained: 500 x 2000 → 2000 > 400, so height wins
    const result = getOptimizedDimensions(400, 1600, 500, 400);
    expect(result.width).toBe(100);
    expect(result.height).toBe(400);
  });
});

// ---------------------------------------------------------------------------
describe("shouldOptimizeImage", () => {
  it("returns false for data URLs", () => {
    expect(shouldOptimizeImage("data:image/png;base64,abc")).toBe(false);
  });

  it("returns false for SVG files", () => {
    expect(shouldOptimizeImage("/icons/logo.svg")).toBe(false);
    expect(shouldOptimizeImage("https://example.com/graphic.svg")).toBe(false);
  });

  it("returns false for already-optimized URLs containing w= query param", () => {
    expect(shouldOptimizeImage("https://cdn.example.com/photo.jpg?w=800")).toBe(false);
  });

  it("returns false for already-optimized URLs containing h= query param", () => {
    expect(shouldOptimizeImage("https://cdn.example.com/photo.jpg?h=600")).toBe(false);
  });

  it("returns true for regular http/https image URLs", () => {
    expect(shouldOptimizeImage("https://example.com/photo.jpg")).toBe(true);
    expect(shouldOptimizeImage("http://example.com/image.png")).toBe(true);
  });

  it("returns true for relative image paths", () => {
    expect(shouldOptimizeImage("/images/photo.webp")).toBe(true);
  });

  it("returns true for URLs with query strings that do not contain w= or h=", () => {
    expect(shouldOptimizeImage("https://example.com/photo.jpg?v=2")).toBe(true);
  });
});
