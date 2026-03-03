#!/usr/bin/env node
/**
 * Delete a user by email from MongoDB.
 * Run from project root: npm run delete-user [email]
 * Or: cd server && node src/scripts/deleteUserByEmail.js [email]
 */
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.join(__dirname, "../server");

const child = spawn("node", ["src/scripts/deleteUserByEmail.js", process.argv[2] || "majdhamde1901@gmail.com"], {
  cwd: serverDir,
  stdio: "inherit",
  env: { ...process.env },
});
child.on("exit", (code) => process.exit(code || 0));
