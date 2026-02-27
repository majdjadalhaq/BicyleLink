import supertest from "supertest";

import { connectToMockDB, closeMockDatabase } from "../__testUtils__/dbMock.js";
import app from "../app.js";

const request = supertest(app);

beforeAll(async () => {
  await connectToMockDB();
});

afterAll(async () => {
  await closeMockDatabase();
});

describe("GET /api/admin/users", () => {
  it("Should return 401 or 403 if the user is not authenticated", (done) => {
    request
      .get("/api/admin/users")
      .then((response) => {
        // Admin route requires authentication — expect either 401 (no token) or 403 (not admin)
        expect([401, 403]).toContain(response.status);
        expect(response.body.success).toBe(false);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it("Should not expose user list publicly", (done) => {
    // The old /api/users route no longer exists — should now 404
    request
      .get("/api/users")
      .then((response) => {
        expect(response.status).toBe(404);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
