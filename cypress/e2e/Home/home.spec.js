/// <reference types="cypress" />

import TEST_ID_HOME from "../../../client/src/pages/Home/Home.testid";

describe("Home page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Go to the Home page", () => {
    // Already handled by beforeEach
  });

  it("The Home page is showing", () => {
    cy.getByTestId(TEST_ID_HOME.container, { timeout: 10000 }).should(
      "be.visible",
    );
  });
});
