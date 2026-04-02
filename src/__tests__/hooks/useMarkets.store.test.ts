/**
 * Tests for the base useMarkets and useMarket TanStack Query hooks
 * (migrated from Zustand store tests).
 */
import { renderHook } from "@testing-library/react";
import { useMarkets, useMarket } from "@/hooks/useMarkets";
import * as marketsApi from "@/lib/api/markets";
import { useQuery } from "@tanstack/react-query";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

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

const useQueryMock = useQuery as unknown as jest.Mock;

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

beforeEach(() => {
  useQueryMock.mockReturnValue({ data: [mockMarket], isLoading: false, isError: false });
  jest.clearAllMocks();
  useQueryMock.mockReturnValue({ data: [mockMarket], isLoading: false, isError: false });
});

describe("useMarkets query hook", () => {
  it("calls useQuery with markets queryKey", () => {
    renderHook(() => useMarkets({ search: "fresh" }));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["markets", "list", expect.objectContaining({ search: "fresh" })],
      })
    );
  });

  it("returns data from useQuery", () => {
    const { result } = renderHook(() => useMarkets());
    expect(result.current.data).toEqual([mockMarket]);
  });

  it("passes params to queryFn that calls getMarkets", async () => {
    let capturedConfig: any;
    useQueryMock.mockImplementation((config: any) => {
      capturedConfig = config;
      return { data: [], isLoading: false };
    });

    (marketsApi.getMarkets as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockMarket],
    });

    renderHook(() => useMarkets({ search: "fresh" }));

    await capturedConfig.queryFn();
    expect(marketsApi.getMarkets).toHaveBeenCalledWith(
      expect.objectContaining({ search: "fresh" })
    );
  });
});

describe("useMarket single query", () => {
  it("calls useQuery with single market queryKey", () => {
    renderHook(() => useMarket("1"));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["markets", "detail", "1"],
        enabled: true,
      })
    );
  });

  it("disables query when id is empty", () => {
    renderHook(() => useMarket(""));

    expect(useQueryMock).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });
});
