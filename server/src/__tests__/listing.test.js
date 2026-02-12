import supertest from "supertest";
import mongoose from "mongoose";

import { connectToMockDB, closeMockDatabase } from "../__testUtils__/dbMock.js";
import app from "../app.js";
import Listing from "../models/Listing.js";
import User from "../models/User.js";

const request = supertest(app);

beforeAll(async () => {
  await connectToMockDB();
});

afterAll(async () => {
  await closeMockDatabase();
});

// Helper to create a test user
const createTestUser = async () => {
  const user = await User.create({
    name: "Test User",
    email: "test@example.com",
  });
  return user;
};

const testListingBase = {
  title: "Mountain Bike",
  description: "Great condition mountain bike",
  price: 500,
  location: "Amsterdam",
};

describe("POST /api/listings", () => {
  it("Should return a bad request if no listing object is given", async () => {
    const response = await request.post("/api/listings");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.msg.length).not.toBe(0);
  });

  it("Should return a bad request if listing is null", async () => {
    const response = await request
      .post("/api/listings")
      .send({ listing: null });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Should return a bad request if listing is missing required fields", async () => {
    const testListing = { title: "Bike" };

    const response = await request
      .post("/api/listings")
      .send({ listing: testListing });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("Should create a listing successfully", async () => {
    const user = await createTestUser();
    const testListing = { ...testListingBase, ownerId: user._id.toString() };

    const response = await request
      .post("/api/listings")
      .send({ listing: testListing });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.listing.title).toEqual(testListing.title);
    expect(response.body.listing.price).toEqual(testListing.price);
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
    const fakeId = new mongoose.Types.ObjectId();
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
    const response = await request
      .put("/api/listings/not-a-valid-id")
      .send({ listing: { price: 450 } });

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Invalid listing ID");
  });

  it("Should update a listing", async () => {
    const user = await createTestUser();
    const listing = await Listing.create({
      ...testListingBase,
      ownerId: user._id,
    });

    const response = await request
      .put(`/api/listings/${listing._id}`)
      .send({ listing: { price: 450 } });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.listing.price).toBe(450);
  });

  it("Should return 404 for non-existent listing", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await request
      .put(`/api/listings/${fakeId}`)
      .send({ listing: { price: 450 } });

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/listings/:id", () => {
  it("Should return 400 for invalid ObjectId", async () => {
    const response = await request.delete("/api/listings/not-a-valid-id");

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Invalid listing ID");
  });

  it("Should delete a listing", async () => {
    const user = await createTestUser();
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
    const fakeId = new mongoose.Types.ObjectId();
    const response = await request.delete(`/api/listings/${fakeId}`);

    expect(response.status).toBe(404);
  });
});
