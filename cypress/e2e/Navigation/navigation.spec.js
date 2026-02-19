/// <reference types="cypress" />

import TEST_ID_HOME from "../../../client/src/pages/Home/Home.testid";
import TEST_ID_NAV from "../../../client/src/components/Nav.testid";
import TEST_ID_USER_LIST from "../../../client/src/pages/User/UserList.testid";
import TEST_ID_CREATE_USER from "../../../client/src/pages/User/CreateUser.testid";

describe("Navigation", () => {
  beforeEach(() => {
    // Ensure we are logged out or in a clean state if needed
    cy.visit("/");
  });

  it("From home page", () => {
    cy.getByTestId(TEST_ID_HOME.container, { timeout: 10000 }).should(
      "be.visible",
    );

    checkNavigation();
  });

  it("From user list page", () => {
    cy.visit("/user");
    cy.getByTestId(TEST_ID_USER_LIST.container, { timeout: 10000 }).should(
      "be.visible",
    );

    checkNavigation();
  });

  it("From create user page", () => {
    cy.visit("/signup");
    cy.getByTestId(TEST_ID_CREATE_USER.container, { timeout: 10000 }).should(
      "be.visible",
    );

    checkNavigation();
  });
});

const checkNavigation = () => {
  // go to users page
  cy.clickByTestId(TEST_ID_NAV.linkToUsers);
  cy.getByTestId(TEST_ID_USER_LIST.container, { timeout: 10000 }).should(
    "be.visible",
  );

  // go to create user page
  // The link in UserList.jsx currently points to /signup
  cy.clickByTestId(TEST_ID_USER_LIST.createUserButton);
  cy.getByTestId(TEST_ID_CREATE_USER.container, { timeout: 10000 }).should(
    "be.visible",
  );

  // go to home
  cy.clickByTestId(TEST_ID_NAV.linkToHome);
  cy.getByTestId(TEST_ID_HOME.container, { timeout: 10000 }).should(
    "be.visible",
  );
};
