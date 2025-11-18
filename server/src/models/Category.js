import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
});

// Check if the model has already been compiled
export default mongoose.models.Category || mongoose.model("Category", categorySchema);
