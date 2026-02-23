describe("Seller Rating and Review Flow", () => {
  const sellerEmail = "seller@test.com";
  const sellerPassword = "Password123!";
  const buyerEmail = "buyer@test.com";
  const buyerPassword = "Password123!";
  const timestamp = new Date().getTime();
  const listingTitle = `Cypress Test Item ${timestamp}`;
  const reviewComment = `Automated Review ${timestamp}`;
  const updatedComment = `Updated Review ${timestamp}`;

  const login = (email, password) => {
    cy.visit("/login");
    cy.get('input[type="email"]').clear().type(email);
    cy.get('input[type="password"]').clear().type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should("not.include", "/login");
  };

  beforeEach(() => {
    cy.seedDatabase();
  });

  it("should create listing, sell it, and verify review flow", () => {
    // 1. Create a NEW listing as Seller
    login(sellerEmail, sellerPassword);
    cy.get("nav").contains("Sell").click();
    cy.url().should("include", "/listing/create");

    cy.get('input[name="title"]').type(listingTitle);
    cy.get('input[name="brand"]').type("Cypress Brand");
    cy.get('select[name="condition"]').select("Good");
    cy.get('select[name="category"]').select("Other");
    cy.get("#description").type("This is a test listing for review flow");
    cy.get('input[type="file"]').selectFile("cypress/fixtures/test_image.png", {
      force: true,
    });
    cy.get('input[name="price"]').type("150");
    cy.get('input[name="location"]').type("Berlin");
    cy.get('button[type="submit"]').click();

    cy.location("pathname", { timeout: 15000 }).should("include", "/listings/");
    cy.contains(listingTitle).should("be.visible");
    cy.get(".profile-toggle").click();
    cy.contains("Logout").click();

    // 2. Login as Buyer and start a chat
    login(buyerEmail, buyerPassword);
    cy.visit("/");
    cy.get('input[placeholder*="Search"]').type(`${listingTitle}{enter}`);
    cy.contains(".listing-card__title", listingTitle)
      .first()
      .parents(".listing-card")
      .within(() => {
        cy.contains("View Details").click();
      });

    cy.get(".btn-contact").click();
    cy.get('input[placeholder*="message"]', { timeout: 10000 }).type(
      "Hi, I want to buy this!{enter}",
    );
    cy.contains("Hi, I want to buy this!", { timeout: 10000 }).should(
      "be.visible",
    );
    cy.get(".profile-toggle").click();
    cy.contains("Logout").click();

    // 3. Login as Seller and Mark as Sold
    login(sellerEmail, sellerPassword);
    cy.visit("/");
    cy.get('input[placeholder*="Search"]').type(`${listingTitle}{enter}`);
    cy.contains(".listing-card__title", listingTitle)
      .first()
      .parents(".listing-card")
      .within(() => {
        cy.contains("View Details").click();
      });

    cy.get("button").contains("Mark as Sold").click();
    cy.get(".modal-content", { timeout: 10000 }).should("be.visible");
    cy.contains("Loading buyers...").should("not.exist");

    cy.get("select option")
      .contains(buyerEmail)
      .then(($opt) => {
        cy.get("select").select($opt.val());
      });
    cy.get("button").contains("Confirm Sold").click();
    cy.get(".toast--success", { timeout: 10000 }).should("be.visible");
    cy.get(".profile-toggle").click();
    cy.contains("Logout").click();

    // 4. Login as Buyer and submit a review
    login(buyerEmail, buyerPassword);
    cy.visit("/");
    cy.get('input[placeholder*="Search"]').type(`${listingTitle}{enter}`);
    cy.contains(".listing-card__title", listingTitle)
      .first()
      .parents(".listing-card")
      .within(() => {
        cy.contains("View Details").click();
      });

    cy.contains("Rate Seller").click();
    cy.get(".star-btn").last().click();
    cy.get("textarea.review-comment-input").type(reviewComment);
    cy.get('button[type="submit"]').click();

    cy.get(".toast--success", { timeout: 10000 })
      .should("be.visible")
      .and("contain", "Review submitted successfully");

    // Verify review in list
    cy.contains(reviewComment).should("be.visible");
    cy.get(".reviews-modal-close").click();
    cy.contains("Rate Seller").should("not.exist");

    // 5. Re-open reviews to edit/delete
    cy.get(".seller-rating-display").click();
    cy.contains("Edit").click();
    cy.get(".edit-comment-input").clear().type(updatedComment);
    cy.contains("Save").click();
    cy.contains(updatedComment).should("be.visible");

    cy.contains("Delete").click();
    cy.on("window:confirm", () => true);
    cy.contains(updatedComment).should("not.exist");

    cy.get(".reviews-modal-close").click();
    cy.contains("Rate Seller").should("be.visible");
  });
});
