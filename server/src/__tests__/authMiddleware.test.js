import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import { authenticate } from "../middleware/auth.js";
import User from "../models/User.js";

// Mock dependencies
jest.mock("jsonwebtoken");
jest.mock("../models/User.js");
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
