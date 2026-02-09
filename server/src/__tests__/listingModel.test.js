/* eslint-env jest */
import { validateListing } from "../models/Listing.js";

describe("Listing Model", () => {
  describe("validateListing", () => {
    it("should return an empty array for valid listing", () => {
      const validListing = {
        title: "Mountain Bike",
        description: "Great condition mountain bike",
        type: "used",
        price: 500,
        ownerId: "507f1f77bcf86cd799439011",
        location: "Amsterdam",
      };

      const errors = validateListing(validListing);
      expect(errors).toHaveLength(0);
    });

    it("should return error when title is missing", () => {
      const listing = {
        description: "Great bike",
        type: "used",
        price: 500,
        ownerId: "507f1f77bcf86cd799439011",
        location: "Amsterdam",
      };

      const errors = validateListing(listing);
      expect(errors).toContain("title is a required field");
    });

    it("should return error when description is missing", () => {
      const listing = {
        title: "Mountain Bike",
        type: "used",
        price: 500,
        ownerId: "507f1f77bcf86cd799439011",
        location: "Amsterdam",
      };

      const errors = validateListing(listing);
      expect(errors).toContain("description is a required field");
    });

    it("should return error when type is missing", () => {
      const listing = {
        title: "Mountain Bike",
        description: "Great bike",
        price: 500,
        ownerId: "507f1f77bcf86cd799439011",
        location: "Amsterdam",
      };

      const errors = validateListing(listing);
      expect(errors).toContain("type is a required field");
    });

    it("should return error when type is invalid", () => {
      const listing = {
        title: "Mountain Bike",
        description: "Great bike",
        type: "invalid",
        price: 500,
        ownerId: "507f1f77bcf86cd799439011",
        location: "Amsterdam",
      };

      const errors = validateListing(listing);
      expect(errors).toContain("type must be either 'used' or 'lease'");
    });

    it("should return error when price is missing", () => {
      const listing = {
        title: "Mountain Bike",
        description: "Great bike",
        type: "used",
        ownerId: "507f1f77bcf86cd799439011",
        location: "Amsterdam",
      };

      const errors = validateListing(listing);
      expect(errors).toContain("price is a required field");
    });

    it("should return error when price is negative", () => {
      const listing = {
        title: "Mountain Bike",
        description: "Great bike",
        type: "used",
        price: -100,
        ownerId: "507f1f77bcf86cd799439011",
        location: "Amsterdam",
      };

      const errors = validateListing(listing);
      expect(errors).toContain("price must be a positive number");
    });

    it("should return error when ownerId is missing", () => {
      const listing = {
        title: "Mountain Bike",
        description: "Great bike",
        type: "used",
        price: 500,
        location: "Amsterdam",
      };

      const errors = validateListing(listing);
      expect(errors).toContain("ownerId is a required field");
    });

    it("should return error when location is missing", () => {
      const listing = {
        title: "Mountain Bike",
        description: "Great bike",
        type: "used",
        price: 500,
        ownerId: "507f1f77bcf86cd799439011",
      };

      const errors = validateListing(listing);
      expect(errors).toContain("location is a required field");
    });

    it("should return error when lease listing is missing leaseDuration", () => {
      const listing = {
        title: "New E-Bike",
        description: "Available for leasing",
        type: "lease",
        price: 50,
        ownerId: "507f1f77bcf86cd799439011",
        location: "Rotterdam",
      };

      const errors = validateListing(listing);
      expect(errors).toContain("leaseDuration is required for lease listings");
    });

    it("should accept valid lease listing with leaseDuration", () => {
      const listing = {
        title: "New E-Bike",
        description: "Available for leasing",
        type: "lease",
        price: 50,
        ownerId: "507f1f77bcf86cd799439011",
        location: "Rotterdam",
        leaseDuration: 12,
      };

      const errors = validateListing(listing);
      expect(errors).toHaveLength(0);
    });

    it("should return error for unknown fields", () => {
      const listing = {
        title: "Mountain Bike",
        description: "Great bike",
        type: "used",
        price: 500,
        ownerId: "507f1f77bcf86cd799439011",
        location: "Amsterdam",
        unknownField: "value",
      };

      const errors = validateListing(listing);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should accept all optional fields", () => {
      const listing = {
        title: "Mountain Bike Pro",
        description: "Top condition mountain bike",
        type: "used",
        price: 1500,
        ownerId: "507f1f77bcf86cd799439011",
        location: "Amsterdam",
        images: ["image1.jpg", "image2.jpg"],
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
