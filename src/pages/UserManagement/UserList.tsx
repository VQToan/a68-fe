import React, { memo, useState } from "react";
import {
  Box,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Button,
} from "@mui/material";
import StickyTable from "@components/StickyTable";
import { TableSkeleton } from "@components/skeletons";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import type { UserDetailResponse } from "@/types/user.type";
import { areEqual } from "@/utils/common";
import { useTranslation } from "react-i18next";
import UserDetail from "./UserDetail";

interface UserListProps {
  users: UserDetailResponse[];
  isLoading: boolean;
  hasNextPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  isLoading,
  hasNextPage,
  onNextPage,
}) => {
  const { t } = useTranslation();
  const [selectedUserSub, setSelectedUserSub] = useState<string | null>(null);

  const handleViewUser = (sub: string) => {
    setSelectedUserSub(sub);
  };

  const handleCloseDetail = () => {
    setSelectedUserSub(null);
  };

  const getRoleColor = (
    role: string,
  ): "default" | "primary" | "secondary" | "error" | "warning" | "success" => {
    switch (role) {
      case "super_admin":
        return "error";
      case "admin":
        return "warning";
      case "user":
        return "default";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return <TableSkeleton columns={7} rows={5} hasActions />;
  }

  if (users.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          {t("userManagement.list.empty", "No users found")}
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ overflow: "hidden" }}>
        <StickyTable
          height="60vh"
          minWidth={1000}
          head={
            <TableHead>
              <TableRow>
                <TableCell>
                  {t("userManagement.list.headers.email", "Email")}
                </TableCell>
                <TableCell>
                  {t("userManagement.list.headers.username", "Username")}
                </TableCell>
                <TableCell>
                  {t("userManagement.list.headers.fullName", "Full name")}
                </TableCell>
                <TableCell>
                  {t("userManagement.list.headers.role", "Role")}
                </TableCell>
                <TableCell>
                  {t(
                    "userManagement.list.headers.subscription",
                    "Subscription",
                  )}
                </TableCell>
                <TableCell>
                  {t("userManagement.list.headers.status", "Status")}
                </TableCell>
                <TableCell>
                  {t("userManagement.list.headers.actions", "Actions")}
                </TableCell>
              </TableRow>
            </TableHead>
          }
          body={
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.sub}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  hover
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {user.email || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.username || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.full_name || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(`userManagement.roles.${user.role}`, user.role)}
                      size="small"
                      color={getRoleColor(user.role)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {user.current_package ||
                          t(
                            "userManagement.list.noSubscription",
                            "No subscription",
                          )}
                      </Typography>
                      {user.subscription_end_date && (
                        <Typography variant="caption" color="text.secondary">
                          {t("userManagement.list.expiresOn", "Expires")}{" "}
                          {formatDate(user.subscription_end_date)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={
                        user.is_active ? <ToggleOnIcon /> : <ToggleOffIcon />
                      }
                      label={
                        user.is_active
                          ? t("userManagement.list.active", "Active")
                          : t("userManagement.list.inactive", "Inactive")
                      }
                      size="small"
                      color={user.is_active ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip
                      title={t("userManagement.list.tooltips.view", "View")}
                    >
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewUser(user.sub)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          }
        />

        {/* Pagination Controls */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            p: 2,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Button
            variant="outlined"
            size="small"
            endIcon={<NavigateNextIcon />}
            onClick={onNextPage}
            disabled={!hasNextPage}
          >
            {t("userManagement.list.nextPage", "Next page")}
          </Button>
        </Box>
      </Paper>

      {/* User Detail Modal */}
      <UserDetail
        userSub={selectedUserSub}
        open={!!selectedUserSub}
        onClose={handleCloseDetail}
      />
    </>
  );
};

export default memo(UserList, areEqual);
