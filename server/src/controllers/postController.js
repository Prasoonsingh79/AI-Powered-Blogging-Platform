import mongoose from 'mongoose';
import Post from "../models/Post.js";
import slugify from 'slugify';

// ✅ Create a new post
export const createPost = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.file);
    
    // Extract fields from form data
    const title = req.body.title || '';
    const content = req.body.content || req.body.markdown || '';
    const markdown = req.body.markdown || req.body.content || '';
    
    // Handle categories - they can come as arrays, strings, or multiple form fields
    let categories = [];
    if (Array.isArray(req.body.categories)) {
      // If it's already an array, use it directly
      categories = req.body.categories;
    } else if (req.body.categories) {
      // If it's a string, try to parse it as JSON array
      if (typeof req.body.categories === 'string') {
        try {
          // Try to parse it as JSON array first
          const parsed = JSON.parse(req.body.categories);
          categories = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // If parsing fails, treat it as a single category ID
          categories = [req.body.categories];
        }
      } else {
        // If it's some other type, convert to array
        categories = [req.body.categories];
      }
    }
    
    // Convert category IDs to ObjectId and filter out invalid ones
    categories = categories
      .filter(catId => catId && mongoose.Types.ObjectId.isValid(catId.toString().trim()))
      .map(catId => new mongoose.Types.ObjectId(catId.toString().trim()));
    
    // Handle tags - same logic as categories
    let tags = [];
    if (Array.isArray(req.body.tags)) {
      tags = req.body.tags;
    } else if (req.body.tags) {
      if (typeof req.body.tags === 'string') {
        try {
          const parsed = JSON.parse(req.body.tags);
          tags = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          tags = [req.body.tags];
        }
      } else {
        tags = [req.body.tags];
      }
    }
    
    // Convert tag IDs to ObjectId and filter out invalid ones
    tags = tags
      .filter(tagId => tagId && mongoose.Types.ObjectId.isValid(tagId.toString().trim()))
      .map(tagId => new mongoose.Types.ObjectId(tagId.toString().trim()));
    
    // Convert string 'true'/'false' to boolean
    const isPremium = req.body.isPremium === 'true' || req.body.isPremium === true;
    
    // Handle published status - ensure it's a proper boolean
    let published = false;
    if (typeof req.body.published === 'string') {
      published = req.body.published.toLowerCase() === 'true';
    } else {
      published = Boolean(req.body.published);
    }
    
    const postType = req.body.postType || 'article';
    
    console.log('Publish status:', {
      rawValue: req.body.published,
      parsedValue: published,
      type: typeof req.body.published
    });
    
    console.log('Processing post creation with:', {
      title,
      contentLength: content.length,
      markdownLength: markdown.length,
      categories,
      tags,
      isPremium,
      published,
      postType,
      hasCoverImage: !!req.file
    });
    
    // Validate required fields
    const requiredFields = { title, content, markdown };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);
      
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({ 
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    if (!title || !content || !markdown) {
      return res.status(400).json({ message: "Title, content, and markdown are required" });
    }

    const slug = slugify(title, { lower: true, strict: true });

    // Handle file upload if exists
    let coverImagePath = '';
    if (req.file) {
      // Store just the filename in the database
      // The full path will be constructed in the frontend
      coverImagePath = req.file.filename;
      
      // Log the file upload details
      console.log('File uploaded:', {
        originalname: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        storedPath: `posts/${req.file.filename}`,
        publicUrl: `/uploads/posts/${req.file.filename}`
      });
    }

    // Ensure categories and tags are arrays and filter out any empty values
    const categoriesArray = Array.isArray(categories) 
      ? categories.filter(Boolean)
      : categories 
        ? [categories].filter(Boolean)
        : [];

    const tagsArray = Array.isArray(tags)
      ? tags.filter(Boolean)
      : tags
        ? [tags].filter(Boolean)
        : [];

    console.log('Creating post with data:', {
      title,
      slug,
      content: content ? `${content.substring(0, 50)}...` : 'empty',
      markdown: markdown ? `${markdown.substring(0, 50)}...` : 'empty',
      categories: categoriesArray,
      tags: tagsArray,
      isPremium,
      coverImage: coverImagePath,
      author: req.user?.id,
      published,
      postType
    });

    const postData = {
      title,
      slug,
      content,
      markdown,
      categories: categoriesArray,
      tags: tagsArray,
      isPremium: isPremium === 'true' || isPremium === true,
      coverImage: coverImagePath,
      author: req.user?.id,
      published: published === 'true' || published === true,
      postType
    };

    const post = await Post.create(postData);
    
    // Populate the author and other fields before sending the response
    const savedPost = await Post.findById(post._id)
      .populate('author', 'name email')
      .populate('categories tags');

    res.status(201).json({
      success: true,
      message: `Post ${published ? 'published' : 'saved as draft'} successfully`,
      data: {
        ...savedPost.toObject(),
        slug: savedPost.slug || slug
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: "A post with this title already exists" 
      });
    }
    console.error('Create Post Error:', err);
    res.status(500).json({ 
      success: false,
      message: "Error creating post",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ✅ Get all published posts (filtered for non-admin users)
export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, search } = req.query;
    const query = { published: true };
    
    // Add filters if provided
    if (category) query.categories = category;
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // If user is admin, show all posts including drafts
    if (req.user?.role === 'admin') {
      delete query.published;
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("author", "name email")
      .populate("categories tags");

    const count = await Post.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Get Posts Error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching posts" 
    });
  }
};

// ✅ Get single post by slug
export const getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ 
      slug: req.params.slug,
      // Only show published posts to non-admin users
      ...(req.user?.role !== 'admin' && { published: true })
    })
    .populate("author", "name email")
    .populate("categories tags");

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: "Post not found or not published" 
      });
    }

    // Check for premium content access
    if (post.isPremium && req.user?.role !== 'admin' && !req.user?.isPremium) {
      return res.status(403).json({
        success: false,
        message: "Premium content requires subscription"
      });
    }

    // Only increment views for non-authors and non-admin
    if (post.author._id.toString() !== req.user?.id && req.user?.role !== 'admin') {
      post.views += 1;
      await post.save();
    }

    res.json({
      success: true,
      data: post
    });
  } catch (err) {
    console.error('Get Post Error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching post" 
    });
  }
};

// ✅ Update post
export const updatePost = async (req, res) => {
  try {
    const { title, content, markdown, categories, tags, isPremium, coverImage, published } = req.body;
    
    // Handle file upload if exists
    if (req.file) {
      // Store the relative path in the database (without the public directory)
      const coverImagePath = `posts/${req.file.filename}`;
      
      // Log the file upload details
      console.log('File uploaded in update:', {
        originalname: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        storedPath: coverImagePath
      });
      
      // Add the cover image path to the update data
      req.body.coverImage = coverImagePath;
    }
    
    const updateData = { 
      content, 
      markdown, 
      categories, 
      tags, 
      isPremium, 
      coverImage: req.body.coverImage || coverImage, 
      published 
    };

    // Only update slug if title changed
    if (title) {
      updateData.title = title;
      updateData.slug = slugify(title, { lower: true, strict: true });
    }

    const post = await Post.findOneAndUpdate(
      { 
        _id: req.params.id,
        // Only author or admin can update
        $or: [
          { author: req.user.id },
          { role: 'admin' }
        ]
      },
      updateData,
      { new: true, runValidators: true }
    )
    .populate("author", "name email")
    .populate("categories tags");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or you don't have permission to update it"
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (err) {
    console.error('Update Post Error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error updating post" 
    });
  }
};

// ✅ Delete post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      // Only author or admin can delete
      $or: [
        { author: req.user.id },
        { role: 'admin' }
      ]
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or you don't have permission to delete it"
      });
    }

    res.json({
      success: true,
      message: "Post deleted successfully"
    });
  } catch (err) {
    console.error('Delete Post Error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting post" 
    });
  }
};
