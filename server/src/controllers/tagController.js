import Tag from "../models/Tag.js";

// Get all tags
export const getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json({
      success: true,
      count: tags.length,
      data: tags
    });
  } catch (err) {
    console.error('Get Tags Error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching tags" 
    });
  }
};

// Create a new tag
export const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tag name is required"
      });
    }

    const tag = new Tag({ name });
    await tag.save();

    res.status(201).json({
      success: true,
      data: tag
    });
  } catch (err) {
    console.error('Create Tag Error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error creating tag" 
    });
  }
};
