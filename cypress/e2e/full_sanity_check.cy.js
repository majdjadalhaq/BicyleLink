
describe("Full Application Sanity Check", () => {
  const timestamp = new Date().getTime();
  const listingTitle = `Sanity Listing ${timestamp}`;
  
  it("should login with verified seller, create a listing, and verify detail view", () => {
     // Use known verified user
     const knownUser = "seller@test.com"; 
     const knownPass = "Password123!";
     
     cy.visit("/login");
     cy.get('input[type="email"]').type(knownUser);
     cy.get('input[type="password"]').type(knownPass);
     cy.get('button[type="submit"]').click();

     // Wait for redirect to home or dashboard
     cy.location("pathname").should("not.include", "/login");
     
     // 2. Create Listing
     // Link text is "Sell a Bike"
     cy.get("nav").contains("Sell a Bike").should("be.visible").click();

     // Should be on /listing/create
     cy.location("pathname").should("equal", "/listing/create");
     
     cy.get('input[name="title"]').type(listingTitle);
     cy.get('input[name="brand"]').type("Cypress Brand");
     cy.get('select[name="condition"]').select("Good");
     cy.get('select[name="category"]').select("Other");
     cy.get('#description').type("This is a test listing created by verified user");
     cy.get('input[type="file"]').selectFile("cypress/fixtures/test_image.png", { force: true });
     cy.get('input[name="price"]').type("150");
     cy.get('input[name="location"]').type("Berlin"); 
     
     cy.get('button[type="submit"]').click();
     
     // 3. Verify Redirect to Detail
     // Wait for navigation
     cy.location("pathname", { timeout: 10000 }).should("include", "/listings/");
     cy.contains(listingTitle).should("be.visible");
     
     // 4. Verify Refactored Components
     // Carousel
     cy.get(".listing-image-carousel", { timeout: 10000 }).should("exist");
     // Seller Card
     cy.get(".seller-card").should("exist");
     
     // 5. Search visibility
     cy.visit("/");
     cy.get('input[placeholder*="Search"]').type(`${listingTitle}{enter}`);
     cy.contains(".listing-card__title", listingTitle).should("be.visible");
  });
});
