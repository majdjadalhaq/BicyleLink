
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

  it("should clean up distinct review if exists, then rate, edit, and delete", () => {
    // 0. Login as Buyer
    login(buyerEmail, buyerPassword);
    
    // 1. Find the target listing "test"
    // We assume "test" listing exists as a baseline.
    cy.visit("/");
    cy.get('input[placeholder*="Search"]').type(`test{enter}`);
    cy.wait(1000);
    cy.contains(".listing-card__title", "test").first().parents(".listing-card").within(() => {
        cy.contains("View Details").click();
    });

    // 2. Check if we already reviewed (User Review detected ?)
    // Since we just implemented buttons, if we reviewed, we should see "Edit" "Delete" in the list.
    // Let's open the reviews list to check.
    cy.get(".seller-rating-display").click();
    cy.wait(500);
    
    cy.get("body").then(($body) => {
      // If modal is open
      if ($body.find(".reviews-modal-content").length > 0) {
        if ($body.find(".btn-action-delete").length > 0) {
            // We have a review! Delete it to start fresh.
            cy.log("Found existing review, deleting...");
            cy.get(".btn-action-delete").first().click(); // Click the first one found (ours)
            // Confirm dialog
            // In Cypress, we might need to listen to window:confirm before clicking if it uses native confirm
            // But usually we set up the listener first.
            // Let's try to assume clean state mostly or handle it if we can. 
            // Actually, best to just proceed and if "Already reviewed" happens, we handle it.
        }
        // Close modal
        cy.get(".reviews-modal-close").click();
      }
    });

    // 3. Ensure we are candidate (if not already)
    // Send msg just in case, but ONLY if we can (not sold/disabled)
    cy.get("body").then(($body) => {
        if ($body.find(".btn-contact:not(:disabled)").length > 0) {
            cy.get(".btn-contact").click();
            cy.get(".chat-input input").type("Interested!{enter}");
            cy.wait(500);
        }
    });
    cy.get(".btn-logout").click();

    // 4. Login as Seller -> Mark sold (if not already)
    login(sellerEmail, sellerPassword);
    cy.visit("/my-listings");
    cy.contains(".listing-card__title", "test").parents(".listing-card").within(() => {
         cy.get("a").click(); 
    });
    cy.wait(1000);
    // If not sold, mark sold.
    cy.get("body").then(($body) => {
      if ($body.text().includes("Mark as Sold")) {
        cy.contains("Mark as Sold").click();
        cy.get("select.buyer-select").select(buyerEmail); // Assumes option text contains email
        cy.get(".btn-confirm").click();
        cy.wait(1000);
      }
    });
    cy.get(".btn-logout").click();

    // 5. Login as Buyer -> Rate
    login(buyerEmail, buyerPassword);
    cy.visit("/");
    cy.get('input[placeholder*="Search"]').type(`test{enter}`);
    cy.wait(1000);
    cy.contains(".listing-card__title", "test").first().parents(".listing-card").within(() => {
        cy.contains("View Details").click();
    });

    cy.contains("Rate Seller").should("be.visible").click();
    cy.get(".star-btn").last().click();
    cy.get("textarea.review-comment-input").type(reviewComment);
    cy.get('button[type="submit"]').click();
    
    // Handle Alert
    cy.on("window:alert", (str) => {
      if (str === "Review submitted successfully!") {
        expect(str).to.equal("Review submitted successfully!");
      } else {
        // If already reviewed, we might be in trouble for verification if we can't find OUR review.
        // But let's assume step 2 deleted it if it was there.
        expect(str).to.include("already reviewed");
      }
    });
    
    // 6. Verify Creation (Immediate)
    // The reviews list should open automatically and show the new review
    cy.contains(reviewComment).should("be.visible");
    
    // Verify "Rate Seller" button is GONE
    // We need to close the reviews modal first to see the underlying page clearly, 
    // or just check existence if it's not covered. 
    // But ReviewsList is an overlay. Let's close it to be sure.
    cy.get(".reviews-modal-close").click();
    cy.contains("Rate Seller").should("not.exist");

    // Re-open reviews to edit/delete
    cy.get(".seller-rating-display").click();
    
    // Wait for reviews to load
    cy.contains(reviewComment).should("be.visible");

    // 7. Verify Edit
    cy.contains("Edit").click();
    cy.get(".edit-comment-input").clear().type(updatedComment);
    cy.contains("Save").click();
    cy.contains(updatedComment).should("be.visible");
    cy.contains(reviewComment).should("not.exist");

    // 8. Verify Delete
    cy.contains("Delete").click();
    // Confirm dialog default is usually auto-accepted in Cypress if not Stubbed, but let's be explicit
    cy.on("window:confirm", () => true);
    
    cy.contains(updatedComment).should("not.exist");
    
    // Verify "Rate Seller" button is BACK
    cy.get(".reviews-modal-close").click();
    cy.contains("Rate Seller").should("be.visible");
  });
});
