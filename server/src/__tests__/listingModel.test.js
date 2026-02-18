import Listing from "../models/Listing.js";
import mockMongoose from "mongoose";

describe("Listing Model", () => {
  describe("Listing Model Validation", () => {
    const testUser = new mockMongoose.Types.ObjectId();
    const validListingData = {
      title: "Mountain Bike",
      description: "Great condition mountain bike",
      price: 500,
      location: "Amsterdam",
      category: "Mountain",
      condition: "good",
      ownerId: testUser,
    };

    it("should validate a correct listing", () => {
      const listing = new Listing(validListingData);
      const err = listing.validateSync();
      expect(err).toBeUndefined();
    });

    it("should fail if required fields are missing", () => {
      const listing = new Listing({ title: "Bike" });
      const err = listing.validateSync();
      expect(err.errors.description).toBeDefined();
      expect(err.errors.price).toBeDefined();
      expect(err.errors.location).toBeDefined();
      expect(err.errors.ownerId).toBeDefined();
    });

    it("should fail if price is negative", () => {
      const listing = new Listing({ ...validListingData, price: -100 });
      const err = listing.validateSync();
      expect(err.errors.price).toBeDefined();
      expect(err.errors.price.message).toContain("non-negative");
    });

    it("should fail if more than 5 images are provided", () => {
      const listing = new Listing({
        ...validListingData,
        images: ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"],
      });
      const err = listing.validateSync();
      expect(err.errors.images).toBeDefined();
      expect(err.errors.images.message).toBe(
        "You can only upload a maximum of 5 images.",
      );
    });

    it("should accept valid enum values for condition", () => {
      const listing = new Listing({ ...validListingData, condition: "new" });
      const err = listing.validateSync();
      expect(err).toBeUndefined();
    });

    it("should fail for invalid enum values for condition", () => {
      const listing = new Listing({ ...validListingData, condition: "broken" });
      const err = listing.validateSync();
      expect(err.errors.condition).toBeDefined();
    });

    it("should convert Decimal128 to string in toJSON", () => {
      const listing = new Listing(validListingData);
      const json = listing.toJSON();
      expect(typeof json.price).toBe("string");
      expect(json.price).toBe("500");
    });
  });
});
