import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecipeCard } from "@/components/features/recipes/recipe-card";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    className,
    fill,
    width,
    height,
  }: {
    src: string;
    alt: string;
    className?: string;
    fill?: boolean;
    width?: number;
    height?: number;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      data-fill={fill ? "true" : undefined}
      width={width}
      height={height}
    />
  ),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Clock: ({ className }: { className?: string }) => (
    <svg data-testid="icon-clock" className={className} />
  ),
  Users: ({ className }: { className?: string }) => (
    <svg data-testid="icon-users" className={className} />
  ),
  ChefHat: ({ className }: { className?: string }) => (
    <svg data-testid="icon-chef-hat" className={className} />
  ),
  Star: ({ className }: { className?: string }) => (
    <svg data-testid="icon-star" className={className} />
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

jest.mock("@/lib/utils", () => ({
  cn: (...args: (string | undefined | false | null)[]) =>
    args.filter(Boolean).join(" "),
}));

const baseProps = {
  title: "Vegan Tacos",
  description: "Delicious plant-based tacos with all the fixings.",
  image: "/images/tacos.jpg",
  preparationTime: 15,
  cookingTime: 20,
  servings: 4,
  difficulty: "easy" as const,
  averageRating: 4.7,
  author: { username: "chef_jane" },
  onView: jest.fn(),
};

describe("RecipeCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the recipe title", () => {
    render(<RecipeCard {...baseProps} />);
    expect(screen.getByText("Vegan Tacos")).toBeInTheDocument();
  });

  it("renders the recipe description", () => {
    render(<RecipeCard {...baseProps} />);
    expect(
      screen.getByText("Delicious plant-based tacos with all the fixings.")
    ).toBeInTheDocument();
  });

  it("renders the main image with the correct alt text", () => {
    render(<RecipeCard {...baseProps} />);
    const img = screen.getByAltText("Vegan Tacos");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/tacos.jpg");
  });

  it("renders the total time (prep + cooking)", () => {
    render(<RecipeCard {...baseProps} />);
    // 15 + 20 = 35
    expect(screen.getByText("35 min")).toBeInTheDocument();
  });

  it("renders the servings count", () => {
    render(<RecipeCard {...baseProps} />);
    expect(screen.getByText("4 servings")).toBeInTheDocument();
  });

  it("renders the difficulty label in Spanish", () => {
    render(<RecipeCard {...baseProps} />);
    expect(screen.getByText("Fácil")).toBeInTheDocument();
  });

  it("renders medium difficulty in Spanish", () => {
    render(<RecipeCard {...baseProps} difficulty="medium" />);
    expect(screen.getByText("Medio")).toBeInTheDocument();
  });

  it("renders hard difficulty in Spanish", () => {
    render(<RecipeCard {...baseProps} difficulty="hard" />);
    expect(screen.getByText("Difícil")).toBeInTheDocument();
  });

  it("renders the formatted average rating", () => {
    render(<RecipeCard {...baseProps} />);
    // 4.7 -> "4.7"
    expect(screen.getByText("4.7")).toBeInTheDocument();
  });

  it("renders the author username", () => {
    render(<RecipeCard {...baseProps} />);
    expect(screen.getByText("chef_jane")).toBeInTheDocument();
  });

  it("renders the author initial avatar when no photo is provided", () => {
    render(<RecipeCard {...baseProps} />);
    // First char of username: "c"
    expect(screen.getByText("c")).toBeInTheDocument();
  });

  it("renders an author photo image when provided", () => {
    render(
      <RecipeCard {...baseProps} author={{ username: "chef_jane", photo: "/avatar.jpg" }} />
    );
    const avatarImg = screen.getByAltText("chef_jane");
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute("src", "/avatar.jpg");
  });

  it("calls onView when the View Recipe button is clicked", () => {
    const onView = jest.fn();
    render(<RecipeCard {...baseProps} onView={onView} />);
    fireEvent.click(screen.getByText("View Recipe"));
    expect(onView).toHaveBeenCalledTimes(1);
  });

  it("renders the View Recipe button", () => {
    render(<RecipeCard {...baseProps} />);
    expect(screen.getByText("View Recipe")).toBeInTheDocument();
  });

  it("has displayName set to RecipeCard", () => {
    const { RecipeCard: RC } = jest.requireActual(
      "@/components/features/recipes/recipe-card"
    );
    expect(RC.displayName).toBe("RecipeCard");
  });
});
