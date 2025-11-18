import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import '../styles/CreatePostPage.css';

const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [markdown, setMarkdown] = useState('## Start writing your content here...');
  const [isPremium, setIsPremium] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [postType, setPostType] = useState('article'); // Default post type
  const [coverImage, setCoverImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [seoScore, setSeoScore] = useState(0);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Generate slug from title
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-');
    setSlug(generatedSlug);
  }, [title]);

  useEffect(() => {
    // Fetch categories and tags
    const fetchData = async () => {
      try {
        // Try to fetch from API first
        const [categoriesRes, tagsRes] = await Promise.allSettled([
          api.get('/categories'),
          api.get('/tags')
        ]);

        // Use API data if available, otherwise use sample data
        const categoriesData = categoriesRes.status === 'fulfilled' 
          ? categoriesRes.value.data.data 
          : [
              { _id: '1', name: 'Technology', slug: 'technology' },
              { _id: '2', name: 'Programming', slug: 'programming' },
              { _id: '3', name: 'Web Development', slug: 'web-development' },
              { _id: '4', name: 'Mobile', slug: 'mobile' },
              { _id: '5', name: 'AI & Machine Learning', slug: 'ai-ml' },
              { _id: '6', name: 'DevOps', slug: 'devops' },
              { _id: '7', name: 'Cybersecurity', slug: 'cybersecurity' },
              { _id: '8', name: 'Cloud Computing', slug: 'cloud' },
              { _id: '9', name: 'Tutorials', slug: 'tutorials' },
              { _id: '10', name: 'Case Studies', slug: 'case-studies' },
              { _id: '11', name: 'Opinion', slug: 'opinion' },
              { _id: '12', name: 'Interviews', slug: 'interviews' }
            ];

        const tagsData = tagsRes.status === 'fulfilled'
          ? tagsRes.value.data.data
          : [
              // Social and Human Rights Tags
              { _id: 't1', name: 'Equality', slug: 'equality' },
              { _id: 't2', name: 'Human Rights', slug: 'human-rights' },
              { _id: 't3', name: 'Society', slug: 'society' },
              { _id: 't4', name: 'Education', slug: 'education' },
              { _id: 't5', name: 'Inclusion', slug: 'inclusion' },
              { _id: 't6', name: 'Awareness', slug: 'awareness' },
              { _id: 't7', name: 'Fairness', slug: 'fairness' }
            ];

        setCategories(categoriesData || []);
        setTags(tagsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load categories and tags. Using sample data instead.');
        
        // Fallback to sample data if API fails
        setCategories([
          { _id: '1', name: 'Social Issues', slug: 'social-issues' },
          { _id: '2', name: 'Education', slug: 'education' },
          { _id: '3', name: 'Human Rights', slug: 'human-rights' },
          { _id: '4', name: 'Society', slug: 'society' },
          { _id: '5', name: 'Inclusion', slug: 'inclusion' }
        ]);
        
        setTags([
          { _id: 't1', name: 'Equality', slug: 'equality' },
          { _id: 't2', name: 'Human Rights', slug: 'human-rights' },
          { _id: 't3', name: 'Society', slug: 'society' },
          { _id: 't4', name: 'Education', slug: 'education' },
          { _id: 't5', name: 'Inclusion', slug: 'inclusion' },
          { _id: 't6', name: 'Awareness', slug: 'awareness' },
          { _id: 't7', name: 'Fairness', slug: 'fairness' }
        ]);
      }
    };

    fetchData();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setCoverImage(file);
    }
  };
  
  const removeImage = () => {
    setCoverImage(null);
    // Reset file input
    const fileInput = document.querySelector('.file-upload-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Calculate SEO score based on content
  const calculateSeoScore = () => {
    let score = 0;
    
    // Check title length
    if (title.length >= 30 && title.length <= 60) score += 30;
    
    // Check meta description length
    if (metaDescription.length >= 120 && metaDescription.length <= 160) score += 20;
    
    // Check content length
    if (markdown.length > 300) score += 20;
    
    // Check for images
    if (coverImage) score += 10;
    
    // Check for headings
    const headingCount = (markdown.match(/^#\s/gm) || []).length;
    if (headingCount >= 2) score += 10;
    
    // Check for links
    const linkCount = (markdown.match(/\[.*?\]\(.*?\)/g) || []).length;
    if (linkCount >= 1) score += 10;
    
    return score;
  };

  // AI Content Suggestion
  const handleAISuggestion = async () => {
    if (!title) {
      toast.warning('Please enter a title first');
      return;
    }

    setIsGeneratingAI(true);
    
    try {
      const response = await axios.post('/api/ai/suggest-content', {
        title,
        currentContent: markdown,
        categories: selectedCategories,
        tags: selectedTags
      }, {
        headers: {
          'Authorization': `Bearer ${currentUser?.token}`
        }
      });
      
      setMarkdown(response.data.suggestedContent);
      toast.success('AI suggestions applied!');
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      toast.error('Failed to get AI suggestions');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Save post to draft
  const saveAsDraft = async (e) => {
    e?.preventDefault();
    if (!title) {
      toast.error('Title is required');
      return;
    }
    
    try {
      await handleSubmit(false);
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    }
  };

  const handleSubmit = async (shouldPublish = false) => {
    // Check if user is authenticated
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to save or publish posts');
      navigate('/login', { state: { from: '/create-post' } });
      return;
    }

    const seoScore = calculateSeoScore();
    setSeoScore(seoScore);
    
    // If user is trying to publish, check SEO score and get confirmation
    if (shouldPublish) {
      if (seoScore < 50) {
        const shouldProceed = window.confirm(
          `Your SEO score is low (${seoScore}/100). Are you sure you want to publish?`
        );
        if (!shouldProceed) return;
      }
      // Set the publish status based on the button clicked
      setIsPublished(true);
    }
    
    if (!title || !markdown) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      
      // Add all fields directly to formData
      formData.append('title', title);
      formData.append('slug', slug || generateSlug(title));
      formData.append('content', markdown);
      formData.append('markdown', markdown);
      formData.append('isPremium', isPremium);
      
      // Use the isPublished state for the published status
      const publishStatus = shouldPublish || isPublished;
      formData.append('published', publishStatus.toString());
      
      formData.append('metaTitle', metaTitle || title);
      formData.append('metaDescription', metaDescription || markdown.substring(0, 160));
      formData.append('postType', postType || 'article');
      
      // Add categories and tags as separate entries
      // Convert string IDs to proper format for the server
      const categoryIds = Array.isArray(selectedCategories) ? selectedCategories : [selectedCategories];
      const tagIds = Array.isArray(selectedTags) ? selectedTags : [selectedTags];
      
      // Append each category and tag as a separate form field
      categoryIds.forEach(catId => {
        if (catId) formData.append('categories', catId);
      });
      
      tagIds.forEach(tagId => {
        if (tagId) formData.append('tags', tagId);
      });
      
      // Append the cover image if it exists
      if (coverImage && coverImage instanceof File) {
        formData.append('coverImage', coverImage);
      }
      
      // Log the form data being sent
      console.log('Form data entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Get the token from auth context or storage
      const authToken = currentUser?.token || token;
      
      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${authToken}`
        },
      });

      console.log('Server response:', response.data);
      
      if (response.data.success && response.data.data) {
        const postData = response.data.data;
        toast.success(response.data.message || `Post ${shouldPublish ? 'published' : 'saved'} successfully!`);
        
        // Ensure we have a valid slug
        const postSlug = postData.slug || generateSlug(title);
        console.log('Navigating to post:', `/posts/${postSlug}`);
        navigate(`/posts/${postSlug}`);
      } else {
        throw new Error(response.data.message || 'Failed to save post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        
        if (error.response.status === 401) {
          toast.error('Your session has expired. Please log in again.');
          navigate('/login', { state: { from: '/create-post' } });
        } else if (error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error(`Error: ${error.response.status} - ${error.response.statusText}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        toast.error('No response from server. Please try again later.');
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', error.message);
        toast.error('Error setting up request. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Generate slug from title
  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  // Effect to update SEO score when content changes
  useEffect(() => {
    setSeoScore(calculateSeoScore());
  }, [title, metaDescription, markdown, coverImage]);

  // Toggle category selection
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Toggle tag selection
  const toggleTag = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Post types
  const postTypes = [
    { id: 'article', name: 'Article' },
    { id: 'tutorial', name: 'Tutorial' },
    { id: 'news', name: 'News' },
    { id: 'review', name: 'Review' },
    { id: 'case-study', name: 'Case Study' },
    { id: 'opinion', name: 'Opinion' },
    { id: 'interview', name: 'Interview' },
    { id: 'how-to', name: 'How-to Guide' }
  ];

  return (
    <div className="create-post-container">
      <div className="post-header">
        <h1>Create New Post</h1>
        <div className="seo-score">
          <span className={`score ${seoScore > 70 ? 'good' : seoScore > 40 ? 'average' : 'poor'}`}>
            SEO Score: {seoScore}%
          </span>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
          />
        </div>
      </div>

      {/* Categories and Tags Section */}
      <div className="form-row">
        <div className="form-group">
          <label>Categories</label>
          <div className="selection-container">
            {categories.length > 0 ? (
              categories.map(category => (
                <button
                  key={category._id}
                  type="button"
                  className={`selection-item ${selectedCategories.includes(category._id) ? 'selected' : ''}`}
                  onClick={() => toggleCategory(category._id)}
                >
                  {category.name}
                </button>
              ))
            ) : (
              <p className="no-items">No categories available</p>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label>Tags</label>
          <div className="selection-container">
            {tags.length > 0 ? (
              tags.map(tag => (
                <button
                  key={tag._id}
                  type="button"
                  className={`selection-item ${selectedTags.includes(tag._id) ? 'selected' : ''}`}
                  onClick={() => toggleTag(tag._id)}
                >
                  {tag.name}
                </button>
              ))
            ) : (
              <p className="no-items">No tags available</p>
            )}
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Post Type</label>
          <div className="post-type-container">
            {postTypes.map(type => (
              <label key={type.id} className={`post-type-option ${postType === type.id ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="postType"
                  value={type.id}
                  checked={postType === type.id}
                  onChange={() => setPostType(type.id)}
                  className="visually-hidden"
                />
                {type.name}
              </label>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label>Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="post-url-slug"
          />
        </div>
          
        <div className="form-group">
          <label className="premium-checkbox">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
            />
            <span>Premium Content</span>
          </label>
        </div>
      </div>

    {/* Cover Image Upload */}
    <div className="form-group">
      <label>Cover Image</label>
      <div className="image-upload-container">
        {!coverImage ? (
          <label className="file-upload-label">
            <input
              type="file"
              className="file-upload-input"
              accept="image/*"
              onChange={handleImageChange}
            />
            <div className="upload-placeholder">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                <line x1="16" y1="5" x2="22" y2="5"></line>
                <line x1="19" y1="2" x2="19" y2="8"></line>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
              </svg>
              <span>Click to upload a cover image</span>
              <small>Recommended size: 1200x630px (Max 5MB)</small>
            </div>
          </label>
        ) : (
          <div className="image-preview">
            <img 
              src={URL.createObjectURL(coverImage)} 
              alt="Preview" 
              className="preview-image"
            />
            <button 
              type="button" 
              className="remove-image-btn"
              onClick={removeImage}
              aria-label="Remove image"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>

    <div className="form-group">
      <div className="editor-header">
        <label>Content Editor (Markdown) *</label>
        <div className="ai-toolbar">
          <button 
            type="button" 
            className="ai-suggestion-btn"
            onClick={handleAISuggestion}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'AI Enhance '}
          </button>
        </div>
      </div>
      <div className="markdown-editor-container">
        <MDEditor
          value={markdown}
          onChange={setMarkdown}
          height={400}
          previewOptions={{
            rehypePlugins: [[rehypeHighlight, { ignoreMissing: true }]]
          }}
        />
      </div>
      <div className="preview-container">
        <h4>Live Preview</h4>
        <div className="preview-content">
          <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>

    <div className="form-row">
      <div className="form-group">
        <label>Categories</label>
        <div className="selection-container">
          {categories.map(category => (
            <button
              key={category._id}
              type="button"
              className={`selection-item ${selectedCategories.includes(category._id) ? 'selected' : ''}`}
              onClick={() => toggleCategory(category._id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
        
      <div className="form-group">
        <label>Tags</label>
        <div className="selection-container">
          {tags.map(tag => (
            <button
              key={tag._id}
              type="button"
              className={`selection-item ${selectedTags.includes(tag._id) ? 'selected' : ''}`}
              onClick={() => toggleTag(tag._id)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>
    </div>
      
    <div className="form-row">
      <div className="form-group">
        <label>Cover Image</label>
        <div className="file-upload">
          <label className="file-upload-label">
            {coverImage ? 'Change Image' : 'Choose Image'}
            <input 
              type="file" 
              onChange={handleImageChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </label>
          {coverImage && (
            <div className="image-preview">
              <img 
                src={URL.createObjectURL(coverImage)} 
                alt="Preview"
              />
              <button 
                type="button" 
                className="remove-image"
                onClick={() => setCoverImage(null)}
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Subscription Options */}
    <div className="subscription-options">
      <h3>Publishing Options</h3>
      <div className="form-row">
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            Publish Now
          </label>
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
            />
            Premium Content (Requires subscription)
          </label>
        </div>
      </div>
      
      {isPremium && (
        <div className="premium-options">
          <div className="form-group">
            <label>Preview Text (Free Preview)</label>
            <textarea
              value={markdown.split('\n').slice(0, 3).join('\n')}
              readOnly
              rows="4"
              className="preview-text"
            />
            <small>First few lines will be shown as preview</small>
          </div>
        </div>
      )}
    </div>

    <div className="form-actions">
      <div className="left-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={saveAsDraft}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save as Draft'}
        </button>
      </div>
      <div className="right-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={saveAsDraft}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleSubmit(true)}
          disabled={isLoading}
        >
          {isLoading ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </div>
  </div>
  );
};

export default CreatePostPage;
