/**
 * This file is used to create the TEST_ID file paths.
 * Moved from util/ to utils/ for consistency.
 */
const createTestIdFilePath = (...args) => {
  return args.join("/");
};

export default createTestIdFilePath;
