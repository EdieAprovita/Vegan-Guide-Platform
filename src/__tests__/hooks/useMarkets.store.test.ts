import { act } from "@testing-library/react";
import { useMarkets } from "@/hooks/useMarkets";
import * as marketsApi from "@/lib/api/markets";

jest.mock("@/lib/api/markets", () => ({
  getMarkets: jest.fn(),
  getMarket: jest.fn(),
  createMarket: jest.fn(),
  updateMarket: jest.fn(),
  deleteMarket: jest.fn(),
  addMarketReview: jest.fn(),
  getNearbyMarkets: jest.fn(),
  getMarketsByProducts: jest.fn(),
  getAdvancedMarkets: jest.fn(),
}));

const mockMarket = {
  _id: "1",
  marketName: "Fresh Market",
  address: "456 Organic Ave",
  contact: [],
  products: ["Tofu"],
  hours: [],
  rating: 4.7,
  numReviews: 5,
  reviews: [],
  author: { _id: "user", username: "market-owner" },
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

const resetStore = () => {
  useMarkets.setState({
    markets: [],
    currentMarket: null,
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

describe("useMarkets store actions", () => {
  it("loads markets and resets pagination", async () => {
    (marketsApi.getMarkets as jest.Mock).mockResolvedValue({ success: true, data: [mockMarket] });

    await act(async () => {
      await useMarkets.getState().getMarkets({ search: "fresh" });
    });

    const state = useMarkets.getState();
    expect(marketsApi.getMarkets).toHaveBeenCalledWith({ search: "fresh" });
    expect(state.markets).toEqual([mockMarket]);
    expect(state.currentPage).toBe(1);
  });

  it("propagates errors while fetching markets", async () => {
    (marketsApi.getMarkets as jest.Mock).mockRejectedValue(new Error("down"));

    await expect(useMarkets.getState().getMarkets()).rejects.toThrow("down");

    const state = useMarkets.getState();
    expect(state.error).toBe("down");
  });

  it("loads a market by id", async () => {
    (marketsApi.getMarket as jest.Mock).mockResolvedValue({ success: true, data: mockMarket });

    await act(async () => {
      await useMarkets.getState().getMarket("1");
    });

    expect(useMarkets.getState().currentMarket).toEqual(mockMarket);
  });

  it("creates a market and adds it to state", async () => {
    (marketsApi.createMarket as jest.Mock).mockResolvedValue({ success: true, data: mockMarket });

    await act(async () => {
      await useMarkets.getState().createMarket(mockMarket, "token");
    });

    expect(useMarkets.getState().markets[0]).toEqual(mockMarket);
  });

  it("updates existing market entries", async () => {
    const updated = { ...mockMarket, marketName: "Updated Market" };
    (marketsApi.updateMarket as jest.Mock).mockResolvedValue({ success: true, data: updated });

    useMarkets.setState({ markets: [mockMarket], currentMarket: mockMarket });

    await act(async () => {
      await useMarkets.getState().updateMarket("1", { marketName: "Updated Market" });
    });

    const state = useMarkets.getState();
    expect(state.markets[0]).toEqual(updated);
    expect(state.currentMarket).toEqual(updated);
  });

  it("removes market entries when deleting", async () => {
    (marketsApi.deleteMarket as jest.Mock).mockResolvedValue(undefined);

    useMarkets.setState({ markets: [mockMarket], currentMarket: mockMarket });

    await act(async () => {
      await useMarkets.getState().deleteMarket("1");
    });

    const state = useMarkets.getState();
    expect(state.markets).toEqual([]);
    expect(state.currentMarket).toBeNull();
  });

  it("applies returned review when adding a market review", async () => {
    const updated = { ...mockMarket, reviews: [{ rating: 5, comment: "great" }] };
    (marketsApi.addMarketReview as jest.Mock).mockResolvedValue({ success: true, data: updated });

    useMarkets.setState({ markets: [mockMarket], currentMarket: mockMarket });

    await act(async () => {
      await useMarkets.getState().addMarketReview("1", { rating: 5, comment: "great" });
    });

    expect(useMarkets.getState().markets[0].reviews).toEqual(updated.reviews);
  });
});
