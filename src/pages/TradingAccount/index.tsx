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
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import TradingAccountList from "./TradingAccountList";
import TradingAccountForm from "./TradingAccountForm";
import { useTradingAccount } from "@hooks/useTradingAccount";
import { useNotification } from "@context/NotificationContext";
import ConfirmDialog from "@components/ConfirmDialog";
import Modal from "@components/Modal";
import type { TradingAccountCreate, TradingAccountUpdate, TradingExchangeType } from "@/types/trading.types";
import { areEqual } from "@/utils/common";

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
  const navigate = useNavigate();
  
  // Use the trading account hook for state management
  const {
    accounts,
    currentAccount,
    pagination,
    isLoading,
    error,
    getAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    deleteAccount,
    clearError,
    clearCurrentAccount,
  } = useTradingAccount();

  // Use the notification context
  const { showNotification } = useNotification();

  // Local state for UI
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<FormMode>("create");
  const [dialogTitle, setDialogTitle] = useState("Tạo Tài Khoản Trading Mới");

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

  // Initial fetch of trading accounts
  useEffect(() => {
    fetchTradingAccounts();
  }, []);

  // Fetch trading accounts when tab changes
  useEffect(() => {
    fetchTradingAccounts();
  }, [currentTab]);

  // Fetch trading accounts with pagination parameters
  const fetchTradingAccounts = useCallback(() => {
    const filters = tabFilterMap[currentTab];
    getAccounts(currentPage, rowsPerPage, filters.exchange);
  }, [currentTab, currentPage, rowsPerPage, getAccounts]);

  // Re-fetch when pagination changes
  useEffect(() => {
    fetchTradingAccounts();
  }, [currentPage, rowsPerPage]);

  // Show error notification when error occurs
  useEffect(() => {
    if (error) {
      showNotification(error, "error");
      clearError();
    }
  }, [error, showNotification, clearError]);

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    // Note: API doesn't support search by keyword for trading accounts
    // This is just UI filtering for now
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    // Reset pagination when changing tabs
    setCurrentPage(1);
  };

  // Filter accounts based on search term if API doesn't support search
  const filteredAccounts = searchTerm
    ? accounts.filter(
        (account) =>
          account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        setDialogTitle("Tạo Tài Khoản Trading Mới");
        break;
      case "view":
        setDialogTitle("Chi Tiết Tài Khoản Trading");
        break;
      case "edit":
        setDialogTitle("Chỉnh Sửa Tài Khoản Trading");
        break;
    }

    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    // Clear the current account when dialog closes
    clearCurrentAccount();
  }, [clearCurrentAccount]);

  // Handle form submission (add or update trading account)
  const handleSubmitTradingAccount = useCallback(
    async (formData: TradingAccountCreate | TradingAccountUpdate) => {
      try {
        if (dialogMode === "create") {
          // Create new trading account
          await createAccount(formData as TradingAccountCreate);
          showNotification("Tài khoản trading đã được tạo thành công", "success");
        } else if (dialogMode === "edit" && currentAccount) {
          // Update existing trading account
          await updateAccount(currentAccount._id, formData as TradingAccountUpdate);
          showNotification("Tài khoản trading đã được cập nhật thành công", "success");
        }
        handleCloseDialog();
        // Re-fetch the list with latest data
        fetchTradingAccounts();
      } catch (error) {
        console.error("Error submitting trading account:", error);
      }
    },
    [dialogMode, currentAccount, createAccount, updateAccount, showNotification, handleCloseDialog, fetchTradingAccounts]
  );

  // Handle edit mode toggle from view mode
  const handleSwitchToEditMode = useCallback(() => {
    setDialogMode("edit");
    setDialogTitle("Chỉnh Sửa Tài Khoản Trading");
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
    async (id: string) => {
      try {
        await getAccountById(id);
        handleOpenDialog("edit");
      } catch (error) {
        console.error("Error fetching trading account details:", error);
      }
    },
    [getAccountById, handleOpenDialog]
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
      await deleteAccount(confirmDelete.id);
      showNotification("Tài khoản trading đã được xóa thành công", "success");
      handleCloseDeleteConfirm();
      // Re-fetch the list with latest data
      fetchTradingAccounts();
    } catch (error) {
      console.error("Error deleting trading account:", error);
    }
  }, [confirmDelete.id, deleteAccount, showNotification, handleCloseDeleteConfirm, fetchTradingAccounts]);

  // Handle refreshing the trading account list
  const handleRefreshTradingAccounts = useCallback(() => {
    fetchTradingAccounts();
    showNotification("Danh sách tài khoản trading đã được cập nhật", "success");
  }, [fetchTradingAccounts, showNotification]);

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
            Chỉnh sửa
          </Button>
          <Button onClick={handleCloseDialog} variant="contained">
            Đóng
          </Button>
        </>
      );
    }

    return (
      <>
        <Button onClick={handleCloseDialog} variant="outlined">
          Hủy
        </Button>
        <Button
          onClick={() => {
            const form = document.getElementById("trading-account-form") as HTMLFormElement;
            if (form) form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
          }}
          variant="contained"
          disabled={isLoading}
        >
          {dialogMode === "edit" ? "Cập nhật" : "Tạo"}
        </Button>
      </>
    );
  }, [dialogMode, handleCloseDialog, handleSwitchToEditMode, isLoading]);

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Grid size={{ xs: "auto" }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Quản lý Tài Khoản Trading
            </Typography>
          </Grid>
          <Grid size={{ xs: "auto" }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog("create")}
              >
                Tạo tài khoản mới
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="trading account tabs"
            sx={{ mb: 2 }}
          >
            <Tab label="Tất cả" value="all" />
            <Tab label="Binance" value="binance" />
            <Tab label="Bybit" value="bybit" />
            <Tab label="OKX" value="okx" />
            <Tab label="Bitget" value="bitget" />
          </Tabs>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm tài khoản trading..."
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
                <Tooltip title="Làm mới danh sách">
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
            onDelete={(id: string, name: string) => handleOpenDeleteConfirm(id, name)}
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
        title={dialogTitle}
        maxWidth="sm"
        footer={getModalFooter()}
      >
        <TradingAccountForm
          initialData={currentAccount ? {
            _id: currentAccount._id,
            account_name: currentAccount.account_name,
            exchange: currentAccount.exchange,
            chat_ids: currentAccount.chat_ids,
            api_key_masked: currentAccount.api_key_masked,
          } : undefined}
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
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa tài khoản trading "${confirmDelete.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        confirmColor="error"
        onConfirm={handleDeleteTradingAccount}
        onCancel={handleCloseDeleteConfirm}
      />
    </Box>
  );
};

export default memo(TradingAccount, areEqual);
