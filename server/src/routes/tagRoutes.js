import express from "express";
import { getTags, createTag } from "../controllers/tagController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getTags);

// Protected admin routes
router.post("/", verifyToken, isAdmin, createTag);

export default router;
