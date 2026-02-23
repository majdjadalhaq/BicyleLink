describe("Seller Toolkit - Location Features", () => {
  beforeEach(() => {
    cy.seedDatabase();
    cy.visit("/login");

    // Always clear fields before filling (per project rules)
    cy.get('input[type="email"]').clear().type("seller@test.com");
    cy.get('input[type="password"]').clear().type("Password123!");
    cy.get('button[type="submit"]').click();

    cy.url().should("not.include", "/login");
    cy.visit("/listing/create");
  });

  it("should auto-fill location and show map when clicking Use My Location", () => {
    const mockCoords = { latitude: 52.52, longitude: 13.405 };

    cy.window().then((win) => {
      cy.stub(win.navigator.geolocation, "getCurrentPosition").callsFake(
        (cb) => {
          cb({ coords: mockCoords });
        },
      );
    });

    cy.intercept("GET", "/api/utils/reverse-geocode*", {
      statusCode: 200,
      body: { success: true, result: "Berlin, Mitte" },
    }).as("reverseGeocode");

    cy.get(".btn-use-location").click();

    cy.wait("@reverseGeocode");
    cy.get('input[name="location"]').should("have.value", "Berlin, Mitte");
    cy.get(".location-map").should("be.visible");
    cy.get(".seller-preview-map").should("exist");
  });

  it("should show map preview when typing a location", () => {
    cy.intercept("GET", "/api/utils/geocode*", {
      statusCode: 200,
      body: {
        success: true,
        result: { type: "Point", coordinates: [13.405, 52.52] },
      },
    }).as("geocodeRequest");

    // Clear field before typing
    cy.get('input[name="location"]').clear().type("Berlin Alexanderplatz");

    // Debounce is 1500ms
    cy.wait("@geocodeRequest", { timeout: 5000 });
    cy.get(".location-map").should("be.visible");
    cy.get(".seller-preview-map").contains("🗺️ Location Preview");
  });
});
