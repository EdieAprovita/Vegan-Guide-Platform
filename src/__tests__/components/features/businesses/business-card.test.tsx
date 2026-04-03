import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { BusinessCard } from "@/components/features/businesses/business-card";
import { Business } from "@/lib/api/businesses";

jest.mock("next/link", () => require("@/__tests__/setup/mock-components").nextLinkMock);
jest.mock("next/image", () => require("@/__tests__/setup/mock-components").nextImageMock);
jest.mock("lucide-react", () => require("@/__tests__/setup/mock-components").lucideReactMock);
jest.mock("@/components/ui/card", () => require("@/__tests__/setup/mock-components").cardMock);
jest.mock("@/components/ui/badge", () => require("@/__tests__/setup/mock-components").badgeMock);
jest.mock("@/components/ui/button", () => require("@/__tests__/setup/mock-components").buttonMock);

function createMockBusiness(overrides?: Partial<Business>): Business {
  return {
    _id: "biz-001",
    namePlace: "Green Bites",
    address: "10 Vegan Ave, City",
    image: "/images/biz.jpg",
    contact: [],
    budget: 500,
    typeBusiness: "Restaurant",
    hours: [],
    rating: 4.3,
    numReviews: 12,
    author: { _id: "author-1", username: "admin" },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    ...overrides,
  };
}

describe("BusinessCard — phone URI validation (H-06)", () => {
  it("renders a tel: anchor for a valid phone number", () => {
    const business = createMockBusiness({
      contact: [{ phone: "+52 55 1234 5678" }],
    });
    render(<BusinessCard business={business} />);

    const link = screen.getByRole("link", { name: /llamar/i });
    expect(link).toHaveAttribute("href", "tel:+52 55 1234 5678");
  });

  it("renders a disabled button (no anchor) when phone contains injection chars", () => {
    const business = createMockBusiness({
      contact: [{ phone: "tel:<script>alert(1)</script>" }],
    });
    render(<BusinessCard business={business} />);

    // A link with an href starting "tel:" must NOT be present
    const links = screen.queryAllByRole("link");
    const telLinks = links.filter((el) => el.getAttribute("href")?.startsWith("tel:"));
    expect(telLinks).toHaveLength(0);

    // A disabled button should be rendered instead
    const disabledBtn = screen.getByRole("button", { name: /teléfono no disponible/i });
    expect(disabledBtn).toBeDisabled();
  });

  it("renders plain text (no link) when phone is purely alphabetic", () => {
    const business = createMockBusiness({
      contact: [{ phone: "javascript:alert(1)" }],
    });
    render(<BusinessCard business={business} />);

    const links = screen.queryAllByRole("link");
    const telLinks = links.filter((el) => el.getAttribute("href")?.startsWith("tel:"));
    expect(telLinks).toHaveLength(0);
  });
});

describe("BusinessCard — email URI validation (H-06)", () => {
  it("renders a mailto: anchor for a valid email", () => {
    const business = createMockBusiness({
      contact: [{ email: "info@greenbites.com" }],
    });
    render(<BusinessCard business={business} />);

    const link = screen.getByRole("link", { name: /enviar correo/i });
    expect(link).toHaveAttribute("href", "mailto:info@greenbites.com");
  });

  it("renders plain text (no mailto: link) for an invalid email", () => {
    const business = createMockBusiness({
      contact: [{ email: "not-an-email" }],
    });
    render(<BusinessCard business={business} />);

    const links = screen.queryAllByRole("link");
    const mailtoLinks = links.filter((el) => el.getAttribute("href")?.startsWith("mailto:"));
    expect(mailtoLinks).toHaveLength(0);

    // The raw value is rendered as plain text
    expect(screen.getByText("not-an-email")).toBeInTheDocument();
  });

  it("renders plain text (no link) when email contains angle brackets", () => {
    const business = createMockBusiness({
      contact: [{ email: "<script>evil</script>@x.com" }],
    });
    render(<BusinessCard business={business} />);

    const links = screen.queryAllByRole("link");
    const mailtoLinks = links.filter((el) => el.getAttribute("href")?.startsWith("mailto:"));
    expect(mailtoLinks).toHaveLength(0);
  });
});

describe("BusinessCard — general rendering", () => {
  it("renders the business name", () => {
    render(<BusinessCard business={createMockBusiness()} />);
    expect(screen.getByText("Green Bites")).toBeInTheDocument();
  });

  it("renders the address", () => {
    render(<BusinessCard business={createMockBusiness()} />);
    expect(screen.getByText("10 Vegan Ave, City")).toBeInTheDocument();
  });

  it("renders the formatted rating", () => {
    render(<BusinessCard business={createMockBusiness()} />);
    expect(screen.getByText("4.3")).toBeInTheDocument();
  });

  it("renders the Ver Detalles link pointing to the correct route", () => {
    render(<BusinessCard business={createMockBusiness()} />);
    const link = screen.getByRole("link", { name: /ver detalles/i });
    expect(link).toHaveAttribute("href", "/businesses/biz-001");
  });

  it("does not render a call button when contact is empty", () => {
    render(<BusinessCard business={createMockBusiness()} />);
    expect(screen.queryByRole("link", { name: /llamar/i })).not.toBeInTheDocument();
  });

  it("has displayName set to BusinessCard", () => {
    const { BusinessCard: BC } = jest.requireActual(
      "@/components/features/businesses/business-card"
    );
    expect(BC.displayName).toBe("BusinessCard");
  });
});
