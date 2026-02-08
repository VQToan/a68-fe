import React, { memo, useState, useCallback, useEffect } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Grid,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import type { UserListParams, UserRole } from "@/types/user.type";
import { areEqual } from "@/utils/common";
import { useTranslation } from "react-i18next";

interface UserFiltersProps {
  filters: UserListParams;
  onFilterChange: (filters: Partial<UserListParams>) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState(filters.search || "");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput || null });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onFilterChange]);

  const handleSearchAttributeChange = useCallback(
    (attribute: "email" | "given_name" | "family_name") => {
      onFilterChange({ search_attribute: attribute });
    },
    [onFilterChange],
  );

  const handleRoleChange = useCallback(
    (role: UserRole | "all") => {
      onFilterChange({ role: role === "all" ? null : role });
    },
    [onFilterChange],
  );

  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    onFilterChange({
      search: null,
      search_attribute: "email",
      role: null,
    });
  }, [onFilterChange]);

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Search Input */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t(
              "userManagement.searchPlaceholder",
              "Search users...",
            )}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Search Attribute Selector */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>
              {t("userManagement.filters.searchAttribute", "Search by")}
            </InputLabel>
            <Select
              value={filters.search_attribute || "email"}
              label={t("userManagement.filters.searchAttribute", "Search by")}
              onChange={(e) =>
                handleSearchAttributeChange(
                  e.target.value as "email" | "given_name" | "family_name",
                )
              }
            >
              <MenuItem value="email">
                {t("userManagement.searchAttributes.email", "Email")}
              </MenuItem>
              <MenuItem value="given_name">
                {t("userManagement.searchAttributes.given_name", "First name")}
              </MenuItem>
              <MenuItem value="family_name">
                {t("userManagement.searchAttributes.family_name", "Last name")}
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Role Filter */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>{t("userManagement.filters.role", "Role")}</InputLabel>
            <Select
              value={filters.role || "all"}
              label={t("userManagement.filters.role", "Role")}
              onChange={(e) =>
                handleRoleChange(e.target.value as UserRole | "all")
              }
            >
              <MenuItem value="all">
                {t("userManagement.roles.all", "All roles")}
              </MenuItem>
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
        </Grid>

        {/* Clear Filters Button */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            size="medium"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
          >
            {t("userManagement.filters.clearFilters", "Clear")}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default memo(UserFilters, areEqual);
