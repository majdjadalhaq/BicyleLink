describe("Seller Toolkit - Location Features", () => {
  beforeEach(() => {
    cy.seedDatabase();
    // Login as a verified seller
    cy.visit("/login");
    cy.get('input[type="email"]').type("seller@test.com");
    cy.get('input[type="password"]').type("Password123!");
    cy.get('button[type="submit"]').click();
    cy.visit("/listing/create");
  });

  it("should detect user location automatically", () => {
    // Mock Geolocation
    const mockCoords = {
      latitude: 52.52,
      longitude: 13.405,
    };

    cy.window().then((win) => {
      cy.stub(win.navigator.geolocation, "getCurrentPosition").callsFake((cb) => {
        return cb({ coords: mockCoords });
      });
    });

    // Mock Reverse Geocode Response
    cy.intercept("GET", "/api/utils/reverse-geocode*", {
      success: true,
      result: "Berlin, Mitte",
    }).as("reverseGeocode");

    // Click "Use My Location"
    cy.get(".btn-use-location").click();

    // Verify UI updates
    cy.wait("@reverseGeocode");
    cy.get('input[name="location"]').should("have.value", "Berlin, Mitte");
    
    // Verify Map is visible
    cy.get(".location-map").should("be.visible");
  });

  it("should show map preview when typing location", () => {
    // Mock Geocode Response
    cy.intercept("GET", "/api/utils/geocode*", {
      success: true,
      result: { type: "Point", coordinates: [13.405, 52.52] },
    }).as("geocodeRequest");

    cy.get('input[name="location"]').type("Berlin Alexanderplatz");
    
    // The fetch is debounced (1500ms)
    cy.wait("@geocodeRequest", { timeout: 5000 });
    cy.get(".location-map").should("be.visible");
    cy.get(".seller-preview-map").contains("🗺️ Location Preview");
  });
});
