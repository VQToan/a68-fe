import { useState, useEffect, useCallback, memo } from "react";
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
import TradingList from "./TradingList";
import TradingForm from "./TradingForm";
import { useTradingProcess } from "@hooks/useTradingProcess";
import { useTradingAccount } from "@hooks/useTradingAccount";
import { useBotTemplate } from "@hooks/useBotTemplate";
import { useNotification } from "@context/NotificationContext";
import ConfirmDialog from "@components/ConfirmDialog";
import Modal from "@components/Modal";
import type { TradingStatusType, TradingProcessCreate, TradingProcessUpdate } from "@/types/trading.types";
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
      id={`trading-tabpanel-${index}`}
      aria-labelledby={`trading-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

// Tab status mapping
const tabStatusMap: Record<string, TradingStatusType | undefined> = {
  all: undefined,
  created: "created",
  queued: "queued", 
  running: "running",
  stopped: "stopped",
  failed: "failed",
  paused: "paused",
};

const Trading = () => {
  // Use the trading process hook for state management
  const {
    processes,
    isLoading,
    error,
    currentProcess,
    pagination,
    getProcesses,
    getProcessById,
    createProcess,
    updateProcess,
    deleteProcess,
    startProcess,
    stopProcess,
    clearError,
    clearCurrentProcess,
  } = useTradingProcess();

  // Use the trading account hook to get available accounts
  const { getAccounts } = useTradingAccount();

  // Use the bot template hook to get available templates
  const { getTemplates } = useBotTemplate();

  // Use the notification context
  const { showNotification } = useNotification();

  // Local state for UI
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<FormMode>("create");
  const [dialogTitle, setDialogTitle] = useState("Tạo Trading Process Mới");

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
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Initial fetch of trading processes, accounts, and bot templates
  useEffect(() => {
    fetchTradingProcesses();
    getAccounts();
    getTemplates();
  }, []);

  // Fetch trading processes when tab changes
  useEffect(() => {
    fetchTradingProcesses();
  }, [currentTab]);

  // Fetch trading processes with pagination parameters
  const fetchTradingProcesses = useCallback(() => {
    getProcesses(tabStatusMap[currentTab], (currentPage - 1) * rowsPerPage, rowsPerPage);
  }, [currentTab, currentPage, rowsPerPage, getProcesses]);

  // Re-fetch when pagination changes
  useEffect(() => {
    fetchTradingProcesses();
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
    // Note: API doesn't support search by keyword for trading processes
    // This is just UI filtering for now
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    // Reset pagination when changing tabs
    setCurrentPage(1);
  };

  // Filter processes based on search term if API doesn't support search
  const filteredProcesses = searchTerm
    ? processes.filter(
        (process) =>
          process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          process.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : processes;

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
        setDialogTitle("Tạo Trading Process Mới");
        break;
      case "view":
        setDialogTitle("Chi Tiết Trading Process");
        break;
      case "edit":
        setDialogTitle("Chỉnh Sửa Trading Process");
        break;
    }

    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    // Clear the current process when dialog closes
    clearCurrentProcess();
  }, [clearCurrentProcess]);

  // Handle form submission (add or update trading process)
  const handleSubmitTradingProcess = useCallback(
    async (formData: TradingProcessCreate | TradingProcessUpdate) => {
      try {
        if (dialogMode === "create") {
          // Create new trading process
          await createProcess(formData as TradingProcessCreate);
          showNotification("Trading process đã được tạo thành công", "success");
        } else if (dialogMode === "edit" && currentProcess) {
          // Update existing trading process
          await updateProcess(currentProcess._id, formData as TradingProcessUpdate);
          showNotification("Trading process đã được cập nhật thành công", "success");
        }
        handleCloseDialog();
        // Re-fetch the list with latest data
        fetchTradingProcesses();
      } catch (error) {
        console.error("Error submitting trading process:", error);
      }
    },
    [dialogMode, currentProcess, createProcess, updateProcess, showNotification, handleCloseDialog, fetchTradingProcesses]
  );

  // Handle edit mode toggle from view mode
  const handleSwitchToEditMode = useCallback(() => {
    setDialogMode("edit");
    setDialogTitle("Chỉnh Sửa Trading Process");
  }, []);

  // Handle edit trading process directly
  const handleEditTradingProcess = useCallback(
    async (id: string) => {
      try {
        await getProcessById(id);
        handleOpenDialog("edit");
      } catch (error) {
        console.error("Error fetching trading process details:", error);
      }
    },
    [getProcessById, handleOpenDialog]
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

  // Handle delete trading process
  const handleDeleteTradingProcess = useCallback(async () => {
    if (!confirmDelete.id) return;

    try {
      await deleteProcess(confirmDelete.id);
      showNotification("Trading process đã được xóa thành công", "success");
      handleCloseDeleteConfirm();
      // Re-fetch the list with latest data
      fetchTradingProcesses();
    } catch (error) {
      console.error("Error deleting trading process:", error);
    }
  }, [confirmDelete.id, deleteProcess, showNotification, handleCloseDeleteConfirm, fetchTradingProcesses]);

  // Handle start trading process
  const handleStartTradingProcess = useCallback(async (id: string) => {
    try {
      await startProcess(id);
      showNotification("Trading process đã được bắt đầu", "success");
      // Re-fetch the list with latest data
      fetchTradingProcesses();
    } catch (error) {
      console.error("Error starting trading process:", error);
    }
  }, [startProcess, showNotification, fetchTradingProcesses]);

  // Handle stop trading process
  const handleStopTradingProcess = useCallback(async (id: string) => {
    try {
      await stopProcess(id);
      showNotification("Trading process đã được dừng lại", "success");
      // Re-fetch the list with latest data
      fetchTradingProcesses();
    } catch (error) {
      console.error("Error stopping trading process:", error);
    }
  }, [stopProcess, showNotification, fetchTradingProcesses]);

  // Handle refreshing the trading process list
  const handleRefreshTradingProcesses = useCallback(() => {
    fetchTradingProcesses();
    showNotification("Danh sách trading process đã được cập nhật", "success");
  }, [fetchTradingProcesses, showNotification]);

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
            const form = document.getElementById("trading-form") as HTMLFormElement;
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
              Quản lý Trading
            </Typography>
          </Grid>
          <Grid size={{ xs: "auto" }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog("create")}
              >
                Tạo trading process mới
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="trading tabs"
            sx={{ mb: 2 }}
          >
            <Tab label="Tất cả" value="all" />
            <Tab label="Đã tạo" value="created" />
            <Tab label="Đang chờ" value="queued" />
            <Tab label="Đang chạy" value="running" />
            <Tab label="Đã dừng" value="stopped" />
            <Tab label="Thất bại" value="failed" />
            <Tab label="Tạm dừng" value="paused" />
          </Tabs>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm trading process..."
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
                    onClick={handleRefreshTradingProcesses}
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
          <TradingList
            processes={filteredProcesses}
            isLoading={isLoading}
            onEdit={handleEditTradingProcess}
            onDelete={(id: string, name: string) => handleOpenDeleteConfirm(id, name)}
            onStart={handleStartTradingProcess}
            onStop={handleStopTradingProcess}
            onRefresh={handleRefreshTradingProcesses}
            pagination={pagination}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </TabPanel>
      </Paper>

      {/* Modal for creating, viewing or editing trading process */}
      <Modal
        open={openDialog}
        onClose={handleCloseDialog}
        title={dialogTitle}
        maxWidth="sm"
        footer={getModalFooter()}
      >
        <TradingForm
          initialData={currentProcess ? {
            _id: currentProcess._id,
            name: currentProcess.name,
            description: currentProcess.description,
            parameters: currentProcess.parameters,
            bot_template_id: currentProcess.bot_template_id,
            trading_account_id: currentProcess.trading_account_id,
          } : undefined}
          onSubmit={handleSubmitTradingProcess}
          isSubmitting={isLoading}
          isEditMode={dialogMode === "edit"}
          formId="trading-form"
        />
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa trading process "${confirmDelete.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        confirmColor="error"
        onConfirm={handleDeleteTradingProcess}
        onCancel={handleCloseDeleteConfirm}
      />
    </Box>
  );
};

export default memo(Trading, areEqual);
