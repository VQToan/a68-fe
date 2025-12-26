import { memo, useCallback, useState, useEffect } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Avatar,
  Alert,
  Link,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import { useAuth } from "@hooks/useAuth";
import { areEqual } from "@/utils/common";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    confirmPasswordReset,
    error,
    isLoading,
    pendingUsername,
    clearError,
  } = useAuth();

  // Get email from location state or pendingUsername
  const emailFromState = (location.state as { email?: string })?.email;
  const email = emailFromState || pendingUsername || "";

  const [formData, setFormData] = useState({
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({
    password: "",
    confirmPassword: "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  // Clear error on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      if (name === "code") {
        // Only allow digits, max 6 characters
        const codeValue = value.replace(/\D/g, "").slice(0, 6);
        setFormData((prev) => ({ ...prev, [name]: codeValue }));
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: value }));

      // Password validation
      if (name === "newPassword") {
        if (value.length < 8) {
          setFormErrors((prev) => ({
            ...prev,
            password: "Password must be at least 8 characters",
          }));
        } else {
          setFormErrors((prev) => ({ ...prev, password: "" }));
        }
      }

      // Confirm password validation
      if (name === "confirmPassword" || name === "newPassword") {
        if (name === "confirmPassword" && value !== formData.newPassword) {
          setFormErrors((prev) => ({
            ...prev,
            confirmPassword: "Passwords do not match",
          }));
        } else if (
          name === "newPassword" &&
          value !== formData.confirmPassword &&
          formData.confirmPassword
        ) {
          setFormErrors((prev) => ({
            ...prev,
            confirmPassword: "Passwords do not match",
          }));
        } else if (
          name === "confirmPassword" &&
          value === formData.newPassword
        ) {
          setFormErrors((prev) => ({ ...prev, confirmPassword: "" }));
        }
      }
    },
    [formData.newPassword, formData.confirmPassword]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (formErrors.password || formErrors.confirmPassword) {
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setFormErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
        return;
      }

      if (!email || formData.code.length !== 6) return;

      try {
        const result = await confirmPasswordReset({
          email,
          code: formData.code,
          newPassword: formData.newPassword,
        });
        if (result.meta.requestStatus === "fulfilled") {
          setSuccessMessage(
            "Password reset successful! Redirecting to login..."
          );
          setTimeout(() => {
            navigate("/login", { state: { passwordReset: true } });
          }, 2000);
        }
      } catch (error) {
        console.error("Password reset failed:", error);
      }
    },
    [email, formData, formErrors, confirmPasswordReset, navigate]
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
        <Avatar sx={{ m: 1, bgcolor: "success.main" }}>
          <LockResetIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, textAlign: "center" }}
        >
          Enter the code sent to <strong>{email}</strong> and your new password.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ width: "100%", mt: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mt: 3, width: "100%" }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="code"
            label="Reset Code"
            name="code"
            autoComplete="one-time-code"
            autoFocus
            value={formData.code}
            onChange={handleChange}
            inputProps={{
              maxLength: 6,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            placeholder="Enter 6-digit code"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label="New Password"
            type="password"
            id="newPassword"
            autoComplete="new-password"
            value={formData.newPassword}
            onChange={handleChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={
              isLoading ||
              formData.code.length !== 6 ||
              !formData.newPassword ||
              !formData.confirmPassword ||
              !!formErrors.password ||
              !!formErrors.confirmPassword
            }
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Back to Sign In
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default memo(ResetPassword, areEqual);
