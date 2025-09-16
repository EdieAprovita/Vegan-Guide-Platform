import { act } from "@testing-library/react";
import { useSanctuaries } from "@/hooks/useSanctuaries";
import * as sanctuariesApi from "@/lib/api/sanctuaries";

jest.mock("@/lib/api/sanctuaries", () => ({
  getSanctuaries: jest.fn(),
  getSanctuary: jest.fn(),
  createSanctuary: jest.fn(),
  updateSanctuary: jest.fn(),
  deleteSanctuary: jest.fn(),
  addSanctuaryReview: jest.fn(),
  getNearbySanctuaries: jest.fn(),
  getSanctuariesByType: jest.fn(),
  getAdvancedSanctuaries: jest.fn(),
}));

const mockSanctuary = {
  _id: "1",
  sanctuaryName: "Animal Haven",
  image: "/image.jpg",
  typeofSanctuary: "Wildlife",
  animals: [],
  capacity: 100,
  caretakers: ["Alex"],
  contact: [],
  reviews: [],
  rating: 4.9,
  numReviews: 12,
  author: { _id: "user", username: "guardian" },
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

const resetStore = () => {
  useSanctuaries.setState({
    sanctuaries: [],
    currentSanctuary: null,
    isLoading: false,
    error: null,
    totalPages: 0,
    currentPage: 1,
  });
};

const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

beforeEach(() => {
  resetStore();
  jest.clearAllMocks();
});

afterAll(() => {
  consoleErrorSpy.mockRestore();
});

describe("useSanctuaries store actions", () => {
  it("loads sanctuaries and resets pagination", async () => {
    (sanctuariesApi.getSanctuaries as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockSanctuary],
    });

    await act(async () => {
      await useSanctuaries.getState().getSanctuaries({ search: "haven" });
    });

    const state = useSanctuaries.getState();
    expect(sanctuariesApi.getSanctuaries).toHaveBeenCalledWith({ search: "haven" });
    expect(state.sanctuaries).toEqual([mockSanctuary]);
    expect(state.error).toBeNull();
  });

  it("handles fetch errors and stores message", async () => {
    (sanctuariesApi.getSanctuaries as jest.Mock).mockRejectedValue(new Error("offline"));

    await expect(useSanctuaries.getState().getSanctuaries()).rejects.toThrow("offline");

    expect(useSanctuaries.getState().error).toBe("offline");
  });

  it("retrieves a sanctuary by id", async () => {
    (sanctuariesApi.getSanctuary as jest.Mock).mockResolvedValue({
      success: true,
      data: mockSanctuary,
    });

    await act(async () => {
      await useSanctuaries.getState().getSanctuary("1");
    });

    expect(useSanctuaries.getState().currentSanctuary).toEqual(mockSanctuary);
  });

  it("creates sanctuaries and prepends them", async () => {
    (sanctuariesApi.createSanctuary as jest.Mock).mockResolvedValue({
      success: true,
      data: mockSanctuary,
    });

    await act(async () => {
      await useSanctuaries.getState().createSanctuary(mockSanctuary, "token");
    });

    expect(useSanctuaries.getState().sanctuaries[0]).toEqual(mockSanctuary);
  });

  it("updates sanctuaries and keeps current selection in sync", async () => {
    const updated = { ...mockSanctuary, sanctuaryName: "Updated" };
    (sanctuariesApi.updateSanctuary as jest.Mock).mockResolvedValue({
      success: true,
      data: updated,
    });

    useSanctuaries.setState({ sanctuaries: [mockSanctuary], currentSanctuary: mockSanctuary });

    await act(async () => {
      await useSanctuaries.getState().updateSanctuary("1", { sanctuaryName: "Updated" });
    });

    const state = useSanctuaries.getState();
    expect(state.sanctuaries[0]).toEqual(updated);
    expect(state.currentSanctuary).toEqual(updated);
  });

  it("removes sanctuaries when deleting", async () => {
    (sanctuariesApi.deleteSanctuary as jest.Mock).mockResolvedValue(undefined);

    useSanctuaries.setState({ sanctuaries: [mockSanctuary], currentSanctuary: mockSanctuary });

    await act(async () => {
      await useSanctuaries.getState().deleteSanctuary("1");
    });

    const state = useSanctuaries.getState();
    expect(state.sanctuaries).toEqual([]);
    expect(state.currentSanctuary).toBeNull();
  });

  it("applies review updates", async () => {
    const updated = {
      ...mockSanctuary,
      reviews: [{ user: "1", rating: 5, comment: "Excellent", date: "2024-01-01" }],
    };
    (sanctuariesApi.addSanctuaryReview as jest.Mock).mockResolvedValue({
      success: true,
      data: updated,
    });

    useSanctuaries.setState({ sanctuaries: [mockSanctuary], currentSanctuary: mockSanctuary });

    await act(async () => {
      await useSanctuaries.getState().addSanctuaryReview("1", { rating: 5, comment: "Excellent" });
    });

    expect(useSanctuaries.getState().sanctuaries[0].reviews).toEqual(updated.reviews);
  });
});
