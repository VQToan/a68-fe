import { memo, useCallback, useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, error, isLoading, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Clear error on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!email) return;

      try {
        const result = await forgotPassword(email);
        if (result.meta.requestStatus === "fulfilled") {
          setSuccessMessage("Reset code sent! Redirecting...");
          setTimeout(() => {
            navigate("/reset-password", { state: { email } });
          }, 1500);
        }
      } catch (error) {
        console.error("Forgot password failed:", error);
      }
    },
    [email, forgotPassword, navigate]
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
        <Avatar sx={{ m: 1, bgcolor: "warning.main" }}>
          <LockResetIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, textAlign: "center" }}
        >
          Enter your email address and we'll send you a code to reset your
          password.
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
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            type="email"
            value={email}
            onChange={handleEmailChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading || !email}
          >
            {isLoading ? "Sending..." : "Send Reset Code"}
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

export default memo(ForgotPassword, areEqual);
