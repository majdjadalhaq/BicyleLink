import { jest } from "@jest/globals";
import supertest from "supertest";

import { connectToMockDB, closeMockDatabase } from "../__testUtils__/dbMock.js";
import app from "../app.js";
import { findUserInMockDB } from "../__testUtils__/userMocks.js";

const request = supertest(app);

jest.setTimeout(60000);

beforeAll(async () => {
  await connectToMockDB();
});

afterAll(async () => {
  await closeMockDatabase();
});

// Minimal valid user — city/country are optional now
const testUserBase = {
  name: "John",
  email: "john@doe.com",
  password: "Password123!",
};

describe("POST /api/users", () => {
  it("Should return a bad request if no user object is given", (done) => {
    request
      .post("/api/users")
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        done();
      })
      .catch((err) => done(err));
  });

  it("Should return a bad request if name is missing", (done) => {
    const testUser = { ...testUserBase };
    delete testUser.name;

    request
      .post("/api/users")
      .send({ user: testUser })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toContain("name");
        done();
      })
      .catch((err) => done(err));
  });

  it("Should return a bad request if email is missing", (done) => {
    const testUser = { ...testUserBase };
    delete testUser.email;

    request
      .post("/api/users")
      .send({ user: testUser })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toContain("email");
        done();
      })
      .catch((err) => done(err));
  });

  it("Should return a bad request if password is missing", (done) => {
    const testUser = { ...testUserBase };
    delete testUser.password;

    request
      .post("/api/users")
      .send({ user: testUser })
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.msg).toContain("password");
        done();
      })
      .catch((err) => done(err));
  });

  it("Should return a success state if a correct user is given", async () => {
    const testUser = { ...testUserBase };

    const response = await request.post("/api/users").send({ user: testUser });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.user.name).toEqual(testUser.name);
    // Password should NOT be in the response
    expect(response.body.user.password).toBeUndefined();

    const userInDb = await findUserInMockDB(response.body.user._id);
    expect(userInDb.name).toEqual(testUser.name);
    expect(userInDb.isVerified).toBe(false); // Default should be false
    expect(userInDb.agreedToTerms).toBe(true); // Default in schema is true
  });

  it("Should return a success state when city and country are provided", async () => {
    const testUser = {
      ...testUserBase,
      name: "Jane",
      email: "jane@doe.com",
      city: "Amsterdam",
      country: "Netherlands",
    };

    const response = await request.post("/api/users").send({ user: testUser });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
