import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { ReviewCard } from "@/components/features/reviews/review-card";
import { createMockReview } from "@/__tests__/helpers/test-data-factories";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

// Mock useSession so we control the authenticated user
const mockSession = {
  data: null as { user: { id: string; name: string; role?: string } } | null,
  status: "unauthenticated" as "authenticated" | "unauthenticated" | "loading",
};

jest.mock("next-auth/react", () => ({
  useSession: () => mockSession,
}));

// Mock the HelpfulVotes sub-component to simplify testing
jest.mock("@/components/features/reviews/helpful-votes", () => ({
  HelpfulVotes: ({ reviewId, helpfulCount }: { reviewId: string; helpfulCount: number }) => (
    <div data-testid="helpful-votes" data-review-id={reviewId}>
      helpful-votes:{helpfulCount}
    </div>
  ),
}));

// Jest hoists jest.mock() calls before imports are evaluated, so static
// import bindings are not available inside the factory. We use require() here
// to load the shared factory objects lazily at mock-call time.
jest.mock("lucide-react", () => require("@/__tests__/setup/mock-components").lucideReactMock);
jest.mock("@/components/ui/card", () => require("@/__tests__/setup/mock-components").cardMock);
jest.mock("@/components/ui/badge", () => require("@/__tests__/setup/mock-components").badgeMock);
jest.mock("@/components/ui/button", () => require("@/__tests__/setup/mock-components").buttonMock);
jest.mock("@/components/ui/avatar", () => require("@/__tests__/setup/mock-components").avatarMock);
jest.mock(
  "@/components/ui/dropdown-menu",
  () => require("@/__tests__/setup/mock-components").dropdownMenuMock
);

// ---------------------------------------------------------------------------
// Shared fixture
// ---------------------------------------------------------------------------
const defaultProps = {
  review: createMockReview(),
  resourceType: "restaurant" as const,
  resourceId: "rest-001",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ReviewCard (full view)", () => {
  beforeEach(() => {
    mockSession.data = null;
    mockSession.status = "unauthenticated";
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
    render(<ReviewCard {...defaultProps} review={createMockReview({ rating: 5 })} />);
    expect(screen.getByText("Excelente")).toBeInTheDocument();
  });

  it("renders 'Bueno' for rating >= 3 and < 4", () => {
    render(<ReviewCard {...defaultProps} review={createMockReview({ rating: 3 })} />);
    expect(screen.getByText("Bueno")).toBeInTheDocument();
  });

  it("renders 'Regular' for rating >= 2 and < 3", () => {
    render(<ReviewCard {...defaultProps} review={createMockReview({ rating: 2 })} />);
    expect(screen.getByText("Regular")).toBeInTheDocument();
  });

  it("renders 'Malo' for rating < 2", () => {
    render(<ReviewCard {...defaultProps} review={createMockReview({ rating: 1 })} />);
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
    expect(screen.getByTestId("helpful-votes")).toHaveAttribute("data-review-id", "review-abc123");
  });

  it("renders the shortened review ID in the footer", () => {
    render(<ReviewCard {...defaultProps} />);
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
    mockSession.data = { user: { id: "other-user-999", name: "otheruser" } };
    mockSession.status = "authenticated";
    render(<ReviewCard {...defaultProps} />);
    const items = screen.getAllByTestId("dropdown-item");
    const reportItem = items.find((el) => el.textContent?.includes("Reportar"));
    expect(reportItem).toBeTruthy();
  });

  it("shows 'Editar' and 'Eliminar' options when user is the review author", () => {
    mockSession.data = { user: { id: "user-001", name: "johndoe" } };
    mockSession.status = "authenticated";
    render(<ReviewCard {...defaultProps} />);
    const items = screen.getAllByTestId("dropdown-item");
    const editItem = items.find((el) => el.textContent?.includes("Editar"));
    const deleteItem = items.find((el) => el.textContent?.includes("Eliminar"));
    expect(editItem).toBeTruthy();
    expect(deleteItem).toBeTruthy();
  });

  it("shows 'Moderar' option when user is admin", () => {
    mockSession.data = { user: { id: "admin-001", name: "adminuser", role: "admin" } };
    mockSession.status = "authenticated";
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
    const review = createMockReview({ updatedAt: "2024-07-01T12:00:00Z" });
    render(<ReviewCard {...defaultProps} review={review} />);
    expect(screen.getByText(/Editado/)).toBeInTheDocument();
  });
});

describe("ReviewCard (compact view)", () => {
  beforeEach(() => {
    mockSession.data = null;
    mockSession.status = "unauthenticated";
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
    const review = createMockReview({ helpfulCount: 5 });
    render(<ReviewCard {...defaultProps} review={review} compact />);
    expect(screen.getByLabelText(/5 personas encontraron esto útil/i)).toBeInTheDocument();
  });

  it("does not render thumbs-up count when helpfulCount is 0 in compact mode", () => {
    render(<ReviewCard {...defaultProps} compact />);
    expect(screen.queryByText(/👍/)).not.toBeInTheDocument();
  });
});
