import { useState, useCallback, memo } from "react";
import { Box, Typography, Paper, Grid, Divider } from "@mui/material";
import { useUsersQuery } from "@/hooks/queries";
import { useNotification } from "@/context/NotificationContext";
import UserList from "./UserList";
import UserFilters from "./UserFilters";
import { areEqual } from "@/utils/common";
import { useTranslation } from "react-i18next";
import type { UserListParams } from "@/types/user.type";

const UserManagement = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();

  // State for filters and pagination
  const [filters, setFilters] = useState<UserListParams>({
    limit: 20,
    pagination_token: null,
    search: null,
    search_attribute: "email",
    role: null,
  });

  // Query
  const { data, isLoading } = useUsersQuery(filters);

  // Handlers
  const handleFilterChange = useCallback(
    (newFilters: Partial<UserListParams>) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
        pagination_token: null, // Reset pagination when filters change
      }));
    },
    [],
  );

  const handleNextPage = useCallback(() => {
    if (data?.pagination_token) {
      setFilters((prev) => ({
        ...prev,
        pagination_token: data.pagination_token,
      }));
    }
  }, [data?.pagination_token]);

  const handlePreviousPage = useCallback(() => {
    // Note: Cognito pagination doesn't support going back
    showNotification(
      t(
        "userManagement.notifications.paginationLimitation",
        "Previous page not supported with current API",
      ),
      "warning",
    );
  }, [showNotification, t]);

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 1.5, sm: 2.5, md: 3 },
          mb: 3,
          overflow: "hidden",
          borderRadius: { xs: 1.5, md: 2 },
        }}
      >
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Grid size={{ xs: 12 }} sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              {t("userManagement.pageTitle", "User Management")}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <UserFilters filters={filters} onFilterChange={handleFilterChange} />

        <UserList
          users={data?.users || []}
          isLoading={isLoading}
          hasNextPage={!!data?.pagination_token}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
      </Paper>
    </Box>
  );
};

export default memo(UserManagement, areEqual);
