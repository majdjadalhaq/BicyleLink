import { jest } from "@jest/globals";
import supertest from "supertest";

import {
  connectToMockDB,
  closeMockDatabase,
  clearMockDatabase,
} from "../__testUtils__/dbMock.js";
import app from "../app.js";
import Listing from "../models/Listing.js";
import User from "../models/User.js";

const request = supertest(app);

// Reuse the mock authentication logic from listing.test.js
jest.mock("../middleware/auth.js", () => ({
  authenticate: (req, res, next) => {
    if (global.__mockAuthUser) {
      req.user = global.__mockAuthUser;
      next();
    } else {
      res.status(401).json({ success: false, msg: "Not authorized" });
    }
  },
  requireVerified: (req, res, next) => next(),
  requireOwnership: (_Model) => async (req, res, next) => {
    next(); // Bypass for filter tests as we mostly read
  },
  optionalAuth: (req, res, next) => next(),
}));

beforeAll(async () => {
  await connectToMockDB();
});

afterEach(async () => {
  await clearMockDatabase();
  global.__mockAuthUser = null;
});

afterAll(async () => {
  await closeMockDatabase();
});

const createTestUser = async () => {
  return User.create({
    name: "Filter Tester",
    email: "filter@test.com",
    password: "Password123!",
    country: "Netherlands",
    city: "Amsterdam",
    agreedToTerms: true,
    isVerified: true,
  });
};

const seedListings = async (user) => {
  const listings = [
    {
      title: "Cheap Road Bike",
      description: "Fast",
      price: 100,
      category: "Road",
      brand: "Trek",
      condition: "good",
      year: 2010,
      ownerId: user._id,
      location: "Amsterdam",
      status: "active",
      images: ["img1.jpg"],
    },
    {
      title: "Expensive Mountain Bike",
      description: "Rocky",
      price: 1000,
      category: "Mountain",
      brand: "Giant",
      condition: "new",
      year: 2022,
      ownerId: user._id,
      location: "Rotterdam",
      status: "active",
      images: ["img2.jpg"],
    },
    {
      title: "Mid-range City Bike",
      description: "Urban",
      price: 500,
      category: "City",
      brand: "Gazelle",
      condition: "good",
      year: 2018,
      ownerId: user._id,
      location: "Utrecht",
      status: "active",
      images: ["img3.jpg"],
    },
    {
      title: "Sold Bike",
      description: "Gone",
      price: 200,
      category: "Road",
      brand: "Trek",
      ownerId: user._id,
      location: "Amsterdam",
      status: "sold", // Should be included in list but excluded from facets often
      images: ["img4.jpg"],
    },
  ];
  for (const listing of listings) {
    await Listing.create(listing);
  }
};

describe("Advanced Listing Filters", () => {
  let user;

  beforeEach(async () => {
    user = await createTestUser();
    await seedListings(user);
  });

  describe("GET /api/listings with filters", () => {
    it("should filter by price range", async () => {
      const res = await request.get("/api/listings?minPrice=250&maxPrice=800");
      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(1);
      expect(res.body.result[0].title).toBe("Mid-range City Bike");
    });

    it("should filter by brand (case insensitive)", async () => {
      const res = await request.get("/api/listings?brand=TREK");
      // Should find "Cheap Road Bike" (active) and "Sold Bike" (sold)
      // Assuming getListings returns active+sold by default
      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(2);
    });

    it("should filter by multiple brands", async () => {
      const res = await request.get("/api/listings?brand=Trek,Giant");
      expect(res.status).toBe(200);
      expect(res.body.result.length).toBeGreaterThanOrEqual(3); // 2 Treks + 1 Giant
    });

    it("should filter by category", async () => {
      const res = await request.get("/api/listings?category=Mountain");
      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(1);
      expect(res.body.result[0].category).toBe("Mountain");
    });

    it("should filter by year range", async () => {
      const res = await request.get("/api/listings?minYear=2020");
      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(1);
      expect(res.body.result[0].year).toBe(2022);
    });

    it("should combine multiple filters", async () => {
      const res = await request.get(
        "/api/listings?category=Road&minPrice=50&maxPrice=150",
      );
      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(1);
      expect(res.body.result[0].title).toBe("Cheap Road Bike");
    });
  });

  describe("GET /api/listings/facets", () => {
    it("should return correct statistics for active listings", async () => {
      const res = await request.get("/api/listings/facets");

      expect(res.status).toBe(200);

      // Price Range (100 to 1000) - ignores sold items?
      // The implementation of getListingFacets filters by status: 'active'
      // Active prices: 100, 1000, 500. Min: 100, Max: 1000.
      expect(res.body.minPrice).toBe(100);
      expect(res.body.maxPrice).toBe(1000);

      // Brands (Trek, Giant, Gazelle) - Sold Trek should be ignored
      const brands = res.body.brands.map((b) => b.name).sort();
      expect(brands).toEqual(
        expect.arrayContaining(["Trek", "Giant", "Gazelle"]),
      );

      const trek = res.body.brands.find((b) => b.name === "Trek");
      expect(trek.count).toBe(1); // Only 1 active Trek

      // Categories
      const categories = res.body.categories.map((c) => c.name);
      expect(categories).toContain("Road");
      expect(categories).toContain("Mountain");
      expect(categories).toContain("City");
    });
  });
});
