describe("Profile and Security End-to-End Flow", () => {
  const timestamp = Date.now();
  const testUser = {
    username: "testuser_" + timestamp,
    email: "test_" + timestamp + "@example.com",
    password: "Password123!",
    updatedName: "updated_" + timestamp,
  };

  const seededUser = {
    email: "seller@test.com",
    password: "Password123!",
    newEmail: "new_seller_" + timestamp + "@example.com",
  };

  beforeEach(() => {
    cy.task("db:seed");
  });

  it("should complete the streamlined signup and verify the account programmatically", () => {
    cy.visit("/signup");
    
    // Step 1: Streamlined Signup
    cy.get('input[name="username"]').clear().type(testUser.username);
    cy.get('input[name="email"]').clear().type(testUser.email);
    cy.get('input[name="password"]').clear().type(testUser.password);
    cy.get('input[name="confirmPassword"]').clear().type(testUser.password);
    cy.get('input[type="checkbox"]').check();
    cy.get('button[type="submit"]').click();

    // Should redirect to verify code
    cy.url().should("include", "/verify-code");
    
    // Bypassing real email verification via DB task
    cy.task("db:verifyUser", testUser.email).then((res) => {
      expect(res.success).to.be.true;
    });

    // Login
    cy.visit("/login");
    cy.get('input[name="email"]').clear().type(testUser.email);
    cy.get('input[name="password"]').clear().type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });

  it("should handle profile editing and unique username availability", () => {
    // Intercept login
    cy.intercept("POST", "/api/users/login").as("loginReq");
    
    // Login with seeded user
    cy.visit("/login");
    cy.get('input[name="email"]').clear().type(seededUser.email);
    cy.get('input[name="password"]').clear().type(seededUser.password);
    cy.get('button[type="submit"]').click();
    cy.wait("@loginReq");

    // 1. Visit Profile
    cy.get(".profile-toggle").click();
    cy.contains("My Profile").click();
    cy.url().should("include", "/profile/");
    
    // 2. Edit Profile (now use direct button on ProfileView)
    cy.contains("Edit Profile").click();
    cy.url().should("include", "/profile/edit");
    
    cy.get('input[placeholder="Choose a unique username"]').clear().type(testUser.updatedName);
    cy.get('button').contains("Update Profile").click();
    cy.contains("Profile updated successfully!").should("be.visible");

    // 3. Verify logout and unique check
    cy.get(".profile-toggle").click();
    cy.contains("Logout").click();
    cy.visit("/signup");
    cy.get('input[name="username"]').clear().type(testUser.updatedName);
    cy.get('input[name="email"]').clear().type("another_test@example.com");
    cy.get('input[name="password"]').clear().type("Password123!");
    cy.get('input[name="confirmPassword"]').clear().type("Password123!");
    cy.get('input[type="checkbox"]').check();
    cy.get('button[type="submit"]').click();

    // Wait for availability check from backend submission
    cy.contains("Username is already taken").should("be.visible");
  });

  it("should handle secure account settings (Email change 2-step)", () => {
    cy.intercept("POST", "/api/users/login").as("loginReq");
    cy.visit("/login");
    cy.get('input[name="email"]').clear().type(seededUser.email);
    cy.get('input[name="password"]').clear().type(seededUser.password);
    cy.get('button[type="submit"]').click();
    cy.wait("@loginReq");

    cy.visit("/account-settings");
    
    // Test Email Change Request
    cy.get('input[name="newEmail"]').clear().type(seededUser.newEmail);
    cy.get('button').contains("Verify New Email").click();
    cy.contains("A 6-digit code has been sent to").should("be.visible");
    
    // Check if code input appears
    cy.get('input[name="emailCode"]').should("be.visible");
  });

  it("should handle secure account settings (Password/Delete with code)", () => {
    cy.intercept("POST", "/api/users/login").as("loginReq");
    cy.visit("/login");
    cy.get('input[name="email"]').clear().type(seededUser.email);
    cy.get('input[name="password"]').clear().type(seededUser.password);
    cy.get('button[type="submit"]').click();
    cy.wait("@loginReq");
    
    cy.visit("/account-settings");

    // Test Password Change Request
    cy.get('button').contains("Request Security Code").first().click();
    cy.contains("A 6-digit code has been sent").should("be.visible");
    cy.get('input[name="newPassword"]').clear().type("NewPassword123!");

    // Test Delete Account Confirmation
    cy.get('button').contains("Request Security Code to Delete").click();
    cy.contains("irrevocably delete your account", { matchCase: false }).should("be.visible");
  });
});
