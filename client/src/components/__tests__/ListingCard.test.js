import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ListingCard from "../ListingCard";
import "@testing-library/jest-dom";

const mockListing = {
  _id: "123",
  title: "Test Bike",
  price: 100,
  images: ["test.jpg"],
  location: "Amsterdam",
  condition: "like-new",
  brand: "TestBrand",
};

describe("ListingCard", () => {
  const renderCard = (props = {}) => {
    return render(
      <BrowserRouter>
        <ListingCard listing={{ ...mockListing, ...props }} />
      </BrowserRouter>,
    );
  };

  test("renders price correctly when it is a number", () => {
    renderCard({ price: 150 });
    expect(screen.getByText(/150/)).toBeInTheDocument();
    expect(screen.getByText(/€/)).toBeInTheDocument();
  });

  test("renders price correctly when it is a string", () => {
    renderCard({ price: "250.50" });
    expect(screen.getByText(/250\.50/)).toBeInTheDocument();
  });

  test("renders condition badge correctly", () => {
    renderCard({ condition: "poor" });
    expect(screen.getByText("poor")).toHaveClass("listing-card__badge");
  });

  test("does not render condition badge if not provided", () => {
    renderCard({ condition: null });
    const badge = screen.queryByText("like-new");
    expect(badge).not.toBeInTheDocument();
  });

  test("renders brand if provided", () => {
    renderCard({ brand: "Gazelle" });
    expect(screen.getByText("Gazelle")).toBeInTheDocument();
  });
});
