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

// Mock useToast to prevent context errors in inner components
jest.mock("../../../hooks/useToast", () => () => ({
  showToast: jest.fn(),
}));

jest.mock("../../../contexts/ThemeContext", () => ({
  useTheme: () => ({ theme: "light" }),
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
        countryCode: "NL",
        latitude: "51.5074",
        longitude: "-0.1278",
      },
      {
        name: "Londonderry",
        countryCode: "NL",
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

    // 2. Type Location
    // The input has placeholder "Enter city..."
    // Because HeroFilter is lazy loaded, we need to await it
    const locationInput = await screen.findByPlaceholderText(
      "Enter city...",
      {},
      { timeout: 8000 },
    );
    // Allow time for country-state-city dynamic import to resolve before typing
    await new Promise((r) => setTimeout(r, 200));
    fireEvent.change(locationInput, { target: { value: "London" } });

    // 3. Select City from Dropdown
    // The dropdown appears when length > 2
    // We need to wait for the city option to appear
    // Note: The City library is mocked above to return "London", so it should appear.
    // If it doesn't, there may be an issue with how the mocked City data is rendered in the component.
    const cityOption = await screen.findByText("London", undefined, {
      timeout: 5000,
    });
    fireEvent.click(cityOption);

    // 4. Apply Filter
    // In the new layout, the apply button is just "Apply" in the sidebar layout
    const applyBtn = screen.getByText("Apply");
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

    // Expand the "Category" section first since it's collapsible
    // Initial state `expandedSections.category` is actually `true`, so Mountain should be visible.
    // Let's make sure it's in the document before clicking
    const categoryChip = await screen.findByText("Mountain");
    fireEvent.click(categoryChip);

    // Use the "Apply" button from the sidebar
    const applyBtn = screen.getByText("Apply");
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(useFetch).toHaveBeenCalledWith(
        expect.stringMatching(/category=Mountain/),
        expect.any(Function),
      );
    });
  });
});
