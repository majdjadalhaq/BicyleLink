/**
 * Admin route authorization tests.
 * Verifies that non-admin users receive 403 on admin endpoints.
 * Requires JWT_SECRET for login to succeed.
 */
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-jwt-secret-for-admin-unauthorized-tests";

import bcrypt from "bcrypt";
import supertest from "supertest";
import {
  connectToMockDB,
  closeMockDatabase,
  clearMockDatabase,
} from "../__testUtils__/dbMock.js";
import User from "../models/User.js";

const { default: app } = await import("../app.js");
const request = supertest(app);

beforeAll(async () => {
  await connectToMockDB();
}, 20000);

afterEach(async () => {
  await clearMockDatabase();
});

afterAll(async () => {
  await closeMockDatabase();
});

const createRegularUser = async () => {
  const hashedPassword = await bcrypt.hash("Password123!", 12);
  const user = await User.create({
    name: "Regular User",
    email: "regular@example.com",
    password: hashedPassword,
    country: "Netherlands",
    city: "Amsterdam",
    agreedToTerms: true,
    role: "user",
    isVerified: true,
  });
  return user;
};

/**
 * Logs in and returns a cookie string suitable for supertest .set("Cookie", cookie).
 * Server sends Set-Cookie: token=xxx; Path=/; HttpOnly; ...
 * We need Cookie: token=xxx for the request.
 */
const loginAs = async (email, password) => {
  const res = await request.post("/api/users/login").send({ email, password });

  if (res.status !== 200 || !res.headers["set-cookie"]) {
    return null;
  }
  const setCookie = res.headers["set-cookie"].find((c) =>
    c.startsWith("token="),
  );
  if (!setCookie) return null;
  return setCookie.split(";")[0].trim();
};

describe("Admin routes - unauthorized access", () => {
  it("GET /api/admin/stats returns 401 when not authenticated", async () => {
    const res = await request.get("/api/admin/stats");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/admin/users returns 403 when authenticated as regular user", async () => {
    const user = await createRegularUser();
    const cookie = await loginAs(user.email, "Password123!");
    expect(cookie).toBeTruthy();

    const res = await request.get("/api/admin/users").set("Cookie", cookie);
    expect(res.status).toBe(403);
    expect(res.body.msg).toMatch(/admin|denied|privileges/i);
  });

  it("GET /api/admin/listings returns 403 when authenticated as regular user", async () => {
    const user = await createRegularUser();
    const cookie = await loginAs(user.email, "Password123!");
    expect(cookie).toBeTruthy();

    const res = await request.get("/api/admin/listings").set("Cookie", cookie);
    expect(res.status).toBe(403);
    expect(res.body.msg).toMatch(/admin|denied|privileges/i);
  });

  it("GET /api/admin/reports returns 401 when not authenticated", async () => {
    const res = await request.get("/api/admin/reports");
    expect(res.status).toBe(401);
  });
});
