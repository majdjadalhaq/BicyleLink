import createTestIdFilePath from "../util/createTestIdFilePath";

const TEST_ID = {
  linkToHome: `${createTestIdFilePath("components", "Nav")}-linkToHome`,
  linkToUsers: `${createTestIdFilePath("components", "Nav")}-linkToUser`,
  linkToSignUp: `${createTestIdFilePath("components", "Nav")}-linkToSignUp`,
  linkToLogin: `${createTestIdFilePath("components", "Nav")}-linkToLogin`,
  linkToLogout: `${createTestIdFilePath("components", "Nav")}-linkToLogout`,
};

export default TEST_ID;
