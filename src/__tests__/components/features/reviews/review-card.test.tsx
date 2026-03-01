import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { ReviewCard } from "@/components/features/reviews/review-card";
import { Review } from "@/lib/api/reviews";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

// Mock useAuthStore so we control the authenticated user
const mockAuthStore = {
  user: null as { _id: string; username: string; role?: string } | null,
  isAuthenticated: false,
};

jest.mock("@/lib/store/auth", () => ({
  useAuthStore: () => mockAuthStore,
}));

// Mock the HelpfulVotes sub-component to simplify testing
jest.mock("@/components/features/reviews/helpful-votes", () => ({
  HelpfulVotes: ({
    reviewId,
    helpfulCount,
  }: {
    reviewId: string;
    helpfulCount: number;
  }) => (
    <div data-testid="helpful-votes" data-review-id={reviewId}>
      helpful-votes:{helpfulCount}
    </div>
  ),
}));

// Mock lucide-react icons used inside ReviewCard
jest.mock("lucide-react", () => ({
  Star: ({ className }: { className?: string }) => (
    <svg data-testid="icon-star" className={className} />
  ),
  MoreVertical: () => <svg data-testid="icon-more-vertical" />,
  Edit: () => <svg data-testid="icon-edit" />,
  Trash2: () => <svg data-testid="icon-trash2" />,
  Flag: () => <svg data-testid="icon-flag" />,
}));

// Mock shadcn UI components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img data-testid="avatar-image" src={src} alt={alt} />
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="avatar-fallback">{children}</span>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    className,
    variant,
  }: {
    children: React.ReactNode;
    className?: string;
    variant?: string;
  }) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    className,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    size?: string;
    className?: string;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({
    children,
    align,
  }: {
    children: React.ReactNode;
    align?: string;
  }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button
      data-testid="dropdown-item"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const FIXED_DATE = "2024-06-01T10:00:00Z";

const baseReview: Review = {
  _id: "review-abc123",
  user: {
    _id: "user-001",
    username: "johndoe",
    photo: undefined,
  },
  rating: 4,
  comment: "Great vegan food, highly recommend!",
  resourceType: "restaurant",
  resourceId: "rest-001",
  helpful: [],
  helpfulCount: 0,
  createdAt: FIXED_DATE,
  updatedAt: FIXED_DATE,
};

const defaultProps = {
  review: baseReview,
  resourceType: "restaurant",
  resourceId: "rest-001",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ReviewCard (full view)", () => {
  beforeEach(() => {
    mockAuthStore.user = null;
    mockAuthStore.isAuthenticated = false;
  });

  it("renders the reviewer username", () => {
    render(<ReviewCard {...defaultProps} />);
    expect(screen.getByText("johndoe")).toBeInTheDocument();
  });

  it("renders the review comment", () => {
    render(<ReviewCard {...defaultProps} />);
    expect(screen.getByText("Great vegan food, highly recommend!")).toBeInTheDocument();
  });

  it("renders the rating value", () => {
    render(<ReviewCard {...defaultProps} />);
    expect(screen.getByText("Calificación: 4/5")).toBeInTheDocument();
  });

  it("renders the rating label for rating >= 4", () => {
    render(<ReviewCard {...defaultProps} />);
    expect(screen.getByText("Muy bueno")).toBeInTheDocument();
  });

  it("renders 'Excelente' for rating >= 4.5", () => {
    render(<ReviewCard {...defaultProps} review={{ ...baseReview, rating: 5 }} />);
    expect(screen.getByText("Excelente")).toBeInTheDocument();
  });

  it("renders 'Bueno' for rating >= 3 and < 4", () => {
    render(<ReviewCard {...defaultProps} review={{ ...baseReview, rating: 3 }} />);
    expect(screen.getByText("Bueno")).toBeInTheDocument();
  });

  it("renders 'Regular' for rating >= 2 and < 3", () => {
    render(<ReviewCard {...defaultProps} review={{ ...baseReview, rating: 2 }} />);
    expect(screen.getByText("Regular")).toBeInTheDocument();
  });

  it("renders 'Malo' for rating < 2", () => {
    render(<ReviewCard {...defaultProps} review={{ ...baseReview, rating: 1 }} />);
    expect(screen.getByText("Malo")).toBeInTheDocument();
  });

  it("renders the resource context label for restaurant", () => {
    render(<ReviewCard {...defaultProps} resourceType="restaurant" />);
    expect(screen.getByText("Restaurante")).toBeInTheDocument();
  });

  it("renders the resource context label for recipe", () => {
    render(<ReviewCard {...defaultProps} resourceType="recipe" />);
    expect(screen.getByText("Receta")).toBeInTheDocument();
  });

  it("renders the resource context label for doctor", () => {
    render(<ReviewCard {...defaultProps} resourceType="doctor" />);
    expect(screen.getByText("Doctor")).toBeInTheDocument();
  });

  it("renders the resource context label for market", () => {
    render(<ReviewCard {...defaultProps} resourceType="market" />);
    expect(screen.getByText("Mercado")).toBeInTheDocument();
  });

  it("renders the HelpfulVotes sub-component", () => {
    render(<ReviewCard {...defaultProps} />);
    expect(screen.getByTestId("helpful-votes")).toBeInTheDocument();
  });

  it("passes reviewId to HelpfulVotes", () => {
    render(<ReviewCard {...defaultProps} />);
    expect(screen.getByTestId("helpful-votes")).toHaveAttribute(
      "data-review-id",
      "review-abc123"
    );
  });

  it("renders the shortened review ID in the footer", () => {
    render(<ReviewCard {...defaultProps} />);
    // _id.slice(-8) of "review-abc123" = "bc123"... let's compute
    const shortId = "review-abc123".slice(-8);
    expect(screen.getByText(`ID: ${shortId}`)).toBeInTheDocument();
  });

  it("renders the actions menu when showActions is true (default)", () => {
    render(<ReviewCard {...defaultProps} />);
    expect(screen.getByTestId("dropdown-menu")).toBeInTheDocument();
  });

  it("hides the actions menu when showActions is false", () => {
    render(<ReviewCard {...defaultProps} showActions={false} />);
    expect(screen.queryByTestId("dropdown-menu")).not.toBeInTheDocument();
  });

  it("renders the avatar fallback with first letter of username (uppercased)", () => {
    render(<ReviewCard {...defaultProps} />);
    expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("J");
  });

  it("shows 'Reportar' option in dropdown when user is authenticated but not the author", () => {
    mockAuthStore.user = { _id: "other-user-999", username: "otheruser" };
    mockAuthStore.isAuthenticated = true;
    render(<ReviewCard {...defaultProps} />);
    const items = screen.getAllByTestId("dropdown-item");
    const reportItem = items.find((el) => el.textContent?.includes("Reportar"));
    expect(reportItem).toBeTruthy();
  });

  it("shows 'Editar' and 'Eliminar' options when user is the review author", () => {
    mockAuthStore.user = { _id: "user-001", username: "johndoe" };
    mockAuthStore.isAuthenticated = true;
    render(<ReviewCard {...defaultProps} />);
    const items = screen.getAllByTestId("dropdown-item");
    const editItem = items.find((el) => el.textContent?.includes("Editar"));
    const deleteItem = items.find((el) => el.textContent?.includes("Eliminar"));
    expect(editItem).toBeTruthy();
    expect(deleteItem).toBeTruthy();
  });

  it("shows 'Moderar' option when user is admin", () => {
    mockAuthStore.user = { _id: "admin-001", username: "adminuser", role: "admin" };
    mockAuthStore.isAuthenticated = true;
    render(<ReviewCard {...defaultProps} />);
    const items = screen.getAllByTestId("dropdown-item");
    const moderateItem = items.find((el) => el.textContent?.includes("Moderar"));
    expect(moderateItem).toBeTruthy();
  });

  it("does not show 'Editado' footer when createdAt equals updatedAt", () => {
    render(<ReviewCard {...defaultProps} />);
    expect(screen.queryByText(/Editado/)).not.toBeInTheDocument();
  });

  it("shows 'Editado' footer when updatedAt differs from createdAt", () => {
    const review: Review = {
      ...baseReview,
      updatedAt: "2024-07-01T12:00:00Z",
    };
    render(<ReviewCard {...defaultProps} review={review} />);
    expect(screen.getByText(/Editado/)).toBeInTheDocument();
  });
});

describe("ReviewCard (compact view)", () => {
  beforeEach(() => {
    mockAuthStore.user = null;
    mockAuthStore.isAuthenticated = false;
  });

  it("renders in compact mode without the full card structure", () => {
    render(<ReviewCard {...defaultProps} compact />);
    expect(screen.getByText("johndoe")).toBeInTheDocument();
    expect(screen.getByText("Great vegan food, highly recommend!")).toBeInTheDocument();
  });

  it("does not render the rating label in compact mode", () => {
    render(<ReviewCard {...defaultProps} compact />);
    expect(screen.queryByText("Muy bueno")).not.toBeInTheDocument();
  });

  it("does not render the HelpfulVotes sub-component in compact mode", () => {
    render(<ReviewCard {...defaultProps} compact />);
    expect(screen.queryByTestId("helpful-votes")).not.toBeInTheDocument();
  });

  it("does not render the dropdown menu in compact mode", () => {
    render(<ReviewCard {...defaultProps} compact />);
    expect(screen.queryByTestId("dropdown-menu")).not.toBeInTheDocument();
  });

  it("renders helpfulCount in compact mode when > 0", () => {
    const review: Review = { ...baseReview, helpfulCount: 5 };
    render(<ReviewCard {...defaultProps} review={review} compact />);
    expect(screen.getByLabelText(/5 personas encontraron esto útil/i)).toBeInTheDocument();
  });

  it("does not render thumbs-up count when helpfulCount is 0 in compact mode", () => {
    render(<ReviewCard {...defaultProps} compact />);
    // The emoji/count span should not be present
    expect(screen.queryByText(/👍/)).not.toBeInTheDocument();
  });
});
