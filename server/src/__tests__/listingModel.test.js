import { validateListing } from "../models/Listing.js";

// Helper to create listing without specific field
const omit = (obj, key) => {
  const { [key]: _, ...rest } = obj;
  return rest;
};

describe("Listing Model", () => {
  describe("validateListing", () => {
    const validListing = {
      title: "Mountain Bike",
      description: "Great condition mountain bike",
      price: 500,
      ownerId: "507f1f77bcf86cd799439011",
      location: "Amsterdam",
    };

    it("should return an empty array for valid listing", () => {
      const errors = validateListing(validListing);
      expect(errors).toHaveLength(0);
    });

    it("should return error when input is null", () => {
      const errors = validateListing(null);
      expect(errors).toContain("listing must be a valid object");
    });

    it("should return error when input is an array", () => {
      const errors = validateListing([]);
      expect(errors).toContain("listing must be a valid object");
    });

    it("should return error when title is missing", () => {
      const errors = validateListing(omit(validListing, "title"));
      expect(errors).toContain("title is a required field");
    });

    it("should return error when description is missing", () => {
      const errors = validateListing(omit(validListing, "description"));
      expect(errors).toContain("description is a required field");
    });

    it("should return error when price is missing", () => {
      const errors = validateListing(omit(validListing, "price"));
      expect(errors).toContain("price is a required field");
    });

    it("should return error when price is negative", () => {
      const listing = { ...validListing, price: -100 };
      const errors = validateListing(listing);
      expect(errors).toContain("price must be a non-negative number");
    });

    it("should return error when price is NaN", () => {
      const listing = { ...validListing, price: NaN };
      const errors = validateListing(listing);
      expect(errors).toContain("price must be a non-negative number");
    });

    it("should return error when price is Infinity", () => {
      const listing = { ...validListing, price: Infinity };
      const errors = validateListing(listing);
      expect(errors).toContain("price must be a non-negative number");
    });

    it("should accept price of 0", () => {
      const listing = { ...validListing, price: 0 };
      const errors = validateListing(listing);
      expect(errors).toHaveLength(0);
    });

    it("should return error when ownerId is missing", () => {
      const errors = validateListing(omit(validListing, "ownerId"));
      expect(errors).toContain("ownerId is a required field");
    });

    it("should return error when location is missing", () => {
      const errors = validateListing(omit(validListing, "location"));
      expect(errors).toContain("location is a required field");
    });

    it("should return error for unknown fields", () => {
      const listing = { ...validListing, unknownField: "value" };
      const errors = validateListing(listing);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should accept all optional fields", () => {
      const listing = {
        ...validListing,
        images: ["image1.jpg", "image2.jpg"],
        status: "active",
        brand: "Giant",
        model: "Talon 2",
        year: 2023,
        condition: "like-new",
        mileage: 500,
      };

      const errors = validateListing(listing);
      expect(errors).toHaveLength(0);
    });
  });
});
