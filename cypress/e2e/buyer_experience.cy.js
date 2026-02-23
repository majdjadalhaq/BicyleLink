describe("Buyer Experience - Proximity Features", () => {
  beforeEach(() => {
    cy.seedDatabase();
    cy.visit("/");
    // Open the first listing detail page
    cy.get(".listing-card").first().find("a, button").first().click();
    cy.url().should("include", "/listings/");
  });

  it("should show dual pins, distance badge, and polyline on check distance", () => {
    const mockCoords = { latitude: 52.52, longitude: 13.405 };

    cy.window().then((win) => {
      cy.stub(win.navigator.geolocation, "getCurrentPosition").callsFake(
        (cb) => {
          cb({ coords: mockCoords });
        },
      );
    });

    // Initial state — no distance badge or user marker yet
    cy.get(".distance-badge").should("not.exist");
    cy.get(".user-location-marker").should("not.exist");

    // Click "Check Distance"
    cy.get(".btn-map-primary").click();

    // Distance badge should appear with "km away" text
    cy.get(".distance-badge", { timeout: 10000 }).should("be.visible");
    cy.contains("km away").should("be.visible");

    // User marker (blue dot) should appear on the map
    cy.get(".user-location-marker", { timeout: 5000 }).should("exist");

    // The button row should now show "Open in Google Maps"
    cy.get(".btn-map-action")
      .contains("Open in Google Maps")
      .should("be.visible");

    // View toggles should appear in the header
    cy.get(".map-view-toggles").should("be.visible");
    cy.get(".view-toggle-btn").should("have.length", 3);
  });

  it("should switch map focus when view toggle buttons are clicked", () => {
    const mockCoords = { latitude: 52.52, longitude: 13.405 };

    cy.window().then((win) => {
      cy.stub(win.navigator.geolocation, "getCurrentPosition").callsFake(
        (cb) => {
          cb({ coords: mockCoords });
        },
      );
    });

    cy.get(".btn-map-primary").click();
    cy.get(".map-view-toggles", { timeout: 10000 }).should("be.visible");

    // Focus on Me toggle
    cy.get(".view-toggle-btn").contains("👤").click();
    cy.get(".view-toggle-btn.active").contains("👤");

    // Focus on Bike toggle
    cy.get(".view-toggle-btn").contains("🚲").click();
    cy.get(".view-toggle-btn.active").contains("🚲");

    // See Both toggle
    cy.get(".view-toggle-btn").contains("🗺️").click();
    cy.get(".view-toggle-btn.active").contains("🗺️");
  });
});
