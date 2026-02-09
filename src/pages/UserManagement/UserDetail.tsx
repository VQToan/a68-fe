import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Divider,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { formatDate } from "@/utils/common";
import { useTranslation } from "react-i18next";
import {
  useUserDetailQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
} from "@/hooks/queries";
import type { UserRole } from "@/types/user.type";
import { useNotification } from "@/context/NotificationContext";
import { useAuth } from "@/hooks/useAuth";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import SubscriptionPackageManager from "@/components/SubscriptionPackageManager";

interface UserDetailProps {
  userSub: string | null;
  open: boolean;
  onClose: () => void;
}

const UserDetail: React.FC<UserDetailProps> = ({ userSub, open, onClose }) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const { cognitoUser } = useAuth();
  const updateRoleMutation = useUpdateUserRoleMutation();
  const updateStatusMutation = useUpdateUserStatusMutation();

  const { data: user, isLoading } = useUserDetailQuery(userSub);

  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [confirmRoleChange, setConfirmRoleChange] = useState(false);
  const [confirmStatusChange, setConfirmStatusChange] = useState(false);

  const isSuperAdmin = cognitoUser?.role === "super_admin";
  const isAdmin = cognitoUser?.role === "admin" || isSuperAdmin;

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleRoleChange = useCallback((role: UserRole) => {
    setSelectedRole(role);
    setConfirmRoleChange(true);
  }, []);

  const handleConfirmRoleChange = useCallback(async () => {
    if (!user) return;
    try {
      await updateRoleMutation.mutateAsync({
        sub: user.sub,
        data: { role: selectedRole },
      });
      showNotification(
        t(
          "userManagement.notifications.roleUpdateSuccess",
          "User role updated successfully",
        ),
        "success",
      );
      setConfirmRoleChange(false);
    } catch (error) {
      showNotification(
        t(
          "userManagement.notifications.roleUpdateFailed",
          "Failed to update user role",
        ),
        "error",
      );
      console.error(error);
      // Revert role selection
      if (user) setSelectedRole(user.role);
    }
  }, [user, selectedRole, updateRoleMutation, showNotification, t]);

  const handleToggleStatus = useCallback(() => {
    setConfirmStatusChange(true);
  }, []);

  const handleConfirmStatusChange = useCallback(async () => {
    if (!user) return;
    try {
      await updateStatusMutation.mutateAsync({
        sub: user.sub,
        data: { enabled: !user.is_active },
      });
      showNotification(
        t(
          "userManagement.notifications.statusUpdateSuccess",
          "User status updated successfully",
        ),
        "success",
      );
      setConfirmStatusChange(false);
    } catch (error) {
      showNotification(
        t(
          "userManagement.notifications.statusUpdateFailed",
          "Failed to update user status",
        ),
        "error",
      );
      console.error(error);
    }
  }, [user, updateStatusMutation, showNotification, t]);

  const renderFooter = () => (
    <Button onClick={onClose} variant="outlined" color="inherit">
      {t("common.close", "Close")}
    </Button>
  );

  if (isLoading || !user) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title={t("userManagement.detail.title", "User Details")}
        maxWidth="md"
      >
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={t("userManagement.detail.title", "User Details")}
        maxWidth="md"
        footer={renderFooter()}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ flexGrow: 1 }}>
            {/* Basic Information */}
            <Typography variant="h6" gutterBottom>
              {t("userManagement.detail.sections.basic", "Basic Information")}
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("userManagement.detail.fields.email", "Email")}
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ mt: 0.5 }}>
                  {user.email || "-"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("userManagement.detail.fields.username", "Username")}
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ mt: 0.5 }}>
                  {user.username || "-"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("userManagement.detail.fields.givenName", "First name")}
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ mt: 0.5 }}>
                  {user.given_name || "-"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("userManagement.detail.fields.familyName", "Last name")}
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ mt: 0.5 }}>
                  {user.family_name || "-"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("userManagement.detail.fields.fullName", "Full name")}
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ mt: 0.5 }}>
                  {user.full_name || "-"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("userManagement.detail.fields.sub", "User ID")}
                </Typography>
                <Typography
                  variant="body2"
                  gutterBottom
                  sx={{ mt: 0.5, wordBreak: "break-all" }}
                >
                  {user.sub}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Role & Status */}
            <Typography variant="h6" gutterBottom>
              {t("userManagement.detail.sections.roleStatus", "Role & Status")}
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small" disabled={!isSuperAdmin}>
                  <InputLabel>
                    {t("userManagement.detail.fields.role", "Role")}
                  </InputLabel>
                  <Select
                    value={selectedRole}
                    label={t("userManagement.detail.fields.role", "Role")}
                    onChange={(e) =>
                      handleRoleChange(e.target.value as UserRole)
                    }
                  >
                    <MenuItem value="user">
                      {t("userManagement.roles.user", "User")}
                    </MenuItem>
                    <MenuItem value="admin">
                      {t("userManagement.roles.admin", "Admin")}
                    </MenuItem>
                    <MenuItem value="super_admin">
                      {t("userManagement.roles.super_admin", "Super Admin")}
                    </MenuItem>
                  </Select>
                </FormControl>
                {!isSuperAdmin && (
                  <Typography variant="caption" color="text.secondary">
                    {t(
                      "userManagement.detail.onlySuperAdmin",
                      "Only super admins can change roles",
                    )}
                  </Typography>
                )}
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("userManagement.detail.fields.isActive", "Active status")}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={user.is_active}
                        onChange={handleToggleStatus}
                        color="success"
                      />
                    }
                    label={
                      user.is_active
                        ? t("common.active", "Active")
                        : t("common.inactive", "Inactive")
                    }
                  />
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Subscription Information */}
            <Typography variant="h6" gutterBottom>
              {t(
                "userManagement.detail.sections.subscription",
                "Subscription Information",
              )}
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t(
                    "userManagement.detail.fields.currentPackage",
                    "Current package",
                  )}
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ mt: 0.5 }}>
                  {user.current_package ||
                    t("userManagement.list.noSubscription", "No subscription")}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t(
                    "userManagement.detail.fields.subscriptionEndDate",
                    "Subscription end date",
                  )}
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ mt: 0.5 }}>
                  {user.subscription_end_date
                    ? formatDate(user.subscription_end_date)
                    : "-"}
                </Typography>
              </Grid>
            </Grid>

            {/* Subscription Package Management */}
            <SubscriptionPackageManager
              userSub={user.sub}
              userEmail={user.email || ""}
              canManageSubscription={isAdmin}
            />
          </Box>
        </Box>
      </Modal>

      {/* Confirm Role Change Dialog */}
      <ConfirmDialog
        open={confirmRoleChange}
        title={t("userManagement.confirmUpdateRole.title", "Update User Role")}
        message={t("userManagement.confirmUpdateRole.message", {
          email: user.email,
          role: t(`userManagement.roles.${selectedRole}`, selectedRole),
          defaultValue:
            "Are you sure you want to change {{email}}'s role to {{role}}?",
        })}
        onConfirm={handleConfirmRoleChange}
        onCancel={() => {
          setConfirmRoleChange(false);
          setSelectedRole(user.role);
        }}
      />

      {/* Confirm Status Change Dialog */}
      <ConfirmDialog
        open={confirmStatusChange}
        title={t(
          "userManagement.confirmToggleStatus.title",
          "Toggle User Status",
        )}
        message={
          user.is_active
            ? t("userManagement.confirmToggleStatus.messageDisable", {
                email: user.email,
                defaultValue: "Are you sure you want to deactivate {{email}}?",
              })
            : t("userManagement.confirmToggleStatus.messageEnable", {
                email: user.email,
                defaultValue: "Are you sure you want to activate {{email}}?",
              })
        }
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setConfirmStatusChange(false)}
      />
    </>
  );
};

export default UserDetail;
