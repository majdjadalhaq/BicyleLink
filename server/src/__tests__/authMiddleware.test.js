// Verified Auth Middleware Logic
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import {
  authenticate,
  requireVerified,
  requireOwnership,
  optionalAuth,
} from "../middleware/auth.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Mock dependencies
jest.mock("jsonwebtoken");
jest.mock("../models/User.js");
jest.mock("mongoose", () => {
  const original = jest.requireActual("mongoose");
  return {
    ...original,
    Types: {
      ObjectId: {
        isValid: jest.fn(),
      },
    },
  };
});
jest.mock("../util/logging.js", () => ({
  logError: jest.fn(),
}));

// Mock process.env
process.env.JWT_SECRET = "test-secret";

describe("Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {},
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("authenticate", () => {
    it("should return 401 if no token is provided", async () => {
      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        msg: "Not authorized to access this route",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if token is invalid (JsonWebTokenError)", async () => {
      req.cookies.token = "invalid-token";
      const error = new Error("Invalid token");
      error.name = "JsonWebTokenError";
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        msg: "Not authorized to access this route",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if token is expired (TokenExpiredError)", async () => {
      req.headers.authorization = "Bearer expired-token";
      const error = new Error("Token expired");
      error.name = "TokenExpiredError";
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        msg: "Not authorized to access this route",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if user no longer exists", async () => {
      req.cookies.token = "valid-token";
      jwt.verify.mockReturnValue({ id: "user-id" });
      const mockSelect = jest.fn().mockResolvedValue(null);
      User.findById.mockReturnValue({ select: mockSelect });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        msg: "The user belonging to this token no longer exists",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next() and attach user to req if token is valid and user exists", async () => {
      req.headers.authorization = "Bearer valid-token";
      const mockUser = { _id: "user-id", name: "Test User" };
      jwt.verify.mockReturnValue({ id: "user-id" });
      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findById.mockReturnValue({ select: mockSelect });

      await authenticate(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 500 if an unexpected error occurs", async () => {
      req.cookies.token = "valid-token";
      jwt.verify.mockImplementation(() => {
        throw new Error("Database error");
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        msg: "Server Error",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("requireVerified", () => {
    it("should return 401 if no user is attached", () => {
      delete req.user;
      requireVerified(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        msg: "Not authorized",
      });
    });

    it("should return 403 if user is not verified", () => {
      req.user = { isVerified: false };
      requireVerified(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        msg: "Email verification required",
      });
    });

    it("should call next if user is verified", () => {
      req.user = { isVerified: true };
      requireVerified(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("optionalAuth", () => {
    it("should attach null user if no token provided", async () => {
      await optionalAuth(req, res, next);
      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });

    it("should attach null user if token invalid", async () => {
      req.cookies.token = "invalid";
      const error = new Error("Invalid");
      error.name = "JsonWebTokenError";
      jwt.verify.mockImplementation(() => {
        throw error;
      });
      await optionalAuth(req, res, next);
      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });

    it("should attach user if token valid", async () => {
      req.cookies.token = "valid";
      const mockUser = { id: 1 };
      jwt.verify.mockReturnValue({ id: 1 });
      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findById.mockReturnValue({ select: mockSelect });
      await optionalAuth(req, res, next);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("requireOwnership", () => {
    let Model;
    beforeEach(() => {
      Model = { findById: jest.fn() };
      req.params = { id: "resource-id" };
      req.user = { id: "user-id" };
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    });

    it("should return 400 for invalid ID", async () => {
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);
      const middleware = requireOwnership(Model);
      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 if resource not found", async () => {
      Model.findById.mockResolvedValue(null);
      const middleware = requireOwnership(Model);
      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 403 if user is not owner", async () => {
      Model.findById.mockResolvedValue({ ownerId: "other-user" });
      const middleware = requireOwnership(Model);
      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("should call next and attach resource if user is owner", async () => {
      const resource = { ownerId: "user-id" };
      Model.findById.mockResolvedValue(resource);
      const middleware = requireOwnership(Model);
      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.resource).toEqual(resource);
    });
  });
});
