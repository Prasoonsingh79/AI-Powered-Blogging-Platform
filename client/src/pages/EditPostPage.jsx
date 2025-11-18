import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  Switch,
  Divider,
} from '@mui/material';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import API from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  content: Yup.string().required('Content is required'),
  categories: Yup.array().min(1, 'Select at least one category'),
  tags: Yup.array(),
  isPremium: Yup.boolean(),
  coverImage: Yup.string().url('Must be a valid URL'),
});

export function EditPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [categories, setCategories] = useState([
    // Technology & Programming
    { _id: 'web-dev', name: 'Web Development', slug: 'web-development' },
    { _id: 'mobile-dev', name: 'Mobile Development', slug: 'mobile-development' },
    { _id: 'ai', name: 'Artificial Intelligence', slug: 'artificial-intelligence' },
    { _id: 'cyber', name: 'Cybersecurity', slug: 'cybersecurity' },
    { _id: 'cloud', name: 'Cloud Computing', slug: 'cloud-computing' },
    { _id: 'blockchain', name: 'Blockchain', slug: 'blockchain' },
    
    // Business & Finance
    { _id: 'startups', name: 'Startups', slug: 'startups' },
    { _id: 'entrepreneurship', name: 'Entrepreneurship', slug: 'entrepreneurship' },
    { _id: 'marketing', name: 'Digital Marketing', slug: 'digital-marketing' },
    { _id: 'finance', name: 'Finance & Investing', slug: 'finance-investing' },
    
    // Lifestyle & Personal Development
    { _id: 'productivity', name: 'Productivity', slug: 'productivity' },
    { _id: 'mental-health', name: 'Mental Health', slug: 'mental-health' },
    { _id: 'career', name: 'Career Development', slug: 'career-development' },
    { _id: 'travel', name: 'Travel', slug: 'travel' },
  ]);

  const [tags, setTags] = useState([
    // Programming Languages
    { _id: 'js', name: 'JavaScript', slug: 'javascript' },
    { _id: 'ts', name: 'TypeScript', slug: 'typescript' },
    { _id: 'py', name: 'Python', slug: 'python' },
    
    // Web Technologies
    { _id: 'react', name: 'React', slug: 'react' },
    { _id: 'vue', name: 'Vue', slug: 'vue' },
    { _id: 'angular', name: 'Angular', slug: 'angular' },
    { _id: 'node', name: 'Node.js', slug: 'nodejs' },
    
    // Mobile Development
    { _id: 'react-native', name: 'React Native', slug: 'react-native' },
    { _id: 'flutter', name: 'Flutter', slug: 'flutter' },
    
    // AI & Data Science
    { _id: 'ml', name: 'Machine Learning', slug: 'machine-learning' },
    { _id: 'data-science', name: 'Data Science', slug: 'data-science' },
    
    // Design & UX
    { _id: 'ui', name: 'UI/UX Design', slug: 'ui-ux-design' },
    { _id: 'figma', name: 'Figma', slug: 'figma' },
    
    // Career
    { _id: 'career-advice', name: 'Career Advice', slug: 'career-advice' },
    { _id: 'remote', name: 'Remote Work', slug: 'remote-work' },
  ]);
  
  const [searchCategory, setSearchCategory] = useState('');
  const [searchTag, setSearchTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isEditMode = !!slug;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('Fetching categories and tags...');
        // Fetch categories and tags
        const [categoriesRes, tagsRes] = await Promise.all([
          API.get('/categories').catch(err => {
            console.error('Error fetching categories:', err);
            return { data: { data: [], success: false, error: err.message } };
          }),
          API.get('/tags').catch(err => {
            console.error('Error fetching tags:', err);
            return { data: { data: [], success: false, error: err.message } };
          })
        ]);
        
        console.log('Categories response:', categoriesRes);
        console.log('Tags response:', tagsRes);
        
        // Handle categories
        if (categoriesRes.data?.success) {
          const categoriesData = Array.isArray(categoriesRes.data.data) 
            ? categoriesRes.data.data 
            : [];
          console.log('Setting categories:', categoriesData);
          setCategories(categoriesData);
        } else {
          console.error('Failed to load categories:', categoriesRes.data?.error || 'Unknown error');
          setCategories([]);
        }
        
        // Handle tags
        if (tagsRes.data?.success) {
          const tagsData = Array.isArray(tagsRes.data.data) 
            ? tagsRes.data.data 
            : [];
          console.log('Setting tags:', tagsData);
          setTags(tagsData);
        } else {
          console.error('Failed to load tags:', tagsRes.data?.error || 'Unknown error');
          setTags([]);
        }

        // If in edit mode, fetch the post data using the slug
        if (isEditMode) {
          console.log('Fetching post with slug:', slug);
          try {
            const response = await API.get(`/posts/${slug}`);
            console.log('Post data received:', response.data);
            
            if (!response.data || !response.data.data) {
              throw new Error('Invalid post data received');
            }
            
            const data = response.data;
            if (!data || !data.data) {
              throw new Error('Invalid post data received');
            }
            
            const post = data.data;
            
            // Set form values
            const formValues = {
              title: post.title || '',
              content: post.content || '',
              markdown: post.markdown || '',
              categories: Array.isArray(post.categories) ? post.categories.map(c => c._id || c) : [],
              tags: Array.isArray(post.tags) ? post.tags.map(t => t._id || t) : [],
              isPremium: Boolean(post.isPremium),
              coverImage: post.coverImage || '',
            };
            
            console.log('Setting form values:', formValues);
            formik.setValues(formValues);

            // Set editor content if markdown exists
            if (post.markdown) {
              try {
                const contentBlock = htmlToDraft(post.markdown);
                if (contentBlock) {
                  const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                  setEditorState(EditorState.createWithContent(contentState));
                }
              } catch (e) {
                console.error('Error setting editor content:', e);
                // Continue with empty editor if there's an error
              }
            }
          } catch (postErr) {
            console.error('Error fetching post:', postErr);
            throw new Error(`Failed to load post: ${postErr.message}`);
          }
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(err.message || 'Failed to load necessary data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, isEditMode]);

  const formik = useFormik({
    initialValues: {
      title: '',
      content: '',
      markdown: '',
      categories: [],
      tags: [],
      isPremium: false,
      coverImage: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const postData = {
          ...values,
          markdown: draftToHtml(convertToRaw(editorState.getCurrentContent())),
        };

        if (isEditMode) {
          await API.put(`/posts/${id}`, postData, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
        } else {
          await API.post('/posts', postData, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
        }
        
        navigate('/dashboard');
      } catch (err) {
        console.error('Error saving post:', err);
        setError('Failed to save the post. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
    const content = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    formik.setFieldValue('content', content);
  };

  if (loading && !isEditMode) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? 'Edit Post' : 'Create New Post'}
        </Typography>

        {error && (
          <Box color="error.main" mb={3}>
            {error}
          </Box>
        )}

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="title"
            name="title"
            label="Post Title"
            value={formik.values.title}
            onChange={formik.handleChange}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
            margin="normal"
            required
          />

          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Content
            </Typography>
            <Box
              sx={{
                border: '1px solid rgba(0, 0, 0, 0.23)',
                borderRadius: 1,
                p: 1,
                minHeight: '300px',
                '& .rdw-editor-toolbar': {
                  mb: 1,
                  border: 'none',
                  borderBottom: '1px solid #f1f1f1',
                },
                '& .rdw-editor-main': {
                  minHeight: '200px',
                  p: 1,
                },
              }}
            >
              <Editor
                editorState={editorState}
                onEditorStateChange={onEditorStateChange}
                toolbar={{
                  options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'history'],
                  inline: { inDropdown: true },
                  list: { inDropdown: true },
                  textAlign: { inDropdown: true },
                  link: { inDropdown: true },
                }}
              />
            </Box>
            {formik.touched.content && formik.errors.content && (
              <Typography color="error" variant="caption">
                {formik.errors.content}
              </Typography>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Categories</InputLabel>
                <Select
                  multiple
                  name="categories"
                  value={formik.values.categories}
                  onChange={formik.handleChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const category = categories.find((c) => c._id === value);
                        return category ? (
                          <Chip 
                            key={value} 
                            label={category.name} 
                            size="small"
                            onDelete={() => {
                              formik.setFieldValue(
                                'categories',
                                formik.values.categories.filter(id => id !== value)
                              );
                            }}
                          />
                        ) : null;
                      })}
                    </Box>
                  )}
                >
                  <Box sx={{ p: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search categories..."
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Box>
                  {categories
                    .filter(category => 
                      category.name.toLowerCase().includes(searchCategory.toLowerCase()) ||
                      category.slug.toLowerCase().includes(searchCategory.toLowerCase())
                    )
                    .map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        <Checkbox checked={formik.values.categories.includes(category._id)} />
                        <ListItemText primary={category.name} />
                      </MenuItem>
                  ))}
                </Select>
                {formik.touched.categories && formik.errors.categories && (
                  <Typography color="error" variant="caption">
                    {formik.errors.categories}
                  </Typography>
                )}
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Tags</InputLabel>
                <Select
                  multiple
                  name="tags"
                  value={formik.values.tags}
                  onChange={formik.handleChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const tag = tags.find((t) => t._id === value);
                        return tag ? (
                          <Chip 
                            key={value} 
                            label={tag.name} 
                            size="small" 
                            variant="outlined"
                            onDelete={() => {
                              formik.setFieldValue(
                                'tags',
                                formik.values.tags.filter(id => id !== value)
                              );
                            }}
                          />
                        ) : null;
                      })}
                    </Box>
                  )}
                >
                  <Box sx={{ p: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search tags..."
                      value={searchTag}
                      onChange={(e) => setSearchTag(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Box>
                  {tags
                    .filter(tag => 
                      tag.name.toLowerCase().includes(searchTag.toLowerCase()) ||
                      tag.slug.toLowerCase().includes(searchTag.toLowerCase())
                    )
                    .map((tag) => (
                      <MenuItem key={tag._id} value={tag._id}>
                        <Checkbox checked={formik.values.tags.includes(tag._id)} />
                        <ListItemText primary={tag.name} />
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                id="coverImage"
                name="coverImage"
                label="Cover Image URL"
                value={formik.values.coverImage}
                onChange={formik.handleChange}
                error={formik.touched.coverImage && Boolean(formik.errors.coverImage)}
                helperText={formik.touched.coverImage && formik.errors.coverImage}
              />

              {formik.values.coverImage && (
                <Box mt={2} mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Cover Image Preview:
                  </Typography>
                  <img
                    src={formik.values.coverImage}
                    alt="Cover preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x400?text=Image+not+found';
                    }}
                  />
                </Box>
              )}

              <FormGroup sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.isPremium}
                      onChange={formik.handleChange}
                      name="isPremium"
                    />
                  }
                  label="Premium Content"
                />
              </FormGroup>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(isEditMode ? `/posts/${id}` : '/dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {isEditMode ? 'Update Post' : 'Create Post'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

