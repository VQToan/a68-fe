import { memo, useCallback, useState, useEffect } from "react";
import {
  useNavigate,
  useLocation,
  Link as RouterLink,
  type Location,
} from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Link,
  Paper,
  Avatar,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromLocation = (location.state as { from?: Location } | null)?.from;
  const verified = (location.state as { verified?: boolean } | null)?.verified;
  const passwordReset = (location.state as { passwordReset?: boolean } | null)
    ?.passwordReset;

  const {
    login,
    error,
    isLoading,
    requiresVerification,
    pendingUsername,
    clearError,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  // Clear error on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Show success message for verified or password reset
  useEffect(() => {
    if (verified) {
      setSuccessMessage("Email verified successfully! You can now sign in.");
    } else if (passwordReset) {
      setSuccessMessage("Password reset successfully! You can now sign in.");
    }
  }, [verified, passwordReset]);

  // Redirect to verify-email if user needs verification
  useEffect(() => {
    if (requiresVerification && pendingUsername) {
      navigate("/verify-email", { state: { email: pendingUsername } });
    }
  }, [requiresVerification, pendingUsername, navigate]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [setFormData]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        const result = await login(formData);
        if (result.meta.requestStatus === "fulfilled") {
          // Check if login requires verification
          const payload = result.payload as {
            requiresVerification?: boolean;
            email?: string;
          };
          if (payload?.requiresVerification) {
            navigate("/verify-email", { state: { email: formData.email } });
            return;
          }

          // Successful login - redirect
          const storedRedirect =
            typeof window !== "undefined"
              ? localStorage.getItem("postLoginRedirect")
              : null;
          const redirectPath =
            fromLocation &&
            fromLocation.pathname &&
            fromLocation.pathname !== "/login"
              ? `${fromLocation.pathname}${fromLocation.search ?? ""}${
                  fromLocation.hash ?? ""
                }`
              : storedRedirect && storedRedirect !== "/login"
              ? storedRedirect
              : "/dashboard";
          if (storedRedirect) {
            localStorage.removeItem("postLoginRedirect");
          }
          navigate(redirectPath, { replace: true });
        }
      } catch (error) {
        console.error("Login failed:", error);
      }
    },
    [formData, login, navigate, fromLocation]
  );

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ width: "100%", mt: 2 }}>
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
          <Grid container>
            <Grid size={6}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
              >
                Forgot password?
              </Link>
            </Grid>
            <Grid size={6} sx={{ textAlign: "right" }}>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default memo(Login);
