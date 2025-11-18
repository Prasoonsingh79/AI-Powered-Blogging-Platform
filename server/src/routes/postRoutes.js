import express from "express";
import {
  createPost,
  getPosts,
  getPostBySlug,
  updatePost,
  deletePost
} from "../controllers/postController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import upload from "../config/multer.js";

const router = express.Router();

// Create post with file upload support
router.post("/", 
  verifyToken, 
  upload.single('coverImage'), 
  createPost
);

// Update post with file upload support
router.put("/:id", 
  verifyToken, 
  upload.single('coverImage'), 
  updatePost
);

router.get("/", getPosts);
router.get("/:slug", getPostBySlug);
router.delete("/:id", verifyToken, deletePost);

export default router;
