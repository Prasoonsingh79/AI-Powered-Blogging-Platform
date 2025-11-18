import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";

// Import models to ensure they're registered with Mongoose
import "./models/index.js";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const rootPath = path.join(__dirname, '../..');
const publicPath = path.join(rootPath, 'public');
const serverPublicPath = path.join(__dirname, '../../server/public');

// Create necessary directories
const createDirectories = (basePath) => {
  const dirs = [
    path.join(basePath, 'uploads'),
    path.join(basePath, 'public', 'uploads'),
    path.join(basePath, 'public', 'uploads', 'posts'),
    path.join(basePath, 'server', 'public', 'uploads'),
    path.join(basePath, 'server', 'public', 'uploads', 'posts')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createDirectories(rootPath);

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Static file serving options
const staticOptions = {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
};

// Serve static files from multiple locations
app.use(express.static(publicPath, staticOptions));
app.use(express.static(serverPublicPath, staticOptions));

// Serve uploads from both locations
app.use('/uploads', express.static(path.join(publicPath, 'uploads'), staticOptions));
app.use('/uploads', express.static(path.join(serverPublicPath, 'uploads'), staticOptions));
app.use('/uploads/posts', express.static(path.join(publicPath, 'uploads', 'posts'), staticOptions));
app.use('/uploads/posts', express.static(path.join(serverPublicPath, 'uploads', 'posts'), staticOptions));

// Log static file serving configuration
console.log('Serving static files from:', publicPath);
console.log('Serving uploads from:', path.join(publicPath, 'uploads'));
console.log('Serving posts from:', path.join(publicPath, 'uploads', 'posts'));

// ✅ Connect MongoDB
connectDB();

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);

// ✅ Root Test Route
app.get("/", (req, res) => res.send("✅ Server running successfully with MongoDB Atlas"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Public directory: ${path.join(__dirname, '../../public')}`);
});
