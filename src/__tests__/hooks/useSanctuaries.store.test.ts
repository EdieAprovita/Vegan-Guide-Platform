/**
 * Tests for the base useSanctuaries and useSanctuary TanStack Query hooks
 * (migrated from Zustand store tests).
 */
import { renderHook } from "@testing-library/react";
import { useSanctuaries, useSanctuary } from "@/hooks/useSanctuaries";
import * as sanctuariesApi from "@/lib/api/sanctuaries";
import { useQuery } from "@tanstack/react-query";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

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

const useQueryMock = useQuery as unknown as jest.Mock;

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
  address: "789 Forest Rd",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

beforeEach(() => {
  useQueryMock.mockReturnValue({ data: [mockSanctuary], isLoading: false, isError: false });
  jest.clearAllMocks();
  useQueryMock.mockReturnValue({ data: [mockSanctuary], isLoading: false, isError: false });
});

describe("useSanctuaries query hook", () => {
  it("calls useQuery with sanctuaries queryKey", () => {
    renderHook(() => useSanctuaries({ search: "haven" } as any));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["sanctuaries", "list", expect.any(Object)],
      })
    );
  });

  it("returns data from useQuery", () => {
    const { result } = renderHook(() => useSanctuaries());
    expect(result.current.data).toEqual([mockSanctuary]);
  });

  it("passes params to queryFn that calls getSanctuaries", async () => {
    let capturedConfig: any;
    useQueryMock.mockImplementation((config: any) => {
      capturedConfig = config;
      return { data: [], isLoading: false };
    });

    (sanctuariesApi.getSanctuaries as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockSanctuary],
    });

    renderHook(() => useSanctuaries());

    await capturedConfig.queryFn();
    expect(sanctuariesApi.getSanctuaries).toHaveBeenCalled();
  });
});

describe("useSanctuary single query", () => {
  it("calls useQuery with single sanctuary queryKey", () => {
    renderHook(() => useSanctuary("1"));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["sanctuaries", "detail", "1"],
        enabled: true,
      })
    );
  });

  it("disables query when id is empty", () => {
    renderHook(() => useSanctuary(""));

    expect(useQueryMock).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });
});
