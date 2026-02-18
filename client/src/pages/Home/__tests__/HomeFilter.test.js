import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "../Home";
import { BrowserRouter } from "react-router-dom";
import useFetch from "../../../hooks/useFetch";

// Mock the hook
jest.mock("../../../hooks/useFetch", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock child components to isolate Home logic
jest.mock("../../../components/ListingCard", () => () => (
  <div data-testid="listing-card">Listing</div>
));
jest.mock("../../../components/Skeleton/Skeleton", () => () => (
  <div data-testid="skeleton">Skeleton</div>
));

// Mock country-state-city
jest.mock("country-state-city", () => ({
  City: {
    getAllCities: jest.fn().mockReturnValue([
      {
        name: "London",
        countryCode: "GB",
        latitude: "51.5074",
        longitude: "-0.1278",
      },
      {
        name: "Londonderry",
        countryCode: "GB",
        latitude: "54.9966",
        longitude: "-7.3086",
      },
    ]),
  },
}));

// Wrapper to provide router context if needed (though Home doesn't strictly use Link/Navigate in the snippet I saw)
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Home Filter Integration", () => {
  beforeEach(() => {
    useFetch.mockReset();
    // Default mock implementation
    useFetch.mockReturnValue({
      isLoading: false,
      error: null,
      performFetch: jest.fn(), // performFetch is called in useEffect
      cancelFetch: jest.fn(),
    });
  });

  it("updates query string with location when filter is applied", async () => {
    renderWithRouter(<Home />);

    // Initial render check
    expect(useFetch).toHaveBeenCalledWith(
      expect.stringContaining("/listings?"),
      expect.any(Function),
    );

    // 1. Open Filter
    const filterToggle = screen.getByTitle("Advanced Filters");
    fireEvent.click(filterToggle);

    // 2. Type Location
    // The input has placeholder "Enter city..."
    const locationInput = screen.getByPlaceholderText("Enter city...");
    fireEvent.change(locationInput, { target: { value: "London" } });

    // 3. Select City from Dropdown
    // The dropdown appears when length > 2
    // We need to wait for the city option to appear
    // Note: The City library is mocked above to return "London", so it should appear.
    // If it doesn't, there may be an issue with how the mocked City data is rendered in the component.
    const cityOption = await screen.findByText(
      "London",
      { selector: ".city-name" },
      { timeout: 3000 },
    );
    fireEvent.click(cityOption);

    // 4. Apply Filter
    const applyBtn = screen.getByText("Apply Filters");
    fireEvent.click(applyBtn);

    // 5. Verification
    // Use waitFor because state updates are async
    await waitFor(
      () => {
        expect(useFetch).toHaveBeenCalledWith(
          expect.stringMatching(/location=London/),
          expect.any(Function),
        );
      },
      { timeout: 2000 },
    );
  });

  it("updates query string with category when filter is applied", async () => {
    renderWithRouter(<Home />);

    const filterToggle = screen.getByTitle("Advanced Filters");
    fireEvent.click(filterToggle);

    // Find and click a category chip, e.g., "Mountain"
    const categoryChip = screen.getByText("Mountain");
    fireEvent.click(categoryChip);

    const applyBtn = screen.getByText("Apply Filters");
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(useFetch).toHaveBeenCalledWith(
        expect.stringMatching(/category=Mountain/),
        expect.any(Function),
      );
    });
  });
});
