import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import Home from "../Home";
import TEST_ID_HOME from "../Home.testid";
import { BrowserRouter } from "react-router";

jest.mock("../../../hooks/useToast", () => () => ({
  showToast: jest.fn(),
}));

jest.mock("../../../contexts/ThemeContext", () => ({
  useTheme: () => ({ theme: "light" }),
}));

jest.mock("../../../hooks/useApi", () => () => ({
  executeApi: jest.fn(),
}));

// Home uses direct fetch in useEffect; mock it
beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          result: [],
          page: 1,
          hasMore: false,
          totalCount: 0,
        }),
    }),
  );
});
afterAll(() => {
  delete global.fetch;
});

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
