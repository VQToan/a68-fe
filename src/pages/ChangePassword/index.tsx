import { memo, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import { useAuth } from "@hooks/useAuth";
import { areEqual } from "@/utils/common";

const ChangePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    authStep,
    confirmNewPassword,
    error,
    isLoading,
    pendingUsername,
    clearError,
  } = useAuth();

  const emailFromState = (location.state as { email?: string })?.email;
  const email = emailFromState || pendingUsername || "";

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (authStep !== "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
      navigate("/login", { replace: true });
    }
  }, [authStep, navigate]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (formData.newPassword.length < 8) {
        setFormError("Password must be at least 8 characters");
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setFormError("Passwords do not match");
        return;
      }

      const result = await confirmNewPassword({
        newPassword: formData.newPassword,
      });

      if (result.meta.requestStatus === "fulfilled") {
        navigate("/dashboard", { replace: true });
      }
    },
    [confirmNewPassword, formData, navigate]
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
          <LockResetIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Set New Password
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, textAlign: "center" }}
        >
          Your account requires a new password before sign in.
          {email && (
            <>
              {" "}
              Account: <strong>{email}</strong>
            </>
          )}
        </Typography>

        {(error || formError) && (
          <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
            {formError || error}
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
            name="newPassword"
            label="New Password"
            type="password"
            id="newPassword"
            autoComplete="new-password"
            autoFocus
            value={formData.newPassword}
            onChange={handleChange}
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
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={
              isLoading || !formData.newPassword || !formData.confirmPassword
            }
          >
            {isLoading ? "Saving..." : "Set Password"}
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

export default memo(ChangePassword, areEqual);
