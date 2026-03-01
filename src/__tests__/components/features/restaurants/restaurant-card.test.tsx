import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { RestaurantCard } from "@/components/features/restaurants/restaurant-card";
import { Restaurant } from "@/lib/api/restaurants";

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Star: ({ className }: { className?: string }) => (
    <svg data-testid="icon-star" className={className} />
  ),
  MapPin: ({ className }: { className?: string }) => (
    <svg data-testid="icon-map-pin" className={className} />
  ),
  Phone: ({ className }: { className?: string }) => (
    <svg data-testid="icon-phone" className={className} />
  ),
  ExternalLink: ({ className }: { className?: string }) => (
    <svg data-testid="icon-external-link" className={className} />
  ),
}));

// Mock shadcn ui components minimally
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
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h3 data-testid="card-title" className={className}>
      {children}
    </h3>
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
    asChild,
    className,
    variant,
    size,
    onClick,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    className?: string;
    variant?: string;
    size?: string;
    onClick?: () => void;
  }) => {
    if (asChild) return <>{children}</>;
    return (
      <button
        onClick={onClick}
        className={className}
        data-variant={variant}
        data-size={size}
      >
        {children}
      </button>
    );
  },
}));

const baseRestaurant: Restaurant = {
  _id: "rest-001",
  restaurantName: "The Green Plate",
  name: "The Green Plate",
  address: "123 Vegan Street, Ciudad",
  rating: 4.5,
  numReviews: 42,
  cuisine: ["Italian", "Mexican", "Asian"],
  contact: [],
  author: { _id: "author-1", username: "admin" },
  reviews: [],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-02T00:00:00Z",
};

describe("RestaurantCard", () => {
  it("renders the restaurant name", () => {
    render(<RestaurantCard restaurant={baseRestaurant} />);
    expect(screen.getByText("The Green Plate")).toBeInTheDocument();
  });

  it("renders the address", () => {
    render(<RestaurantCard restaurant={baseRestaurant} />);
    expect(screen.getByText("123 Vegan Street, Ciudad")).toBeInTheDocument();
  });

  it("renders the formatted rating", () => {
    render(<RestaurantCard restaurant={baseRestaurant} />);
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("renders the review count", () => {
    render(<RestaurantCard restaurant={baseRestaurant} />);
    expect(screen.getByText("(42)")).toBeInTheDocument();
  });

  it("renders up to 3 cuisine badges", () => {
    render(<RestaurantCard restaurant={baseRestaurant} />);
    expect(screen.getByText("Italian")).toBeInTheDocument();
    expect(screen.getByText("Mexican")).toBeInTheDocument();
    expect(screen.getByText("Asian")).toBeInTheDocument();
  });

  it("renders a +N more badge when there are more than 3 cuisines", () => {
    const restaurant: Restaurant = {
      ...baseRestaurant,
      cuisine: ["Italian", "Mexican", "Asian", "Indian", "French"],
    };
    render(<RestaurantCard restaurant={restaurant} />);
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });

  it("does not render a +N more badge when there are 3 or fewer cuisines", () => {
    render(<RestaurantCard restaurant={baseRestaurant} />);
    expect(screen.queryByText(/\+ \d+ more/)).not.toBeInTheDocument();
  });

  it("renders the View Details link pointing to the correct route", () => {
    render(<RestaurantCard restaurant={baseRestaurant} />);
    const link = screen.getByRole("link", { name: /view details/i });
    expect(link).toHaveAttribute("href", "/restaurants/rest-001");
  });

  it("hides actions when showActions is false", () => {
    render(<RestaurantCard restaurant={baseRestaurant} showActions={false} />);
    expect(screen.queryByRole("link", { name: /view details/i })).not.toBeInTheDocument();
  });

  it("shows actions by default", () => {
    render(<RestaurantCard restaurant={baseRestaurant} />);
    expect(screen.getByRole("link", { name: /view details/i })).toBeInTheDocument();
  });

  it("renders phone number when contact has a phone", () => {
    const restaurant: Restaurant = {
      ...baseRestaurant,
      contact: [{ phone: "+52 55 1234 5678" }],
    };
    render(<RestaurantCard restaurant={restaurant} />);
    expect(screen.getByText("+52 55 1234 5678")).toBeInTheDocument();
  });

  it("does not render phone section when contact list is empty", () => {
    render(<RestaurantCard restaurant={baseRestaurant} />);
    expect(screen.queryByTestId("icon-phone")).not.toBeInTheDocument();
  });

  it("renders a Facebook link when contact has facebook", () => {
    const restaurant: Restaurant = {
      ...baseRestaurant,
      contact: [{ facebook: "https://facebook.com/greenplate" }],
    };
    render(<RestaurantCard restaurant={restaurant} />);
    const fbLink = screen.getByRole("link", { name: /facebook/i });
    expect(fbLink).toHaveAttribute("href", "https://facebook.com/greenplate");
  });

  it("renders an Instagram link when contact has instagram", () => {
    const restaurant: Restaurant = {
      ...baseRestaurant,
      contact: [{ instagram: "https://instagram.com/greenplate" }],
    };
    render(<RestaurantCard restaurant={restaurant} />);
    const igLink = screen.getByRole("link", { name: /instagram/i });
    expect(igLink).toHaveAttribute("href", "https://instagram.com/greenplate");
  });

  it("does not render Facebook/Instagram links when contact is empty", () => {
    render(<RestaurantCard restaurant={baseRestaurant} />);
    expect(screen.queryByRole("link", { name: /facebook/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /instagram/i })).not.toBeInTheDocument();
  });

  it("has displayName set to RestaurantCard", () => {
    const { RestaurantCard: RC } = jest.requireActual(
      "@/components/features/restaurants/restaurant-card"
    );
    expect(RC.displayName).toBe("RestaurantCard");
  });
});
