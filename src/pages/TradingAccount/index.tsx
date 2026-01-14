import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import TradingAccountList from "./TradingAccountList";
import TradingAccountForm from "./TradingAccountForm";
import {
  useTradingAccountsQuery,
  useTradingAccountByIdQuery,
  useCreateTradingAccountMutation,
  useUpdateTradingAccountMutation,
  useDeleteTradingAccountMutation,
} from "@hooks/queries";
import { useNotification } from "@context/NotificationContext";
import ConfirmDialog from "@components/ConfirmDialog";
import Modal from "@components/Modal";
import type {
  TradingAccountCreate,
  TradingAccountUpdate,
  TradingExchangeType,
} from "@/types/trading.types";
import { areEqual } from "@/utils/common";
import { useTranslation } from "react-i18next";
import FilterTabs from "@components/FilterTabs";

export type FormMode = "create" | "view" | "edit";

// Tab interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trading-account-tabpanel-${index}`}
      aria-labelledby={`trading-account-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

// Tab filter mapping
const tabFilterMap: Record<string, { exchange?: TradingExchangeType }> = {
  all: {},
  binance: { exchange: "binance" },
  bybit: { exchange: "bybit" },
  okx: { exchange: "okx" },
  bitget: { exchange: "bitget" },
};

const TradingAccount = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Use TanStack Query mutations
  const createMutation = useCreateTradingAccountMutation();
  const updateMutation = useUpdateTradingAccountMutation();
  const deleteMutation = useDeleteTradingAccountMutation();

  // Local state for current account being edited
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  // Fetch current account when editing
  const { data: currentAccount } = useTradingAccountByIdQuery(
    editingAccountId ?? undefined
  );

  // Use the notification context
  const { showNotification } = useNotification();

  // Local state for UI
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<FormMode>("create");
  const [dialogTitleKey, setDialogTitleKey] = useState<string>(
    "tradingAccount.dialog.createTitle"
  );

  // State for confirm delete dialog
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: string | null;
    name: string;
  }>({
    open: false,
    id: null,
    name: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);

  // Get exchange filter from current tab
  const exchangeFilter = tabFilterMap[currentTab]?.exchange;

  // Use TanStack Query for data fetching - replaces 4 useEffects!
  const {
    data: accountsData,
    isLoading,
    error,
  } = useTradingAccountsQuery(currentPage, rowsPerPage, exchangeFilter);

  // Extract data from query result
  const accounts = accountsData?.items ?? [];
  const pagination = accountsData
    ? {
        total: accountsData.total,
        page: accountsData.page,
        page_size: accountsData.page_size,
        total_pages: accountsData.total_pages,
      }
    : { total: 0, page: 1, page_size: 20, total_pages: 0 };

  // Show error notification when error occurs
  useEffect(() => {
    if (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      showNotification(errorMessage, "error");
    }
  }, [error, showNotification]);

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    // Note: API doesn't support search by keyword for trading accounts
    // This is just UI filtering for now
  };

  const handleFilterTabChange = (newValue: string) => {
    setCurrentTab(newValue);
    setCurrentPage(1);
  };

  // Filter accounts based on search term if API doesn't support search
  const filteredAccounts = searchTerm
    ? accounts.filter(
        (account) =>
          account.account_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          account.exchange.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : accounts;

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
  }, []);

  // Handle dialog open/close
  const handleOpenDialog = useCallback((mode: FormMode = "create") => {
    setDialogMode(mode);

    // Set dialog title based on mode
    switch (mode) {
      case "create":
        setDialogTitleKey("tradingAccount.dialog.createTitle");
        break;
      case "view":
        setDialogTitleKey("tradingAccount.dialog.viewTitle");
        break;
      case "edit":
        setDialogTitleKey("tradingAccount.dialog.editTitle");
        break;
    }

    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    // Clear the editing account ID when dialog closes
    setEditingAccountId(null);
  }, []);

  // Handle form submission (add or update trading account)
  const handleSubmitTradingAccount = useCallback(
    async (formData: TradingAccountCreate | TradingAccountUpdate) => {
      try {
        if (dialogMode === "create") {
          // Create new trading account
          await createMutation.mutateAsync(formData as TradingAccountCreate);
          showNotification(
            t("tradingAccount.notifications.createSuccess"),
            "success"
          );
        } else if (dialogMode === "edit" && currentAccount) {
          // Update existing trading account
          await updateMutation.mutateAsync({
            id: currentAccount._id,
            data: formData as TradingAccountUpdate,
          });
          showNotification(
            t("tradingAccount.notifications.updateSuccess"),
            "success"
          );
        }
        handleCloseDialog();
      } catch (error) {
        console.error("Error submitting trading account:", error);
      }
    },
    [
      dialogMode,
      currentAccount,
      createMutation,
      updateMutation,
      showNotification,
      handleCloseDialog,
      t,
    ]
  );

  // Handle edit mode toggle from view mode
  const handleSwitchToEditMode = useCallback(() => {
    setDialogMode("edit");
    setDialogTitleKey("tradingAccount.dialog.editTitle");
  }, []);

  // Handle view trading account
  const handleViewTradingAccount = useCallback(
    (id: string) => {
      navigate(`/trading-account/${id}`);
    },
    [navigate]
  );

  // Handle edit trading account directly
  const handleEditTradingAccount = useCallback(
    (id: string) => {
      setEditingAccountId(id);
      handleOpenDialog("edit");
    },
    [handleOpenDialog]
  );

  // Handle opening confirm delete dialog
  const handleOpenDeleteConfirm = useCallback((id: string, name: string) => {
    setConfirmDelete({
      open: true,
      id,
      name,
    });
  }, []);

  // Handle closing confirm delete dialog
  const handleCloseDeleteConfirm = useCallback(() => {
    setConfirmDelete({
      open: false,
      id: null,
      name: "",
    });
  }, []);

  // Handle delete trading account
  const handleDeleteTradingAccount = useCallback(async () => {
    if (!confirmDelete.id) return;

    try {
      await deleteMutation.mutateAsync(confirmDelete.id);
      showNotification(
        t("tradingAccount.notifications.deleteSuccess"),
        "success"
      );
      handleCloseDeleteConfirm();
    } catch (error) {
      console.error("Error deleting trading account:", error);
    }
  }, [
    confirmDelete.id,
    deleteMutation,
    showNotification,
    handleCloseDeleteConfirm,
    t,
  ]);

  // Handle refreshing the trading account list
  const { refetch } = useTradingAccountsQuery(
    currentPage,
    rowsPerPage,
    exchangeFilter
  );
  const handleRefreshTradingAccounts = useCallback(() => {
    refetch();
    showNotification(
      t("tradingAccount.notifications.refreshSuccess"),
      "success"
    );
  }, [refetch, showNotification, t]);

  // Create form footer based on dialog mode
  const getModalFooter = useCallback(() => {
    if (dialogMode === "view") {
      return (
        <>
          <Button
            onClick={handleSwitchToEditMode}
            variant="outlined"
            color="primary"
          >
            {t("common.edit")}
          </Button>
          <Button onClick={handleCloseDialog} variant="contained">
            {t("common.close")}
          </Button>
        </>
      );
    }

    return (
      <>
        <Button onClick={handleCloseDialog} variant="outlined">
          {t("common.cancel")}
        </Button>
        <Button
          onClick={() => {
            const form = document.getElementById(
              "trading-account-form"
            ) as HTMLFormElement;
            if (form)
              form.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
              );
          }}
          variant="contained"
          disabled={isLoading}
        >
          {dialogMode === "edit" ? t("common.update") : t("common.create")}
        </Button>
      </>
    );
  }, [dialogMode, handleCloseDialog, handleSwitchToEditMode, isLoading, t]);

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
          wrap="wrap"
          justifyContent="space-between"
        >
          <Grid
            size={{ xs: "auto", md: "auto" }}
            sx={{ flexGrow: 1, minWidth: 0 }}
          >
            <Typography variant="h5" component="h1" gutterBottom>
              {t("tradingAccount.pageTitle")}
            </Typography>
          </Grid>
          <Grid
            size={{ xs: "auto", md: "auto" }}
            sx={{ ml: { xs: "auto", md: 0 } }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog("create")}
                aria-label={t("tradingAccount.create.aria")}
                sx={{
                  px: { xs: 1.25, sm: 2 },
                  minHeight: 40,
                  minWidth: { xs: 44, sm: "auto" },
                  "& .MuiButton-startIcon": {
                    mr: { xs: 0, sm: 1 },
                  },
                }}
              >
                <Box
                  component="span"
                  sx={{ display: { xs: "none", sm: "inline" } }}
                >
                  {t("tradingAccount.create.button")}
                </Box>
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <FilterTabs
          ariaLabel={t("tradingAccount.tabs.ariaLabel")}
          value={currentTab}
          onChange={handleFilterTabChange}
          items={[
            { label: t("tradingAccount.tabs.all"), value: "all" },
            { label: "Binance", value: "binance" },
            { label: "Bybit", value: "bybit" },
            { label: "OKX", value: "okx" },
            { label: "Bitget", value: "bitget" },
          ]}
        />

        <TextField
          fullWidth
          variant="outlined"
          placeholder={t("tradingAccount.searchPlaceholder")}
          value={searchTerm}
          onChange={handleSearch}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={t("tradingAccount.tooltips.refreshList")}>
                  <IconButton
                    onClick={handleRefreshTradingAccounts}
                    disabled={isLoading}
                    size="small"
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />

        <TabPanel value={currentTab} index={currentTab}>
          <TradingAccountList
            accounts={filteredAccounts}
            isLoading={isLoading}
            onView={handleViewTradingAccount}
            onEdit={handleEditTradingAccount}
            onDelete={(id: string, name: string) =>
              handleOpenDeleteConfirm(id, name)
            }
            onRefresh={handleRefreshTradingAccounts}
            pagination={pagination}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </TabPanel>
      </Paper>

      {/* Modal for creating, viewing or editing trading account */}
      <Modal
        open={openDialog}
        onClose={handleCloseDialog}
        title={t(dialogTitleKey)}
        maxWidth="sm"
        footer={getModalFooter()}
      >
        <TradingAccountForm
          initialData={
            currentAccount
              ? {
                  _id: currentAccount._id,
                  account_name: currentAccount.account_name,
                  exchange: currentAccount.exchange,
                  chat_ids: currentAccount.chat_ids,
                  api_key_masked: currentAccount.api_key_masked,
                }
              : undefined
          }
          onSubmit={handleSubmitTradingAccount}
          isSubmitting={isLoading}
          isEditMode={dialogMode === "edit"}
          isViewMode={dialogMode === "view"}
          formId="trading-account-form"
        />
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDelete.open}
        title={t("tradingAccount.confirmDelete.title")}
        message={t("tradingAccount.confirmDelete.message", {
          name: confirmDelete.name,
        })}
        confirmLabel={t("common.delete")}
        confirmColor="error"
        onConfirm={handleDeleteTradingAccount}
        onCancel={handleCloseDeleteConfirm}
      />
    </Box>
  );
};

export default memo(TradingAccount, areEqual);
