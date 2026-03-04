import createTestIdFilePath from "../utils/createTestIdFilePath";

const TEST_ID = {
  container: `${createTestIdFilePath("components", "Nav")}-container`,
  linkToHome: `${createTestIdFilePath("components", "Nav")}-linkToHome`,
  linkToCreateListing: `${createTestIdFilePath("components", "Nav")}-linkToCreateListing`,
  linkToUsers: `${createTestIdFilePath("components", "Nav")}-linkToUser`,
  linkToSignUp: `${createTestIdFilePath("components", "Nav")}-linkToSignUp`,
  linkToLogin: `${createTestIdFilePath("components", "Nav")}-linkToLogin`,
  linkToLogout: `${createTestIdFilePath("components", "Nav")}-linkToLogout`,
};

export default TEST_ID;
