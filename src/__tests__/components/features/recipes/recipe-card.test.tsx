import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecipeCard } from "@/components/features/recipes/recipe-card";
import { createMockRecipeCardProps } from "@/__tests__/helpers/test-data-factories";

// Jest hoists jest.mock() calls before imports are evaluated, so static
// import bindings are not available inside the factory. We use require() here
// to load the shared factory objects lazily at mock-call time.
jest.mock("next/image", () => require("@/__tests__/setup/mock-components").nextImageMock);
jest.mock("lucide-react", () => require("@/__tests__/setup/mock-components").lucideReactMock);
jest.mock("@/components/ui/card", () => require("@/__tests__/setup/mock-components").cardMock);
jest.mock("@/components/ui/button", () => require("@/__tests__/setup/mock-components").buttonMock);
jest.mock("@/lib/utils", () => require("@/__tests__/setup/mock-components").utilsMock);

describe("RecipeCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the recipe title", () => {
    render(<RecipeCard {...createMockRecipeCardProps()} />);
    expect(screen.getByText("Vegan Tacos")).toBeInTheDocument();
  });

  it("renders the recipe description", () => {
    render(<RecipeCard {...createMockRecipeCardProps()} />);
    expect(
      screen.getByText("Delicious plant-based tacos with all the fixings.")
    ).toBeInTheDocument();
  });

  it("renders the main image with the correct alt text", () => {
    render(<RecipeCard {...createMockRecipeCardProps()} />);
    const img = screen.getByAltText("Vegan Tacos");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/tacos.jpg");
  });

  it("renders the total time (prep + cooking)", () => {
    render(<RecipeCard {...createMockRecipeCardProps()} />);
    // 15 + 20 = 35
    expect(screen.getByText("35 min")).toBeInTheDocument();
  });

  it("renders the servings count", () => {
    render(<RecipeCard {...createMockRecipeCardProps()} />);
    expect(screen.getByText("4 servings")).toBeInTheDocument();
  });

  it("renders the difficulty label in Spanish", () => {
    render(<RecipeCard {...createMockRecipeCardProps()} />);
    expect(screen.getByText("Fácil")).toBeInTheDocument();
  });

  it("renders medium difficulty in Spanish", () => {
    render(<RecipeCard {...createMockRecipeCardProps({ difficulty: "medium" })} />);
    expect(screen.getByText("Medio")).toBeInTheDocument();
  });

  it("renders hard difficulty in Spanish", () => {
    render(<RecipeCard {...createMockRecipeCardProps({ difficulty: "hard" })} />);
    expect(screen.getByText("Difícil")).toBeInTheDocument();
  });

  it("renders the formatted average rating", () => {
    render(<RecipeCard {...createMockRecipeCardProps()} />);
    // 4.7 -> "4.7"
    expect(screen.getByText("4.7")).toBeInTheDocument();
  });

  it("renders the author username", () => {
    render(<RecipeCard {...createMockRecipeCardProps()} />);
    expect(screen.getByText("chef_jane")).toBeInTheDocument();
  });

  it("renders the author initial avatar when no photo is provided", () => {
    render(<RecipeCard {...createMockRecipeCardProps()} />);
    // First char of username: "c"
    expect(screen.getByText("c")).toBeInTheDocument();
  });

  it("renders an author photo image when provided", () => {
    render(
      <RecipeCard
        {...createMockRecipeCardProps({
          author: { username: "chef_jane", photo: "/avatar.jpg" },
        })}
      />
    );
    const avatarImg = screen.getByAltText("chef_jane");
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute("src", "/avatar.jpg");
  });

  it("calls onView when the View Recipe button is clicked", () => {
    const onView = jest.fn();
    render(<RecipeCard {...createMockRecipeCardProps({ onView })} />);
    fireEvent.click(screen.getByText("View Recipe"));
    expect(onView).toHaveBeenCalledTimes(1);
  });

  it("renders the View Recipe button", () => {
    render(<RecipeCard {...createMockRecipeCardProps()} />);
    expect(screen.getByText("View Recipe")).toBeInTheDocument();
  });

  it("has displayName set to RecipeCard", () => {
    const { RecipeCard: RC } = jest.requireActual("@/components/features/recipes/recipe-card");
    expect(RC.displayName).toBe("RecipeCard");
  });
});
