/// <reference types="cypress" />

import TEST_ID_CREATE_USER from "../../../client/src/pages/User/CreateUser.testid";

describe("createuser", () => {
  beforeEach(() => {
    cy.task("db:seed");
  });

  it("Should be able to create a user when ToS is accepted", () => {
    cy.visit("/user/create");
    const testUser = "SOME_UNIQUE_NAME";
    const testUserEmail = `unique_${Date.now()}@example.com`;

    // Try to submit without ToS
    cy.getByTestId(TEST_ID_CREATE_USER.usernameInput).type(testUser);
    cy.getByTestId(TEST_ID_CREATE_USER.emailInput).type(testUserEmail);
    cy.getByTestId(TEST_ID_CREATE_USER.passwordInput).type("Password123!");
    cy.getByTestId(TEST_ID_CREATE_USER.confirmPasswordInput).type("Password123!");
    cy.getByTestId(TEST_ID_CREATE_USER.countrySelect).select("Netherlands");
    cy.getByTestId(TEST_ID_CREATE_USER.citySelect).select("Amsterdam");
    
    // Intercept and ensure no call is made
    cy.intercept("POST", "/api/users").as("signupRequest");
    cy.clickByTestId(TEST_ID_CREATE_USER.submitButton);
    
    cy.getByTestId(TEST_ID_CREATE_USER.validationErrorContainer)
      .should("be.visible")
      .and("contain", "Terms of Service");
    
    cy.get("@signupRequest.all").should("have.length", 0);

    // Accept ToS and submit
    cy.getByTestId(TEST_ID_CREATE_USER.agreedToTermsInput).check();
    cy.clickByTestId(TEST_ID_CREATE_USER.submitButton);

    // Should redirect to verify page
    cy.url().should("include", "/verify-code");
  });
});
