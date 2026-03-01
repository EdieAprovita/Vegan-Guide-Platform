import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { RestaurantCard } from "@/components/features/restaurants/restaurant-card";
import { createMockRestaurant } from "@/__tests__/helpers/test-data-factories";

// Jest hoists jest.mock() calls before imports are evaluated, so static
// import bindings are not available inside the factory. We use require() here
// to load the shared factory objects lazily at mock-call time.
jest.mock("next/link", () => require("@/__tests__/setup/mock-components").nextLinkMock);
jest.mock("lucide-react", () => require("@/__tests__/setup/mock-components").lucideReactMock);
jest.mock("@/components/ui/card", () => require("@/__tests__/setup/mock-components").cardMock);
jest.mock("@/components/ui/badge", () => require("@/__tests__/setup/mock-components").badgeMock);
jest.mock("@/components/ui/button", () => require("@/__tests__/setup/mock-components").buttonMock);

describe("RestaurantCard", () => {
  it("renders the restaurant name", () => {
    render(<RestaurantCard restaurant={createMockRestaurant()} />);
    expect(screen.getByText("The Green Plate")).toBeInTheDocument();
  });

  it("renders the address", () => {
    render(<RestaurantCard restaurant={createMockRestaurant()} />);
    expect(screen.getByText("123 Vegan Street, Ciudad")).toBeInTheDocument();
  });

  it("renders the formatted rating", () => {
    render(<RestaurantCard restaurant={createMockRestaurant()} />);
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("renders the review count", () => {
    render(<RestaurantCard restaurant={createMockRestaurant()} />);
    expect(screen.getByText("(42)")).toBeInTheDocument();
  });

  it("renders up to 3 cuisine badges", () => {
    render(<RestaurantCard restaurant={createMockRestaurant()} />);
    expect(screen.getByText("Italian")).toBeInTheDocument();
    expect(screen.getByText("Mexican")).toBeInTheDocument();
    expect(screen.getByText("Asian")).toBeInTheDocument();
  });

  it("renders a +N more badge when there are more than 3 cuisines", () => {
    const restaurant = createMockRestaurant({
      cuisine: ["Italian", "Mexican", "Asian", "Indian", "French"],
    });
    render(<RestaurantCard restaurant={restaurant} />);
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });

  it("does not render a +N more badge when there are 3 or fewer cuisines", () => {
    render(<RestaurantCard restaurant={createMockRestaurant()} />);
    expect(screen.queryByText(/\+ \d+ more/)).not.toBeInTheDocument();
  });

  it("renders the View Details link pointing to the correct route", () => {
    render(<RestaurantCard restaurant={createMockRestaurant()} />);
    const link = screen.getByRole("link", { name: /view details/i });
    expect(link).toHaveAttribute("href", "/restaurants/rest-001");
  });

  it("hides actions when showActions is false", () => {
    render(<RestaurantCard restaurant={createMockRestaurant()} showActions={false} />);
    expect(screen.queryByRole("link", { name: /view details/i })).not.toBeInTheDocument();
  });

  it("shows actions by default", () => {
    render(<RestaurantCard restaurant={createMockRestaurant()} />);
    expect(screen.getByRole("link", { name: /view details/i })).toBeInTheDocument();
  });

  it("renders phone number when contact has a phone", () => {
    const restaurant = createMockRestaurant({
      contact: [{ phone: "+52 55 1234 5678" }],
    });
    render(<RestaurantCard restaurant={restaurant} />);
    expect(screen.getByText("+52 55 1234 5678")).toBeInTheDocument();
  });

  it("does not render phone section when contact list is empty", () => {
    render(<RestaurantCard restaurant={createMockRestaurant()} />);
    expect(screen.queryByTestId("icon-phone")).not.toBeInTheDocument();
  });

  it("renders a Facebook link when contact has facebook", () => {
    const restaurant = createMockRestaurant({
      contact: [{ facebook: "https://facebook.com/greenplate" }],
    });
    render(<RestaurantCard restaurant={restaurant} />);
    const fbLink = screen.getByRole("link", { name: /facebook/i });
    expect(fbLink).toHaveAttribute("href", "https://facebook.com/greenplate");
  });

  it("renders an Instagram link when contact has instagram", () => {
    const restaurant = createMockRestaurant({
      contact: [{ instagram: "https://instagram.com/greenplate" }],
    });
    render(<RestaurantCard restaurant={restaurant} />);
    const igLink = screen.getByRole("link", { name: /instagram/i });
    expect(igLink).toHaveAttribute("href", "https://instagram.com/greenplate");
  });

  it("does not render Facebook/Instagram links when contact is empty", () => {
    render(<RestaurantCard restaurant={createMockRestaurant()} />);
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
