import { Button, Container, Typography, Box, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export function NotFoundPage() {
  return (
    <Container component="main" maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          mt: 8,
        }}
      >
        <ErrorOutlineIcon color="error" sx={{ fontSize: 80, mb: 3 }} />
        <Typography component="h1" variant="h3" gutterBottom>
          404 - Page Not Found
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph>
          Oops! The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          The page you are looking for might have been removed, had its name changed, or is
          temporarily unavailable.
        </Typography>
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 3 }}
        >
          Go to Homepage
        </Button>
      </Paper>
    </Container>
  );
};

