describe("PR #1: Core Identity Infrastructure Verification", () => {
  const uniqueEmail = `test_${Date.now()}@example.com`;
  const password = "Password123!";

  it("Signup: Should enforce Terms of Service", () => {
    cy.visit("/signup");

    // Fill all fields except ToS
    cy.get('input[name="username"]').type("TestUser");
    cy.get('input[name="email"]').type(uniqueEmail);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="confirmPassword"]').type(password);
    cy.get('select[name="country"]').select("Netherlands");
    cy.get('select[name="city"]').select("Amsterdam");

    // Intercept signup
    cy.intercept("POST", "/api/users").as("signupRequest");

    // Click submit
    cy.get('button[type="submit"]').click();

    // Check validation error
    cy.contains("Terms of Service").should("be.visible");
    cy.get("@signupRequest.all").should("have.length", 0);

    // Accept ToS and submit
    cy.get('input[type="checkbox"]').check();
    cy.get('button[type="submit"]').click();

    // Should redirect to verify page
    cy.url().should("include", "/verify-code");
  });

  it("Login: Should enforce Verification Guard", () => {
    cy.visit("/login");

    cy.get('input[name="email"]').type(uniqueEmail);
    cy.get('input[name="password"]').type(password);

    // Intercept login
    cy.intercept("POST", "/api/users/login").as("loginRequest");

    cy.get('button[type="submit"]').click();

    // Wait for response and check for 403
    cy.wait("@loginRequest").its("response.statusCode").should("eq", 403);
    cy.contains("Please verify your email first").should("be.visible");
  });
});
