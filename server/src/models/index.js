import mongoose from 'mongoose';
import Category from './category.js';
import Tag from './Tag.js';
import Post from './Post.js';

// Export all models
export {
  Category,
  Tag,
  Post
};

// This ensures all models are registered with Mongoose
const models = {
  Category,
  Tag,
  Post
};

export default models;
