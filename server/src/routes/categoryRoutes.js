import express from "express";
import { getCategories, createCategory } from "../controllers/categoryController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getCategories);

// Protected admin routes
router.post("/", verifyToken, isAdmin, createCategory);

export default router;
