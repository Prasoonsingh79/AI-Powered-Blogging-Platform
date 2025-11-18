import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
});

// Check if the model has already been compiled
export default mongoose.models.Tag || mongoose.model("Tag", tagSchema);
