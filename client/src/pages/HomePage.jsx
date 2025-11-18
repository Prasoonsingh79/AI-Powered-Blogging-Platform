import { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  CircularProgress, 
  CardMedia,
  Chip,
  CardActionArea,
  CardActions,
  Skeleton,
  useTheme,
  useMediaQuery,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip,
  Fab,
  ToggleButtonGroup,
  ToggleButton,
  Badge
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ArrowForward as ArrowForwardIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Article as ArticleIcon,
  VideoLibrary as VideoIcon,
  Image as ImageIcon,
  Mic as PodcastIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import API from '../api/axios';

function HomePageContent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [anchorEl, setAnchorEl] = useState(null);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const postTypes = [
    { icon: <ArticleIcon />, name: 'Article', value: 'article' },
    { icon: <VideoIcon />, name: 'Video', value: 'video' },
    { icon: <ImageIcon />, name: 'Gallery', value: 'gallery' },
    { icon: <PodcastIcon />, name: 'Podcast', value: 'podcast' },
  ];
  
  const moreOptions = [
    { name: 'Drafts', icon: <EditIcon />, action: () => navigate('/drafts') },
    { name: 'Scheduled', icon: <DashboardIcon />, action: () => navigate('/scheduled') },
  ];
  
  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    
    try {
      await API.delete(`/posts/${postToDelete._id}`);
      
      // Update the posts list by removing the deleted post
      setPosts(posts.filter(post => post._id !== postToDelete._id));
      
      enqueueSnackbar('Post deleted successfully', { variant: 'success' });
    } catch (err) {
      console.error('Error deleting post:', err);
      enqueueSnackbar('Failed to delete post', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Extract just the filename from the path
    const filename = imagePath.split('/').pop();
    if (!filename) return '';
    
    // Try both possible locations
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/posts/${filename}`;
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await API.get('/posts');
        setPosts(data.data || []);
      } catch (err) {
        setError('Failed to fetch posts. Please try again later.');
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleSpeedDialClick = (type) => {
    navigate(`/create-post?type=${type}`);
  };
  
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };
  
  const handleSortChange = (event, newSort) => {
    if (newSort !== null) {
      setSortBy(newSort);
    }
  };
  
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || post.status === filter;
    return matchesSearch && matchesFilter;
  });
  
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === 'popular') {
      return (b.views || 0) - (a.views || 0);
    }
    return 0;
  });

  const renderLoadingSkeletons = () => {
    return Array(6).fill(0).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Skeleton variant="rectangular" height={200} />
          <CardContent sx={{ flexGrow: 1 }}>
            <Skeleton width="60%" height={32} />
            <Skeleton width="100%" height={72} sx={{ mt: 1 }} />
            <Skeleton width="40%" height={24} sx={{ mt: 2 }} />
          </CardContent>
          <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
            <Skeleton width={100} height={36} />
            <Skeleton width={80} height={24} />
          </CardActions>
        </Card>
      </Grid>
    ));
  };

  if (error) {
    return (
      <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center', maxWidth: 500, p: 3 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Oops! Something went wrong
          </Typography>
          <Typography color="text.secondary" paragraph>
            We couldn't load the posts. Please check your connection and try again.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.reload()}
            startIcon={<ArrowForwardIcon />}
          >
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{
          bgcolor: theme.palette.primary.main,
          color: 'white',
          py: 10,
          mb: 6,
          backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.6
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant={isMobile ? 'h4' : 'h3'} 
            component="h1" 
            fontWeight="bold" 
            gutterBottom
            sx={{
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              lineHeight: 1.2
            }}
          >
            Welcome to Our Blog
          </Typography>
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            component="p" 
            sx={{
              maxWidth: '700px',
              mb: 4,
              opacity: 0.9,
              fontWeight: 300
            }}
          >
            Discover amazing content, stories, and insights from our community of writers and creators.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              component={RouterLink}
              to="/register"
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Get Started
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              size="large"
              component={RouterLink}
              to="/posts"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                textTransform: 'none',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Browse Articles
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete Post
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the post "{postToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Featured Posts */}
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', minHeight: '80vh' }}>
        {/* Search and Filter Bar */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2, 
          mb: 4,
          alignItems: { sm: 'center' },
          justifyContent: 'space-between'
        }}>
          <TextField
            size="small"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ 
              flex: 1, 
              maxWidth: 500,
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
                backgroundColor: theme.palette.background.paper,
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={handleFilterChange}
              size="small"
              aria-label="filter posts"
            >
              <ToggleButton value="all" aria-label="all posts">
                <Typography variant="button" sx={{ textTransform: 'none' }}>All</Typography>
              </ToggleButton>
              <ToggleButton value="published" aria-label="published">
                <Typography variant="button" sx={{ textTransform: 'none' }}>Published</Typography>
              </ToggleButton>
              <ToggleButton value="draft" aria-label="drafts">
                <Typography variant="button" sx={{ textTransform: 'none' }}>Drafts</Typography>
              </ToggleButton>
            </ToggleButtonGroup>
            
            <ToggleButtonGroup
              value={sortBy}
              exclusive
              onChange={handleSortChange}
              size="small"
              aria-label="sort posts"
            >
              <Tooltip title="Newest First">
                <ToggleButton value="newest" aria-label="newest">
                  <SortIcon fontSize="small" />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Oldest First">
                <ToggleButton value="oldest" aria-label="oldest">
                  <SortIcon fontSize="small" style={{ transform: 'scaleX(-1)' }} />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Most Popular">
                <ToggleButton value="popular" aria-label="most popular">
                  <VisibilityIcon fontSize="small" />
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
            
            <IconButton
              size="small"
              onClick={handleMenuClick}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
              }}
            >
              <MoreVertIcon />
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {moreOptions.map((option) => (
                <MenuItem key={option.name} onClick={() => {
                  option.action();
                  handleMenuClose();
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {option.icon}
                    {option.name}
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Chip 
            label="Latest Articles" 
            color="primary" 
            size="medium" 
            sx={{ 
              mb: 2, 
              px: 2, 
              py: 1, 
              fontSize: '0.8rem',
              fontWeight: 'bold',
              background: theme.palette.primary.light,
              color: 'white'
            }} 
          />
          <Typography 
            variant="h4" 
            component="h2" 
            fontWeight="bold" 
            sx={{ 
              mb: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}
          >
            Discover Our Latest Content
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ maxWidth: '700px', mx: 'auto' }}
          >
            Explore our collection of articles, tutorials, and stories written by our team of experts.
          </Typography>
        </Box>
        
        {loading ? (
          <Grid container spacing={4}>
            {renderLoadingSkeletons()}
          </Grid>
        ) : (
          <Grid container spacing={4}>
            {posts.map((post) => (
              <Grid item key={post._id} xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardActionArea component={RouterLink} to={`/posts/${post.slug}`}>
                    <Box sx={{ position: 'relative' }}>
                      {post.coverImage ? (
                        <CardMedia
                          component="img"
                          height="200"
                          image={getImageUrl(post.coverImage)}
                          alt={post.title}
                          onError={(e) => {
                            // If the first URL fails, try the fallback URL
                            const fallbackUrl = getImageUrl(post.coverImage).replace('/uploads/', '/server/public/uploads/');
                            if (e.target.src !== fallbackUrl) {
                              e.target.src = fallbackUrl;
                            }
                          }}
                          sx={{
                            width: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        />
                      ) : (
                        <Box 
                          sx={{ 
                            height: 200, 
                            bgcolor: theme.palette.grey[200],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: theme.palette.grey[400]
                          }}
                        >
                          <Typography>No Image</Typography>
                        </Box>
                      )}
                      {post.isPremium && (
                        <Chip
                          icon={<StarIcon sx={{ color: 'gold' }} />}
                          label="Premium"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            bgcolor: 'rgba(0,0,0,0.7)',
                            color: 'gold',
                            fontWeight: 'bold',
                            backdropFilter: 'blur(4px)'
                          }}
                        />
                      )}
                    </Box>
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Typography 
                          variant="caption" 
                          color="primary"
                          sx={{
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontSize: '0.7rem'
                          }}
                        >
                          {post.category || 'Uncategorized'}
                        </Typography>
                        <Box 
                          component="span" 
                          sx={{ 
                            mx: 1.5, 
                            color: theme.palette.grey[400],
                            fontSize: '0.5rem'
                          }}
                        >
                          ●
                        </Box>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          <VisibilityIcon sx={{ fontSize: '1rem', opacity: 0.7 }} />
                          {post.views || 0}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          mb: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '3.2em',
                          lineHeight: 1.3
                        }}
                      >
                        {post.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        paragraph
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 2,
                          minHeight: '4.5em'
                        }}
                      >
                        {post.summary || post.content.substring(0, 180)}...
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <CardActions sx={{ 
                    p: '0 16px 16px',
                    mt: 'auto',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      {format(new Date(post.createdAt), 'MMM d, yyyy')}
                    </Typography>
                    <Button 
                      size="small" 
                      color="primary"
                      endIcon={<ArrowForwardIcon fontSize="small" />}
                      component={RouterLink}
                      to={`/posts/${post.slug}`}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08)
                        }
                      }}
                    >
                      Read More
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {!loading && posts.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            bgcolor: theme.palette.grey[50],
            borderRadius: 2
          }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No posts found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '500px', mx: 'auto', mb: 3 }}>
              There are no published posts yet. Check back later or subscribe to get notified when new content is added.
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => window.location.reload()}
              startIcon={<ArrowForwardIcon />}
            >
              Refresh
            </Button>
          </Box>
        )}
        
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            color="primary" 
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04)
              }
            }}
          >
            View All Articles
          </Button>
        </Box>
      </Container>
      
      {/* Newsletter Section */}
      <Box 
        sx={{
          bgcolor: theme.palette.grey[50],
          py: 8,
          mt: 10,
          borderTop: `1px solid ${theme.palette.divider}`,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
            Stay Updated
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto', mb: 4 }}>
            Subscribe to our newsletter to receive the latest articles, tutorials, and updates directly to your inbox.
          </Typography>
          <Box 
            component="form" 
            sx={{
              display: 'flex',
              gap: 2,
              maxWidth: '500px',
              mx: 'auto',
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: `1px solid ${theme.palette.grey[300]}`,
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.3s ease',
                '&:focus': {
                  borderColor: theme.palette.primary.main,
                }
              }}
            />
            <Button 
              variant="contained" 
              color="primary"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '8px',
                fontWeight: 'bold',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Subscribe
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export function HomePage() {
  return (
    <AuthProvider>
      <HomePageContent />
    </AuthProvider>
  );
};

