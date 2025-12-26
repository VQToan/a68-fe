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
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { useAuth } from "@hooks/useAuth";
import { areEqual } from "@/utils/common";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    confirmSignUp,
    resendVerificationCode,
    error,
    isLoading,
    pendingUsername,
    clearError,
  } = useAuth();

  // Get email from location state or pendingUsername
  const emailFromState = (location.state as { email?: string })?.email;
  const email = emailFromState || pendingUsername || "";

  const [code, setCode] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Clear error on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Only allow digits, max 6 characters
      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
      setCode(value);
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!email || code.length !== 6) return;

      try {
        const result = await confirmSignUp({ email, code });
        if (result.meta.requestStatus === "fulfilled") {
          setSuccessMessage(
            "Email verified successfully! Redirecting to login..."
          );
          setTimeout(() => {
            navigate("/login", { state: { verified: true } });
          }, 2000);
        }
      } catch (error) {
        console.error("Verification failed:", error);
      }
    },
    [email, code, confirmSignUp, navigate]
  );

  const handleResendCode = useCallback(async () => {
    if (!email || countdown > 0) return;

    try {
      const result = await resendVerificationCode(email);
      if (result.meta.requestStatus === "fulfilled") {
        setSuccessMessage("Verification code sent! Please check your email.");
        setCountdown(60); // 60 seconds cooldown
        setTimeout(() => setSuccessMessage(""), 5000);
      }
    } catch (error) {
      console.error("Failed to resend code:", error);
    }
  }, [email, countdown, resendVerificationCode]);

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
        <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
          <MarkEmailReadIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Verify Your Email
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, textAlign: "center" }}
        >
          We've sent a verification code to <strong>{email}</strong>
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
            label="Verification Code"
            name="code"
            autoComplete="one-time-code"
            autoFocus
            value={code}
            onChange={handleCodeChange}
            inputProps={{
              maxLength: 6,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            placeholder="Enter 6-digit code"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Didn't receive the code?{" "}
              {countdown > 0 ? (
                <span>Resend in {countdown}s</span>
              ) : (
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={handleResendCode}
                  disabled={isLoading}
                >
                  Resend Code
                </Link>
              )}
            </Typography>
          </Box>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Back to Sign In
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default memo(VerifyEmail, areEqual);
