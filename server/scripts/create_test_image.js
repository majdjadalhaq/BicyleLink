import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(
  __dirname,
  "../../cypress/fixtures/test_image.png",
);

const base64Pixel =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKwMTQAAAABJRU5ErkJggg==";

try {
  fs.writeFileSync(fixturePath, Buffer.from(base64Pixel, "base64"));
  console.log("Created test_image.png at", fixturePath);
} catch (err) {
  console.error("Failed to create test image:", err);
  process.exit(1);
}
