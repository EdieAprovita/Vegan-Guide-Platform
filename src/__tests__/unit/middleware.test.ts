import type { NextRequest } from "next/server";
import { middleware, config } from "@/middleware";
import { auth } from "@/lib/auth";

jest.mock("next/server", () => {
  const createHeaders = (location?: string) => ({
    get: (key: string) => {
      if (key.toLowerCase() === "location" && location) {
        return location;
      }
      return null;
    },
    set: jest.fn(),
    append: jest.fn(),
    delete: jest.fn(),
  });

  return {
    NextResponse: {
      redirect: jest.fn((url: URL | string) => {
        const href = typeof url === "string" ? url : url.toString();
        return {
          status: 307,
          headers: createHeaders(href),
        };
      }),
      next: jest.fn(() => ({
        status: 200,
        headers: createHeaders(),
      })),
    },
  };
});

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

const mockAuth = auth as jest.Mock;

const createRequest = (path: string): NextRequest => {
  const url = `http://localhost${path}`;
  return {
    nextUrl: new URL(url),
    url,
  } as unknown as NextRequest;
};

describe("middleware", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("redirects unauthenticated users to login with callback", async () => {
    mockAuth.mockResolvedValue(null);

    const response = await middleware(createRequest("/profile"));

    expect(response?.headers.get("location")).toBe("http://localhost/login?callbackUrl=%2Fprofile");
  });

  it("redirects authenticated users away from auth routes", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1" } });

    const response = await middleware(createRequest("/login"));

    expect(response?.headers.get("location")).toBe("http://localhost/profile");
  });

  it("allows authenticated users on protected routes", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1" } });

    const response = await middleware(createRequest("/profile"));

    expect(response?.headers.get("location")).toBeNull();
    expect(response?.status).toBe(200);
  });
});

describe("middleware config", () => {
  it("matches protected and auth routes", () => {
    expect(config.matcher).toContain("/profile/:path*");
    expect(config.matcher).toContain("/login");
    expect(config.matcher).toContain("/register");
    expect(config.matcher).toContain("/reset-password");
  });
});
