import express from "express";
import { createReport } from "../controllers/report.js";
import { authenticate } from "../middleware/auth.js";

const reportRouter = express.Router();

// All reporting actions require the user to be logged in
reportRouter.use(authenticate);

reportRouter.post("/", createReport);

export default reportRouter;
