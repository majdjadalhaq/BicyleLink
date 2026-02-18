/// <reference types="cypress" />

import TEST_ID_USER_LIST from "../../../client/src/pages/User/UserList.testid";

describe("userlist", () => {
  beforeEach(() => {
    cy.task("db:seed");
  });

  it("Should show the users in the database", () => {
    cy.requestFromDatabase("/users").then((data) => {
      const users = data.users; // Adjusted based on testRouter.js response structure
      cy.visit("/user");
      cy.getByTestId(TEST_ID_USER_LIST.container, { timeout: 10000 }).should(
        "be.visible",
      );

      if (users && users.length > 0) {
        users.forEach((user) => {
          cy.getByElementId(user._id).should("be.visible");
        });
      }
    });
  });
});
