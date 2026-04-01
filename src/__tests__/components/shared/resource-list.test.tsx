import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResourceList } from "@/components/shared/resource-list/resource-list";
import type { FilterConfig } from "@/components/shared/resource-list/types";

// ---------------------------------------------------------------------------
// Mock the hook – we control every state combination in each test
// ---------------------------------------------------------------------------
const mockHookReturn = {
  mounted: true,
  items: [] as Array<{ _id: string; name: string }>,
  loading: false,
  search: "",
  hasMore: false,
  filterValues: {} as Record<string, string>,
  setSearch: jest.fn(),
  setFilterValue: jest.fn(),
  handleLoadMore: jest.fn(),
};

jest.mock("@/components/shared/resource-list/use-resource-list", () => ({
  useResourceList: () => mockHookReturn,
}));

// Mock ResourceListFilters so we can observe props without rendering real UI
jest.mock("@/components/shared/resource-list/resource-list-filters", () => ({
  ResourceListFilters: ({
    search,
    onSearchChange,
    searchPlaceholder,
  }: {
    search: string;
    onSearchChange: (v: string) => void;
    searchPlaceholder?: string;
  }) => (
    <div data-testid="filters">
      <input
        data-testid="search-input"
        value={search}
        placeholder={searchPlaceholder}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label={searchPlaceholder ?? "Search..."}
      />
    </div>
  ),
}));

// Mock lucide Loader2 icon
jest.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => (
    <svg data-testid="icon-loader2" className={className} />
  ),
}));

// Mock shadcn Button
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
    variant,
    "aria-label": ariaLabel,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    variant?: string;
    "aria-label"?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  ),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Item = { _id: string; name: string };

const noopFetch = jest.fn().mockResolvedValue([]);
const renderCard = (item: Item) => <div data-testid={`card-${item._id}`}>{item.name}</div>;

const defaultProps = {
  fetchFn: noopFetch,
  renderCard,
};

function setMockState(overrides: Partial<typeof mockHookReturn>) {
  Object.assign(mockHookReturn, {
    mounted: true,
    items: [],
    loading: false,
    search: "",
    hasMore: false,
    filterValues: {},
    setSearch: jest.fn(),
    setFilterValue: jest.fn(),
    handleLoadMore: jest.fn(),
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ResourceList – pre-mount skeleton", () => {
  it("renders skeleton cards when mounted is false", () => {
    setMockState({ mounted: false });
    render(<ResourceList {...defaultProps} />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    // SKELETON_COUNT = 6
    expect(skeletons.length).toBeGreaterThanOrEqual(6);
  });

  it("renders filter bar skeleton when showFilters is true and not mounted", () => {
    setMockState({ mounted: false });
    render(<ResourceList {...defaultProps} showFilters />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(6); // filter bar skeleton + card skeletons
  });

  it("does not render filter bar skeleton when showFilters is false and not mounted", () => {
    setMockState({ mounted: false });
    render(<ResourceList {...defaultProps} showFilters={false} />);
    // Only 6 card skeletons
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(6);
  });

  it("renders one skeleton per filter when filters are provided and not mounted", () => {
    setMockState({ mounted: false });
    const filters: FilterConfig[] = [
      { key: "cuisine", placeholder: "All Cuisines", options: [] },
      { key: "rating", placeholder: "All Ratings", options: [] },
    ];
    render(<ResourceList {...defaultProps} showFilters filters={filters} />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    // 6 card skeletons + 1 search skeleton + 2 filter skeletons = 9
    expect(skeletons.length).toBe(9);
  });
});

describe("ResourceList – mounted, empty state", () => {
  beforeEach(() => {
    setMockState({ mounted: true, items: [], loading: false });
  });

  it("renders the empty state message with default emptyLabel", () => {
    render(<ResourceList {...defaultProps} />);
    expect(screen.getByText("No items found.")).toBeInTheDocument();
  });

  it("renders a custom emptyLabel in the empty state", () => {
    setMockState({ mounted: true, items: [], loading: false });
    render(<ResourceList {...defaultProps} emptyLabel="restaurants" />);
    expect(screen.getByText("No restaurants found.")).toBeInTheDocument();
  });

  it("renders the 'try adjusting' hint", () => {
    render(<ResourceList {...defaultProps} />);
    expect(screen.getByText("Try adjusting your search criteria.")).toBeInTheDocument();
  });
});

describe("ResourceList – mounted, loading initial skeleton", () => {
  it("renders loading skeletons when loading and items are empty", () => {
    setMockState({ mounted: true, items: [], loading: true });
    render(<ResourceList {...defaultProps} />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(6);
  });
});

describe("ResourceList – mounted, with items", () => {
  const items: Item[] = [
    { _id: "1", name: "Item One" },
    { _id: "2", name: "Item Two" },
    { _id: "3", name: "Item Three" },
  ];

  beforeEach(() => {
    setMockState({ mounted: true, items, loading: false, hasMore: false });
  });

  it("renders a card for each item", () => {
    render(<ResourceList {...defaultProps} />);
    expect(screen.getByTestId("card-1")).toBeInTheDocument();
    expect(screen.getByTestId("card-2")).toBeInTheDocument();
    expect(screen.getByTestId("card-3")).toBeInTheDocument();
  });

  it("renders item names", () => {
    render(<ResourceList {...defaultProps} />);
    expect(screen.getByText("Item One")).toBeInTheDocument();
    expect(screen.getByText("Item Two")).toBeInTheDocument();
    expect(screen.getByText("Item Three")).toBeInTheDocument();
  });

  it("does not show the Load More button when hasMore is false", () => {
    render(<ResourceList {...defaultProps} />);
    expect(screen.queryByText("Load More")).not.toBeInTheDocument();
  });

  it("renders the optional title heading when provided", () => {
    render(<ResourceList {...defaultProps} title="All Restaurants" />);
    expect(screen.getByText("All Restaurants")).toBeInTheDocument();
  });

  it("does not render a heading when title is omitted", () => {
    render(<ResourceList {...defaultProps} />);
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
  });
});

describe("ResourceList – Load More button", () => {
  const items: Item[] = [{ _id: "1", name: "Item One" }];

  it("renders Load More button when hasMore is true", () => {
    setMockState({ mounted: true, items, loading: false, hasMore: true });
    render(<ResourceList {...defaultProps} />);
    expect(screen.getByText("Load More")).toBeInTheDocument();
  });

  it("calls handleLoadMore when Load More is clicked", () => {
    const handleLoadMore = jest.fn();
    setMockState({ mounted: true, items, loading: false, hasMore: true, handleLoadMore });
    render(<ResourceList {...defaultProps} />);
    fireEvent.click(screen.getByText("Load More"));
    expect(handleLoadMore).toHaveBeenCalledTimes(1);
  });

  it("shows Loading spinner text and disables button when loading with existing items", () => {
    setMockState({ mounted: true, items, loading: true, hasMore: true });
    render(<ResourceList {...defaultProps} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    const button = screen.getByText("Loading...").closest("button");
    expect(button).toBeDisabled();
  });

  it("has aria-label on the Load More button with emptyLabel", () => {
    setMockState({ mounted: true, items, loading: false, hasMore: true });
    render(<ResourceList {...defaultProps} emptyLabel="restaurants" />);
    expect(
      screen.getByRole("button", { name: /cargar mas restaurants/i })
    ).toBeInTheDocument();
  });
});

describe("ResourceList – filter bar", () => {
  const items: Item[] = [{ _id: "1", name: "Item One" }];

  it("renders the filter bar by default", () => {
    setMockState({ mounted: true, items, loading: false });
    render(<ResourceList {...defaultProps} />);
    expect(screen.getByTestId("filters")).toBeInTheDocument();
  });

  it("hides the filter bar when showFilters is false", () => {
    setMockState({ mounted: true, items, loading: false });
    render(<ResourceList {...defaultProps} showFilters={false} />);
    expect(screen.queryByTestId("filters")).not.toBeInTheDocument();
  });

  it("passes the searchPlaceholder to the filter bar", () => {
    setMockState({ mounted: true, items, loading: false });
    render(<ResourceList {...defaultProps} searchPlaceholder="Search restaurants..." />);
    expect(
      screen.getByPlaceholderText("Search restaurants...")
    ).toBeInTheDocument();
  });

  it("calls setSearch when user types in the search input", () => {
    const setSearch = jest.fn();
    setMockState({ mounted: true, items, loading: false, setSearch });
    render(<ResourceList {...defaultProps} />);
    const input = screen.getByTestId("search-input");
    fireEvent.change(input, { target: { value: "pizza" } });
    expect(setSearch).toHaveBeenCalledWith("pizza");
  });
});

describe("ResourceList – custom gridClassName", () => {
  const items: Item[] = [{ _id: "1", name: "Item One" }];

  it("applies a custom gridClassName to the card grid container", () => {
    setMockState({ mounted: true, items, loading: false, hasMore: false });
    render(
      <ResourceList
        {...defaultProps}
        gridClassName="grid grid-cols-1 gap-4 xl:grid-cols-4"
      />
    );
    const grid = document.querySelector(".xl\\:grid-cols-4");
    expect(grid).toBeInTheDocument();
  });
});
