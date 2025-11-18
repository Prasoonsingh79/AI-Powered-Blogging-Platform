import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Button,
  Paper,
  Divider,
  Chip,
  Grid,
  IconButton,
  Avatar,
  Breadcrumbs,
  Skeleton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, ArrowBack, Category, Tag, Person, CalendarToday } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { format, formatDistanceToNow } from 'date-fns';
import API from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl, onImageError } from '../utils/imageUtils';

function PostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await API.get(`/posts/${slug}`);
        if (response.data && response.data.success) {
          setPost(response.data.data);
        } else {
          setError(response.data?.message || 'Failed to load post. The post may not exist or you may not have permission to view it.');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch the post. Please try again later.';
        setError(errorMessage);
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await API.delete(`/posts/${post._id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        navigate('/');
      } catch (err) {
        console.error('Error deleting post:', err);
        setError('Failed to delete the post. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Container>
    );
  }

  if (!post) return null;

  const isAuthor = user && (user.id === post.author._id || user.role === 'admin');

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Extract just the filename from the path
    const filename = imagePath.split('/').pop();
    
    // Return the full URL to the image in the posts subdirectory
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/posts/${filename}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 2, textTransform: 'none' }}
      >
        Back to Posts
      </Button>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
        <Box
          component="img"
          sx={{
            width: '100%',
            maxHeight: '500px',
            objectFit: 'cover',
            display: 'block',
          }}
          src={post.coverImage ? getImageUrl(post.coverImage) : 'https://via.placeholder.com/800x400?text=No+Cover+Image'}
          alt={post.title}
          onError={(e) => onImageError(e, 'Cover Image Not Available')}
        />

        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, color: 'text.secondary' }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
            <Link to="/blog" style={{ textDecoration: 'none', color: 'inherit' }}>Blog</Link>
            <Typography color="text.primary">{post.title}</Typography>
          </Breadcrumbs>
        </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar 
              src={post.author?.avatar} 
              alt={post.author?.name}
              sx={{ width: 48, height: 48, mr: 2 }}
            >
              {post.author?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="medium">
                {post.author?.name || 'Unknown Author'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday fontSize="small" sx={{ mr: 0.5 }} />
                  {format(new Date(post.createdAt), 'MMMM d, yyyy')}
                </Typography>
                {post.updatedAt > post.createdAt && (
                  <Typography variant="caption" color="text.secondary">
                    (Updated {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })})
                  </Typography>
                )}
              </Box>
            </Box>
            <Box flexGrow={1} />
            {isAuthor && (
              <Box>
                <IconButton 
                  onClick={() => navigate(`/edit-post/${post.slug || post._id}`)}
                  color="primary"
                  size={isMobile ? 'small' : 'medium'}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  onClick={handleDelete}
                  color="error"
                  size={isMobile ? 'small' : 'medium'}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              mb: 3,
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
              lineHeight: 1.2
            }}
          >
            {post.title}
          </Typography>

          {(post.categories?.length > 0 || post.tags?.length > 0) && (
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {post.categories?.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  <Category fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  {post.categories.map((cat) => (
                    <Chip 
                      key={cat._id || cat} 
                      label={cat.name || cat} 
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }}
                      component={Link}
                      to={`/category/${cat.slug || cat}`}
                      clickable
                    />
                  ))}
                </Box>
              )}
              {post.tags?.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Tag fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  {post.tags.map((tag) => (
                    <Chip 
                      key={tag._id || tag} 
                      label={tag.name || tag} 
                      size="small" 
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                      component={Link}
                      to={`/tag/${typeof tag === 'string' ? tag : (tag.slug || tag._id)}`}
                      clickable
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}

        <Box sx={{ 
          '& img': { 
            maxWidth: '100%', 
            height: 'auto',
            borderRadius: 1,
            my: 2
          },
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            mt: 4,
            mb: 2,
            fontWeight: 600,
            lineHeight: 1.25
          },
          '& p': {
            mb: 2,
            lineHeight: 1.7,
            fontSize: '1.1rem',
            color: 'text.primary'
          },
          '& a': {
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          },
          '& code': {
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: 1,
            px: 0.5,
            py: 0.2,
            fontSize: '0.9em',
            fontFamily: 'monospace'
          },
          '& pre': {
            backgroundColor: '#282c34',
            borderRadius: 1,
            p: 2,
            overflowX: 'auto',
            mb: 3,
            '& code': {
              backgroundColor: 'transparent',
              color: '#abb2bf',
              p: 0
            }
          },
          '& blockquote': {
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            pl: 2,
            ml: 0,
            color: 'text.secondary',
            fontStyle: 'italic',
            mb: 2
          },
          '& ul, & ol': {
            pl: 3,
            mb: 2,
            '& li': {
              mb: 1
            }
          }
        }}>
          <ReactMarkdown 
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
              img: ({ node, ...props }) => (
                <Box 
                  component="img" 
                  {...props} 
                  sx={{ 
                    maxWidth: '100%', 
                    height: 'auto',
                    borderRadius: 1,
                    my: 2,
                    display: 'block',
                    mx: 'auto'
                  }} 
                  onError={(e) => {
                    console.error('Error loading image:', e.target.src);
                    e.target.style.display = 'none';
                  }}
                />
              )
            }}
          >
            {post.markdown || post.content}
          </ReactMarkdown>
        </Box>

        {(post.categories?.length > 0 || post.tags?.length > 0) && (
          <Box sx={{ 
            mt: 4, 
            pt: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2
          }}>
            {post.categories?.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <Category fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  Categories
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {post.categories.map((cat) => (
                    <Chip 
                      key={cat._id || cat}
                      label={cat.name || cat}
                      size="small"
                      component={Link}
                      to={`/category/${typeof cat === 'string' ? cat : (cat.slug || cat._id)}`}
                      clickable
                    />
                  ))}
                </Box>
              </Box>
            )}
            {post.tags?.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <Tag fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {post.tags.map((tag) => (
                    <Chip 
                      key={tag._id || tag}
                      label={tag.name || tag}
                      size="small"
                      variant="outlined"
                      component={Link}
                      to={`/tag/${typeof tag === 'string' ? tag : (tag.slug || tag._id)}`}
                      clickable
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ 
          mt: 4, 
          pt: 3, 
          borderTop: 1, 
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={post.author?.avatar} 
              alt={post.author?.name}
              sx={{ width: 48, height: 48, mr: 2 }}
            >
              {post.author?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="medium">
                {post.author?.name || 'Unknown Author'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Published on {format(new Date(post.createdAt), 'MMMM d, yyyy')}
              </Typography>
            </Box>
          </Box>
          
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBack />} 
              onClick={() => navigate(-1)}
              sx={{ textTransform: 'none' }}
            >
              Back to Posts
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  
  );
}

export default PostPage;
