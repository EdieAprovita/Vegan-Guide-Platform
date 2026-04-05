/**
 * Unit tests for the InstallPrompt PWA component.
 *
 * Focuses on the localStorage dismissal persistence with 30-day TTL
 * and cleanup on successful install.
 */

import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { InstallPrompt } from "@/components/features/pwa/install-prompt";
import * as usePWAModule from "@/hooks/usePWA";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("@/hooks/usePWA");

const mockUsePWA = usePWAModule.usePWA as jest.MockedFunction<typeof usePWAModule.usePWA>;

const defaultPWA = {
  isPWAInstalled: false,
  isOnline: true,
  canInstall: true,
  installPWA: jest.fn().mockResolvedValue(undefined),
  requestNotificationPermission: jest.fn(),
  subscribeToPush: jest.fn(),
  hasNotificationPermission: false,
  clearCache: jest.fn(),
  updateAvailable: false,
  updateServiceWorker: jest.fn(),
};

const DISMISS_KEY = "pwa-prompt-dismissed-at";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderInstallPrompt() {
  return render(<InstallPrompt />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("InstallPrompt — dismissal persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUsePWA.mockReturnValue(defaultPWA);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows the prompt after 3 s when canInstall is true and not dismissed", () => {
    renderInstallPrompt();
    expect(screen.queryByText("Install Vegan Guide")).toBeNull();

    act(() => {
      jest.advanceTimersByTime(3001);
    });

    expect(screen.getByText("Install Vegan Guide")).toBeInTheDocument();
  });

  it("does not show the prompt when dismissed within 30 days", () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() - 1000)); // 1 s ago
    renderInstallPrompt();

    act(() => {
      jest.advanceTimersByTime(3001);
    });

    expect(screen.queryByText("Install Vegan Guide")).toBeNull();
  });

  it("shows the prompt again when dismissal timestamp is older than 30 days", () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() - THIRTY_DAYS_MS - 1));
    renderInstallPrompt();

    act(() => {
      jest.advanceTimersByTime(3001);
    });

    expect(screen.getByText("Install Vegan Guide")).toBeInTheDocument();
  });

  it("persists a timestamp (not 'true') to localStorage on dismiss", () => {
    renderInstallPrompt();

    act(() => {
      jest.advanceTimersByTime(3001);
    });

    const laterButton = screen.getByRole("button", { name: /later/i });
    fireEvent.click(laterButton);

    const stored = localStorage.getItem(DISMISS_KEY);
    expect(stored).not.toBeNull();
    const ts = Number.parseInt(stored!, 10);
    expect(Number.isNaN(ts)).toBe(false);
    expect(ts).toBeGreaterThan(0);
    // Must NOT be the old "true" string
    expect(stored).not.toBe("true");
  });

  it("removes the dismiss key from localStorage on successful install", async () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() - 1000));
    // Reset dismissed state by not having it in storage
    localStorage.clear();

    renderInstallPrompt();

    act(() => {
      jest.advanceTimersByTime(3001);
    });

    const installButton = screen.getByRole("button", { name: /^install$/i });

    await act(async () => {
      fireEvent.click(installButton);
    });

    expect(localStorage.getItem(DISMISS_KEY)).toBeNull();
  });
});
