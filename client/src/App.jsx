import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout
import { Layout } from './components/layout/Layout';

// Pages
import { HomePage } from './pages/HomePage';
import LoginPage from './pages/Login';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import PostPage from './pages/PostPage';
import CreatePostPage from './pages/CreatePostPage';
import { EditPostPage } from './pages/EditPostPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Create a client
const queryClient = new QueryClient();

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// App component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <CssBaseline />
          <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="posts/:slug" element={<PostPage />} />

                  {/* Protected Routes */}
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="posts/new"
                    element={
                      <ProtectedRoute>
                        <CreatePostPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="posts/:slug/edit"
                    element={
                      <ProtectedRoute>
                        <EditPostPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 - Not Found */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
          </Routes>
        </SnackbarProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
