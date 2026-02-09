import createTestIdFilePath from "../util/createTestIdFilePath";

const TEST_ID = {
  linkToHome: `${createTestIdFilePath("components", "Nav")}-linkToHome`,
  linkToCreateListing: `${createTestIdFilePath("components", "Nav")}-linkToCreateListing`,
  linkToUsers: `${createTestIdFilePath("components", "Nav")}-linkToUser`,
};

export default TEST_ID;
