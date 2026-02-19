/// <reference types="cypress" />

import TEST_ID_CREATE_USER from "../../../client/src/pages/User/CreateUser.testid";

describe("createuser", () => {
  beforeEach(() => {
    cy.task("db:seed");
  });

  it("Should be able to create a user when ToS is accepted", () => {
    cy.visit("/signup");
    const testUsername = `User_${Date.now()}`;
    const testUserEmail = `unique_${Date.now()}@example.com`;
    const testPassword = "Password123!";

    // Try to submit without ToS
    cy.getByTestId(TEST_ID_CREATE_USER.usernameInput).type(testUsername);
    cy.getByTestId(TEST_ID_CREATE_USER.emailInput).type(testUserEmail);
    cy.getByTestId(TEST_ID_CREATE_USER.passwordInput).type(testPassword);
    cy.getByTestId(TEST_ID_CREATE_USER.confirmPasswordInput).type(testPassword);

    // Select country
    cy.getByTestId(TEST_ID_CREATE_USER.countrySelect).select("Netherlands");

    // Wait for city select to be enabled
    cy.getByTestId(TEST_ID_CREATE_USER.citySelect, { timeout: 10000 }).should(
      "not.be.disabled",
    );
    cy.getByTestId(TEST_ID_CREATE_USER.citySelect).select("Amsterdam");

    // Intercept and ensure no call is made if ToS is not checked
    cy.intercept("POST", "/api/users").as("signupRequest");
    cy.clickByTestId(TEST_ID_CREATE_USER.submitButton);

    cy.getByTestId(TEST_ID_CREATE_USER.validationErrorContainer, {
      timeout: 10000,
    })
      .should("be.visible")
      .and("contain", "Terms of Service");

    cy.get("@signupRequest.all").should("have.length", 0);

    // Accept ToS and submit
    cy.getByTestId(TEST_ID_CREATE_USER.agreedToTermsInput).check();
    cy.clickByTestId(TEST_ID_CREATE_USER.submitButton);

    // Should redirect to verify page
    cy.url({ timeout: 15000 }).should("include", "/verify-code");
  });
});
