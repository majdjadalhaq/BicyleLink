describe("Debug DB Task", () => {
  it("should verify a user", () => {
    const email = "seller@test.com";
    cy.task("db:seed");
    cy.task("db:verifyUser", email).then((res) => {
      cy.log(JSON.stringify(res));
      expect(res.success).to.be.true;
      expect(res.found).to.be.true;
    });
  });
});
