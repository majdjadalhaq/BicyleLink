import express from "express";
import { authorizeAdmin } from "../middleware/adminMiddleware.js";
import {
  getAdminStats,
  getUsers,
  toggleUserRole,
  toggleUserBlock,
  toggleUserVerify,
  sendAdminWarning,
  getListings,
  toggleListingFeatured,
  deleteListingByAdmin,
  getAdminSentWarnings,
  updateListingByAdmin,
  getReportsByAdmin,
  updateReportStatusByAdmin,
} from "../controllers/admin.js";

const adminRouter = express.Router();

// All routes in this router require admin privileges
adminRouter.use(authorizeAdmin);

// Dashboard Stats
adminRouter.get("/stats", getAdminStats);

// User Management
adminRouter.get("/users", getUsers);
adminRouter.patch("/users/:id/role", toggleUserRole);
adminRouter.patch("/users/:id/block", toggleUserBlock);
adminRouter.patch("/users/:id/verify", toggleUserVerify);
adminRouter.post("/users/:id/warn", sendAdminWarning);
adminRouter.get("/users/:id/warnings", getAdminSentWarnings);

// Listing Moderation
adminRouter.get("/listings", getListings);
adminRouter.patch("/listings/:id/featured", toggleListingFeatured);
adminRouter.patch("/listings/:id", updateListingByAdmin);
adminRouter.delete("/listings/:id", deleteListingByAdmin);

// Report Management
adminRouter.get("/reports", getReportsByAdmin);
adminRouter.patch("/reports/:id", updateReportStatusByAdmin);

export default adminRouter;
