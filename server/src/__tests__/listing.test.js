import { jest } from "@jest/globals";
import supertest from "supertest";
import mockMongoose from "mongoose";

import {
  connectToMockDB,
  closeMockDatabase,
  clearMockDatabase,
} from "../__testUtils__/dbMock.js";

let request;

// Mock the authenticate middleware using global to bypass jest.mock scoping
// Mock the authenticate middleware using global to bypass jest.mock scoping
jest.unstable_mockModule("../middleware/auth.js", () => ({
  authenticate: (req, res, next) => {
    if (global.__mockAuthUser) {
      req.user = global.__mockAuthUser;
      next();
    } else {
      res.status(401).json({ success: false, msg: "Not authorized" });
    }
  },
  // Default to allowing verification
  requireVerified: (req, res, next) => {
    if (req.user && !req.user.isVerified) {
      return res
        .status(403)
        .json({ success: false, msg: "Email verification required" });
    }
    next();
  },
  // Mock ownership to always pass unless we specifically test failure (handled by controller tests mostly)
  // In a real integration test we'd want this to check DB, but for now we trust unit tests
  requireOwnership: (Model) => async (req, res, next) => {
    const { id } = req.params;
    if (id && !mockMongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid listing ID" });
    }
    if (id) {
      const resource = await Model.findById(id);
      if (!resource) {
        return res
          .status(404)
          .json({ success: false, msg: "Listing not found" });
      }
      req.resource = resource;
    }
    next();
  },
  optionalAuth: (req, res, next) => next(),
}));

const app = (await import("../app.js")).default;
request = supertest(app);
const Listing = (await import("../models/Listing.js")).default;
const User = (await import("../models/User.js")).default;

beforeAll(async () => {
  await connectToMockDB();
}, 20000);

afterEach(async () => {
  await clearMockDatabase();
  global.__mockAuthUser = null;
});

afterAll(async () => {
  await closeMockDatabase();
});

// Helper to create a test user
const createTestUser = async () => {
  const user = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: "TestPassword123!",
    country: "Netherlands",
    city: "Amsterdam",
    agreedToTerms: true,
    isVerified: true,
  });
  return user;
};

const testListingBase = {
  title: "Mountain Bike",
  description: "Great condition mountain bike",
  price: 500,
  location: "Amsterdam",
  category: "Mountain",
  condition: "good",
};

describe("POST /api/listings", () => {
  it("Should return 401 if not authenticated", async () => {
    global.__mockAuthUser = null;
    const response = await request
      .post("/api/listings")
      .send({ listing: testListingBase });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("Should return a bad request if no listing object is given", async () => {
    global.__mockAuthUser = await createTestUser();
    const response = await request.post("/api/listings");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.msg.length).not.toBe(0);
  });

  it("Should return a bad request if listing is null", async () => {
    global.__mockAuthUser = await createTestUser();
    const response = await request
      .post("/api/listings")
      .send({ listing: null });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Should return a bad request if listing is missing required fields", async () => {
    global.__mockAuthUser = await createTestUser();
    const testListing = { title: "Bike" };

    const response = await request
      .post("/api/listings")
      .send({ listing: testListing });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Should create a listing successfully with ownerId from auth", async () => {
    global.__mockAuthUser = await createTestUser();

    const response = await request
      .post("/api/listings")
      .send({ listing: testListingBase });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.listing.title).toEqual(testListingBase.title);
    expect(response.body.listing.price).toEqual(
      testListingBase.price.toString(),
    );
    expect(response.body.listing.ownerId.toString()).toEqual(
      global.__mockAuthUser._id.toString(),
    );
  });
});

describe("GET /api/listings", () => {
  it("Should return an empty array when no listings exist", async () => {
    const response = await request.get("/api/listings");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.result).toEqual([]);
  });

  it("Should return all listings", async () => {
    const user = await createTestUser();
    await Listing.create({ ...testListingBase, ownerId: user._id });
    await Listing.create({
      ...testListingBase,
      title: "City Bike",
      ownerId: user._id,
    });

    const response = await request.get("/api/listings");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.result.length).toBe(2);
  });

  it("Should show both active and sold items by default", async () => {
    const user = await createTestUser();
    await Listing.create({
      ...testListingBase,
      ownerId: user._id,
      status: "active",
    });
    await Listing.create({
      ...testListingBase,
      ownerId: user._id,
      status: "sold",
    });

    const response = await request.get("/api/listings");

    expect(response.status).toBe(200);
    expect(response.body.result.length).toBe(2);
    const statuses = response.body.result.map((l) => l.status);
    expect(statuses).toContain("active");
    expect(statuses).toContain("sold");
  });

  it("Should filter listings by status", async () => {
    const user = await createTestUser();
    await Listing.create({
      ...testListingBase,
      ownerId: user._id,
      status: "active",
    });
    await Listing.create({
      ...testListingBase,
      title: "Sold Bike",
      ownerId: user._id,
      status: "sold",
    });

    const response = await request.get("/api/listings?status=sold");

    expect(response.status).toBe(200);
    expect(response.body.result.length).toBe(1);
    expect(response.body.result[0].status).toBe("sold");
  });
});

describe("GET /api/listings/:id", () => {
  it("Should return 400 for invalid ObjectId", async () => {
    const response = await request.get("/api/listings/not-a-valid-id");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.msg).toBe("Invalid listing ID");
  });

  it("Should return 404 for non-existent listing", async () => {
    const fakeId = new mockMongoose.Types.ObjectId();
    const response = await request.get(`/api/listings/${fakeId}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("Should return a single listing by ID", async () => {
    const user = await createTestUser();
    const listing = await Listing.create({
      ...testListingBase,
      ownerId: user._id,
    });

    const response = await request.get(`/api/listings/${listing._id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.result.title).toEqual(testListingBase.title);
  });
});

describe("PUT /api/listings/:id", () => {
  it("Should return 400 for invalid ObjectId", async () => {
    global.__mockAuthUser = await createTestUser();
    const response = await request
      .put("/api/listings/not-a-valid-id")
      .send({ listing: { price: 450 } });

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Invalid listing ID");
  });

  it("Should update a listing", async () => {
    const user = await createTestUser();
    global.__mockAuthUser = user;
    const listing = await Listing.create({
      ...testListingBase,
      ownerId: user._id,
    });

    const response = await request
      .put(`/api/listings/${listing._id}`)
      .send({ listing: { price: 450 } });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.listing.price).toBe("450");
  });

  it("Should return 404 for non-existent listing", async () => {
    global.__mockAuthUser = await createTestUser();
    const fakeId = new mockMongoose.Types.ObjectId();
    const response = await request
      .put(`/api/listings/${fakeId}`)
      .send({ listing: { price: 450 } });

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/listings/:id", () => {
  it("Should return 400 for invalid ObjectId", async () => {
    global.__mockAuthUser = await createTestUser();
    const response = await request.delete("/api/listings/not-a-valid-id");

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Invalid listing ID");
  });

  it("Should delete a listing", async () => {
    const user = await createTestUser();
    global.__mockAuthUser = user;
    const listing = await Listing.create({
      ...testListingBase,
      ownerId: user._id,
    });

    const response = await request.delete(`/api/listings/${listing._id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const deletedListing = await Listing.findById(listing._id);
    expect(deletedListing).toBeNull();
  });

  it("Should return 404 for non-existent listing", async () => {
    global.__mockAuthUser = await createTestUser();
    const fakeId = new mockMongoose.Types.ObjectId();
    const response = await request.delete(`/api/listings/${fakeId}`);

    expect(response.status).toBe(404);
  });
});
