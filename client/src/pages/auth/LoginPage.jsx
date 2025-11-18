import { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Paper,
  Alert,
  Snackbar,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext"; // ✅ must match actual path

// ✅ Validation schema
const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function Login() {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Show success message after register redirect
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleCloseSnackbar = () => setSuccessMessage("");

  const formik = useFormik({
    initialValues: {
      email: (location.state?.email || "").trim().toLowerCase(),
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        setError("");
        setLoading(true);

        console.log("🔹 Attempting login:", {
          email: values.email,
          hasPassword: !!values.password,
        });

        // ✅ Call AuthContext login (this sends API POST to /auth/login)
        const user = await login({
          email: values.email.trim().toLowerCase(),
          password: values.password,
        });

        console.log("✅ Login success:", user);
        navigate("/dashboard"); // Redirect on success
      } catch (err) {
        console.error("❌ Login error:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });

        // ✅ Backend 401 = invalid credentials
        if (err.response) {
          const { status, data } = err.response;
          if (status === 401) {
            setError(data?.message || "Invalid email or password.");
            setFieldError("password", " ");
          } else if (status === 400) {
            setError("Please provide both email and password.");
          } else if (status >= 500) {
            setError("Server error. Please try again later.");
          } else {
            setError(data?.message || "Unexpected error occurred.");
          }
        } else if (err.request) {
          setError("Cannot reach server. Check your backend URL or network.");
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <Container component="main" maxWidth="sm">
      <Paper
        elevation={4}
        sx={{
          p: 4,
          mt: 10,
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          component="h1"
          variant="h5"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", mb: 3 }}
        >
          Sign In
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
            {successMessage}
          </Alert>
        </Snackbar>

        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          {/* Email Field */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />

          {/* Password Field */}
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />

          {/* Submit */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2, py: 1.3, fontWeight: 600 }}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Link component={RouterLink} to="/register" variant="body2">
              Don't have an account? Sign Up
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
