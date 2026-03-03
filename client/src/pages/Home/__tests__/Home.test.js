import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import Home from "../Home";
import TEST_ID_HOME from "../Home.testid";
import { BrowserRouter } from "react-router-dom";

jest.mock("../../../hooks/useToast", () => () => ({
  showToast: jest.fn(),
}));

jest.mock("../../../contexts/ThemeContext", () => ({
  useTheme: () => ({ theme: "light" }),
}));

jest.mock("../../../hooks/useApi", () => () => ({
  executeApi: jest.fn(),
}));

jest.mock("../../../hooks/useFetch", () =>
  jest.fn(() => ({
    isLoading: false,
    error: null,
    performFetch: jest.fn(),
    cancelFetch: jest.fn(),
  })),
);

jest.mock("../../../components/ListingCard.jsx", () => {
  const MockListingCard = () => <div data-testid="mock-listing-card" />;
  return { __esModule: true, default: MockListingCard };
});
jest.mock("../../../components/HeroFilter/HeroFilter.jsx", () => {
  const MockHeroFilter = () => <div data-testid="mock-hero-filter" />;
  return { __esModule: true, default: MockHeroFilter };
});

describe("Home", () => {
  it("Renders without a problem", async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId(TEST_ID_HOME.container)).toBeInTheDocument();
    });
  });
});
