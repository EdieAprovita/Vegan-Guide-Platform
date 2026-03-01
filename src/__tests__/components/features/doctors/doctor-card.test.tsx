import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { DoctorCard } from "@/components/features/doctors/doctor-card";
import { createMockDoctor } from "@/__tests__/helpers/test-data-factories";

// Jest hoists jest.mock() calls before imports are evaluated, so static
// import bindings are not available inside the factory. We use require() here
// to load the shared factory objects lazily at mock-call time.
jest.mock("next/link", () => require("@/__tests__/setup/mock-components").nextLinkMock);
jest.mock("lucide-react", () => require("@/__tests__/setup/mock-components").lucideReactMock);
jest.mock("@/components/ui/card", () => require("@/__tests__/setup/mock-components").cardMock);
jest.mock("@/components/ui/badge", () => require("@/__tests__/setup/mock-components").badgeMock);
jest.mock("@/components/ui/button", () => require("@/__tests__/setup/mock-components").buttonMock);

describe("DoctorCard", () => {
  it("renders the doctor name with Dr. prefix", () => {
    render(<DoctorCard doctor={createMockDoctor()} />);
    expect(screen.getByText("Dr. Maria Lopez")).toBeInTheDocument();
  });

  it("renders the doctor address", () => {
    render(<DoctorCard doctor={createMockDoctor()} />);
    expect(screen.getByText("456 Health Ave, Ciudad")).toBeInTheDocument();
  });

  it("renders the formatted rating", () => {
    render(<DoctorCard doctor={createMockDoctor()} />);
    expect(screen.getByText("4.8")).toBeInTheDocument();
  });

  it("renders the review count", () => {
    render(<DoctorCard doctor={createMockDoctor()} />);
    expect(screen.getByText("(30)")).toBeInTheDocument();
  });

  it("renders the specialty badge", () => {
    render(<DoctorCard doctor={createMockDoctor()} />);
    expect(screen.getByText("Nutritionist")).toBeInTheDocument();
  });

  it("renders up to 2 language badges", () => {
    render(<DoctorCard doctor={createMockDoctor()} />);
    expect(screen.getByText("Spanish")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("renders a +N more badge when there are more than 2 languages", () => {
    const doctor = createMockDoctor({
      languages: ["Spanish", "English", "French", "German"],
    });
    render(<DoctorCard doctor={doctor} />);
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });

  it("does not render a +N more badge when there are 2 or fewer languages", () => {
    render(<DoctorCard doctor={createMockDoctor()} />);
    expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
  });

  it("renders the experience text", () => {
    render(<DoctorCard doctor={createMockDoctor()} />);
    expect(
      screen.getByText("10 years of experience in plant-based nutrition.")
    ).toBeInTheDocument();
  });

  it("renders the View Details link pointing to the correct route", () => {
    render(<DoctorCard doctor={createMockDoctor()} />);
    const link = screen.getByRole("link", { name: /view details/i });
    expect(link).toHaveAttribute("href", "/doctors/doc-001");
  });

  it("hides actions when showActions is false", () => {
    render(<DoctorCard doctor={createMockDoctor()} showActions={false} />);
    expect(screen.queryByRole("link", { name: /view details/i })).not.toBeInTheDocument();
  });

  it("shows actions by default", () => {
    render(<DoctorCard doctor={createMockDoctor()} />);
    expect(screen.getByRole("link", { name: /view details/i })).toBeInTheDocument();
  });

  it("renders phone number when contact has a phone", () => {
    const doctor = createMockDoctor({
      contact: [{ phone: "+52 55 9876 5432" }],
    });
    render(<DoctorCard doctor={doctor} />);
    expect(screen.getByText("+52 55 9876 5432")).toBeInTheDocument();
  });

  it("renders email when contact has an email", () => {
    const doctor = createMockDoctor({
      contact: [{ email: "doctor@example.com" }],
    });
    render(<DoctorCard doctor={doctor} />);
    expect(screen.getByText("doctor@example.com")).toBeInTheDocument();
  });

  it("renders website link when contact has a website", () => {
    const doctor = createMockDoctor({
      contact: [{ website: "https://drlopez.com" }],
    });
    render(<DoctorCard doctor={doctor} />);
    const websiteLink = screen.getByRole("link", { name: /website/i });
    expect(websiteLink).toHaveAttribute("href", "https://drlopez.com");
  });

  it("does not render website link when contact is empty", () => {
    render(<DoctorCard doctor={createMockDoctor()} />);
    expect(screen.queryByRole("link", { name: /website/i })).not.toBeInTheDocument();
  });

  it("does not render contact section when contact list is empty", () => {
    render(<DoctorCard doctor={createMockDoctor()} />);
    expect(screen.queryByTestId("icon-phone")).not.toBeInTheDocument();
  });

  it("has displayName set to DoctorCard", () => {
    const { DoctorCard: DC } = jest.requireActual(
      "@/components/features/doctors/doctor-card"
    );
    expect(DC.displayName).toBe("DoctorCard");
  });
});
