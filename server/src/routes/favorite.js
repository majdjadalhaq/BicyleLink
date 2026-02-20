import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getMyFavorites,
  toggleFavorite,
  getMyFavoriteIds,
} from "../controllers/favorite.js";

const favoriteRouter = express.Router();

favoriteRouter.get("/", authenticate, getMyFavorites);
favoriteRouter.get("/ids", authenticate, getMyFavoriteIds);
favoriteRouter.post("/:listingId/toggle", authenticate, toggleFavorite);

export default favoriteRouter;
