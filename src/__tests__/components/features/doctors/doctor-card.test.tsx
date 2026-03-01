import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { DoctorCard } from "@/components/features/doctors/doctor-card";
import { Doctor } from "@/lib/api/doctors";

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
  Mail: ({ className }: { className?: string }) => (
    <svg data-testid="icon-mail" className={className} />
  ),
  Globe: ({ className }: { className?: string }) => (
    <svg data-testid="icon-globe" className={className} />
  ),
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
    variant,
  }: {
    children: React.ReactNode;
    variant?: string;
  }) => (
    <span data-testid="badge" data-variant={variant}>
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

const baseDoctor: Doctor = {
  _id: "doc-001",
  name: "Maria Lopez",
  specialty: "Nutritionist",
  address: "456 Health Ave, Ciudad",
  rating: 4.8,
  numReviews: 30,
  experience: "10 years of experience in plant-based nutrition.",
  languages: ["Spanish", "English"],
  education: ["MD - UNAM", "Nutrition Specialist"],
  contact: [],
  author: { _id: "author-1", username: "admin" },
  reviews: [],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-02T00:00:00Z",
};

describe("DoctorCard", () => {
  it("renders the doctor name with Dr. prefix", () => {
    render(<DoctorCard doctor={baseDoctor} />);
    expect(screen.getByText("Dr. Maria Lopez")).toBeInTheDocument();
  });

  it("renders the doctor address", () => {
    render(<DoctorCard doctor={baseDoctor} />);
    expect(screen.getByText("456 Health Ave, Ciudad")).toBeInTheDocument();
  });

  it("renders the formatted rating", () => {
    render(<DoctorCard doctor={baseDoctor} />);
    expect(screen.getByText("4.8")).toBeInTheDocument();
  });

  it("renders the review count", () => {
    render(<DoctorCard doctor={baseDoctor} />);
    expect(screen.getByText("(30)")).toBeInTheDocument();
  });

  it("renders the specialty badge", () => {
    render(<DoctorCard doctor={baseDoctor} />);
    expect(screen.getByText("Nutritionist")).toBeInTheDocument();
  });

  it("renders up to 2 language badges", () => {
    render(<DoctorCard doctor={baseDoctor} />);
    expect(screen.getByText("Spanish")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("renders a +N more badge when there are more than 2 languages", () => {
    const doctor: Doctor = {
      ...baseDoctor,
      languages: ["Spanish", "English", "French", "German"],
    };
    render(<DoctorCard doctor={doctor} />);
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });

  it("does not render a +N more badge when there are 2 or fewer languages", () => {
    render(<DoctorCard doctor={baseDoctor} />);
    expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
  });

  it("renders the experience text", () => {
    render(<DoctorCard doctor={baseDoctor} />);
    expect(
      screen.getByText("10 years of experience in plant-based nutrition.")
    ).toBeInTheDocument();
  });

  it("renders the View Details link pointing to the correct route", () => {
    render(<DoctorCard doctor={baseDoctor} />);
    const link = screen.getByRole("link", { name: /view details/i });
    expect(link).toHaveAttribute("href", "/doctors/doc-001");
  });

  it("hides actions when showActions is false", () => {
    render(<DoctorCard doctor={baseDoctor} showActions={false} />);
    expect(screen.queryByRole("link", { name: /view details/i })).not.toBeInTheDocument();
  });

  it("shows actions by default", () => {
    render(<DoctorCard doctor={baseDoctor} />);
    expect(screen.getByRole("link", { name: /view details/i })).toBeInTheDocument();
  });

  it("renders phone number when contact has a phone", () => {
    const doctor: Doctor = {
      ...baseDoctor,
      contact: [{ phone: "+52 55 9876 5432" }],
    };
    render(<DoctorCard doctor={doctor} />);
    expect(screen.getByText("+52 55 9876 5432")).toBeInTheDocument();
  });

  it("renders email when contact has an email", () => {
    const doctor: Doctor = {
      ...baseDoctor,
      contact: [{ email: "doctor@example.com" }],
    };
    render(<DoctorCard doctor={doctor} />);
    expect(screen.getByText("doctor@example.com")).toBeInTheDocument();
  });

  it("renders website link when contact has a website", () => {
    const doctor: Doctor = {
      ...baseDoctor,
      contact: [{ website: "https://drlopez.com" }],
    };
    render(<DoctorCard doctor={doctor} />);
    const websiteLink = screen.getByRole("link", { name: /website/i });
    expect(websiteLink).toHaveAttribute("href", "https://drlopez.com");
  });

  it("does not render website link when contact is empty", () => {
    render(<DoctorCard doctor={baseDoctor} />);
    expect(screen.queryByRole("link", { name: /website/i })).not.toBeInTheDocument();
  });

  it("does not render contact section when contact list is empty", () => {
    render(<DoctorCard doctor={baseDoctor} />);
    expect(screen.queryByTestId("icon-phone")).not.toBeInTheDocument();
  });

  it("has displayName set to DoctorCard", () => {
    const { DoctorCard: DC } = jest.requireActual(
      "@/components/features/doctors/doctor-card"
    );
    expect(DC.displayName).toBe("DoctorCard");
  });
});
