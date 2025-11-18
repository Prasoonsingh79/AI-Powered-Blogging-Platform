import Category from "../models/Category.js";

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    console.error('Get Categories Error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching categories" 
    });
  }
};

// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const category = new Category({ name });
    await category.save();

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (err) {
    console.error('Create Category Error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error creating category" 
    });
  }
};
