import { AppBar, Toolbar, Typography, Button, Box, Container, Avatar } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 1,
            }}
          >
            My Blog
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button color="inherit" component={RouterLink} to="/">
              Home
            </Button>
            
            {user ? (
              // Show these when user is logged in
              <>
                <Button color="inherit" component={RouterLink} to="/dashboard">
                  Dashboard
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                  <Avatar 
                    alt={user.name || 'User'} 
                    src={user.avatar} 
                    sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}
                  />
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {user.name || user.email.split('@')[0]}
                  </Typography>
                  <Button 
                    color="inherit" 
                    onClick={handleLogout}
                    sx={{ textTransform: 'none' }}
                  >
                    Logout
                  </Button>
                </Box>
              </>
            ) : (
              // Show these when user is not logged in
              <>
                <Button color="inherit" component={RouterLink} to="/login">
                  Login
                </Button>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/register"
                  variant="outlined"
                  sx={{ 
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.8)',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)'
                    }
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
