import createTestIdFilePath from "../../util/createTestIdFilePath";

const TEST_ID = {
  container: `${createTestIdFilePath("pages", "User", "CreateUser")}-container`,
  usernameInput: `${createTestIdFilePath("pages", "User", "CreateUser")}-usernameInput`,
  emailInput: `${createTestIdFilePath("pages", "User", "CreateUser")}-emailInput`,
  passwordInput: `${createTestIdFilePath("pages", "User", "CreateUser")}-passwordInput`,
  confirmPasswordInput: `${createTestIdFilePath("pages", "User", "CreateUser")}-confirmPasswordInput`,
  countrySelect: `${createTestIdFilePath("pages", "User", "CreateUser")}-countrySelect`,
  citySelect: `${createTestIdFilePath("pages", "User", "CreateUser")}-citySelect`,
  bioTextarea: `${createTestIdFilePath("pages", "User", "CreateUser")}-bioTextarea`,
  agreedToTermsInput: `${createTestIdFilePath("pages", "User", "CreateUser")}-agreedToTermsInput`,
  submitButton: `${createTestIdFilePath("pages", "User", "CreateUser")}-submitButton`,
  loadingContainer: `${createTestIdFilePath("pages", "User", "CreateUser")}-loadingContainer`,
  errorContainer: `${createTestIdFilePath("pages", "User", "CreateUser")}-errorContainer`,
  validationErrorContainer: `${createTestIdFilePath("pages", "User", "CreateUser")}-validationErrorContainer`,
};

export default TEST_ID;
