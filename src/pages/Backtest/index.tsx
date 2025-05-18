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
import OptimizeIcon from "@mui/icons-material/Psychology";
import BacktestList from "./BacktestList";
import BacktestForm from "./BacktestForm";
import BacktestResult from "./BacktestResult";
import RunBacktestDialog from "./components/RunBacktestDialog";
import OptimizationDialog from "./components/OptimizationDialog";
import OptimizationResults from "./components/OptimizationResults";
import { useBacktest } from "@hooks/useBacktest";
import { useModule } from "@hooks/useModule";
import { useNotification } from "@context/NotificationContext";
import ConfirmDialog from "@components/ConfirmDialog";
import Modal from "@components/Modal";
import type { BacktestStatus, BacktestProcessCreate, BacktestProcessUpdate } from "@/types/backtest.type";
import { areEqual } from "@/utils/common";

export type FormMode = "create" | "view" | "edit";

// Component state enum để quản lý hiển thị
enum BacktestView {
  LIST = 'list',
  RESULT = 'result'
}

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
      id={`backtest-tabpanel-${index}`}
      aria-labelledby={`backtest-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

// Tab status mapping
const tabStatusMap: Record<string, BacktestStatus | undefined> = {
  all: undefined,
  created: "created",
  queued: "queued",
  running: "running",
  completed: "completed",
  failed: "failed",
  stopped: "stopped",
};

const Backtest = () => {
  // Use the backtest hook for state management
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
    runProcess,
    stopProcess,
    clearError,
    clearCurrentProcess,
  } = useBacktest();

  // Use the module hook to get available modules
  const { getModules } = useModule();

  // Use the notification context
  const { showNotification } = useNotification();

  // Local state for UI
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<FormMode>("create");
  const [dialogTitle, setDialogTitle] = useState("Tạo Backtest Mới");
  
  // Thêm state để quản lý hiển thị component
  const [currentView, setCurrentView] = useState<BacktestView>(BacktestView.LIST);
  const [selectedBacktestId, setSelectedBacktestId] = useState<string | null>(null);

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

  // State for run backtest dialog
  const [runBacktestDialog, setRunBacktestDialog] = useState<{
    open: boolean;
    id: string | null;
    name: string;
  }>({
    open: false,
    id: null,
    name: "",
  });

  // State for optimization dialog and results
  const [optimizationDialog, setOptimizationDialog] = useState<{
    open: boolean;
  }>({
    open: false,
  });

  const [optimizationResultsDialog, setOptimizationResultsDialog] = useState<{
    open: boolean;
  }>({
    open: false,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Initial fetch of backtests and modules
  useEffect(() => {
    fetchBacktests();
    getModules();
  }, []);

  // Fetch backtests when tab changes
  useEffect(() => {
    fetchBacktests();
  }, [currentTab]);

  // Fetch backtests with pagination parameters
  const fetchBacktests = useCallback(() => {
    getProcesses(tabStatusMap[currentTab], (currentPage - 1) * rowsPerPage, rowsPerPage);
  }, [currentTab, currentPage, rowsPerPage, getProcesses]);

  // Re-fetch when pagination changes
  useEffect(() => {
    fetchBacktests();
  }, [currentPage, rowsPerPage, fetchBacktests]);

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
    // Note: API doesn't support search by keyword for backtests
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
        setDialogTitle("Tạo Backtest Mới");
        break;
      case "view":
        setDialogTitle("Chi Tiết Backtest");
        break;
      case "edit":
        setDialogTitle("Chỉnh Sửa Backtest");
        break;
    }

    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    // Clear the current process when dialog closes
    clearCurrentProcess();
  }, [clearCurrentProcess]);

  // Handle form submission (add or update backtest)
  const handleSubmitBacktest = useCallback(
    async (formData: BacktestProcessCreate | BacktestProcessUpdate) => {
      try {
        if (dialogMode === "create") {
          // Create new backtest
          await createProcess(formData as BacktestProcessCreate);
          showNotification("Backtest đã được tạo thành công", "success");
        } else if (dialogMode === "edit" && currentProcess) {
          // Update existing backtest
          await updateProcess(currentProcess._id, formData as BacktestProcessUpdate);
          showNotification("Backtest đã được cập nhật thành công", "success");
        }
        handleCloseDialog();
        // Re-fetch the list with latest data
        fetchBacktests();
      } catch (error) {
        console.error("Error submitting backtest:", error);
      }
    },
    [dialogMode, currentProcess, createProcess, updateProcess, showNotification, handleCloseDialog, fetchBacktests]
  );

  // Handle edit mode toggle from view mode
  const handleSwitchToEditMode = useCallback(() => {
    setDialogMode("edit");
    setDialogTitle("Chỉnh Sửa Backtest");
  }, []);

  // Hàm xử lý hiển thị kết quả backtest (thay vì navigate)
  const handleShowBacktestResult = useCallback((id: string) => {
    setSelectedBacktestId(id);
    setCurrentView(BacktestView.RESULT);
  }, []);

  // Hàm xử lý quay lại danh sách backtest từ trang kết quả
  const handleBackToList = useCallback(() => {
    setCurrentView(BacktestView.LIST);
    setSelectedBacktestId(null);
  }, []);

  // Handle edit backtest directly
  const handleEditBacktest = useCallback(
    async (id: string) => {
      try {
        await getProcessById(id);
        handleOpenDialog("edit");
      } catch (error) {
        console.error("Error fetching backtest details:", error);
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

  // Handle delete backtest
  const handleDeleteBacktest = useCallback(async () => {
    if (!confirmDelete.id) return;

    try {
      await deleteProcess(confirmDelete.id);
      showNotification("Backtest đã được xóa thành công", "success");
      handleCloseDeleteConfirm();
      // Re-fetch the list with latest data
      fetchBacktests();
    } catch (error) {
      console.error("Error deleting backtest:", error);
    }
  }, [confirmDelete.id, deleteProcess, showNotification, handleCloseDeleteConfirm, fetchBacktests]);

  // Handle stop backtest
  const handleStopBacktest = useCallback(async (id: string) => {
    try {
      await stopProcess(id);
      showNotification("Backtest đã được dừng lại", "success");
      // Re-fetch the list with latest data
      fetchBacktests();
    } catch (error) {
      console.error("Error stopping backtest:", error);
    }
  }, [stopProcess, showNotification, fetchBacktests]);

  // Handle refreshing the backtest list
  const handleRefreshBacktests = useCallback(() => {
    fetchBacktests();
    showNotification("Danh sách backtest đã được cập nhật", "success");
  }, [fetchBacktests, showNotification]);

  // Handle opening run backtest dialog
  const handleOpenRunBacktestDialog = useCallback((id: string, name: string) => {
    setRunBacktestDialog({
      open: true,
      id,
      name,
    });
  }, [setRunBacktestDialog]);

  // Handle closing run backtest dialog
  const handleCloseRunBacktestDialog = useCallback(() => {
    setRunBacktestDialog({
      open: false,
      id: null,
      name: "",
    });
  }, [setRunBacktestDialog]);

  // Handle run backtest (now opens the dialog)
  const handleRunBacktest = useCallback(async (id: string) => {
    // Find the backtest process to get its name
    const process = processes.find(p => p._id === id);
    if (process) {
      handleOpenRunBacktestDialog(id, process.name);
    }
  }, [processes, handleOpenRunBacktestDialog]);

  // Handle run backtest with date parameters
  const handleRunBacktestWithDates = useCallback(async (startDate: string, endDate: string) => {
    if (!runBacktestDialog.id) return;

    try {
      await runProcess(runBacktestDialog.id, startDate, endDate);
      showNotification("Backtest đã được bắt đầu chạy", "success");
      handleCloseRunBacktestDialog();
      // Re-fetch the list with latest data
      fetchBacktests();
    } catch (error) {
      console.error("Error running backtest:", error);
    }
  }, [runBacktestDialog.id, runProcess, showNotification, handleCloseRunBacktestDialog, fetchBacktests]);

  // Handle opening optimization dialog
  const handleOpenOptimizationDialog = useCallback(() => {
    setOptimizationDialog({
      open: true,
    });
  }, []);

  // Handle closing optimization dialog
  const handleCloseOptimizationDialog = useCallback(() => {
    setOptimizationDialog({
      open: false,
    });
  }, []);

  // Handle optimization success
  const handleOptimizationSuccess = useCallback(() => {
    setOptimizationResultsDialog({
      open: true,
    });
    // Re-fetch the list with latest data
    fetchBacktests();
  }, [fetchBacktests]);

  // Handle closing optimization results dialog
  const handleCloseOptimizationResultsDialog = useCallback(() => {
    setOptimizationResultsDialog({
      open: false,
    });
  }, []);

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
            const form = document.getElementById("backtest-form") as HTMLFormElement;
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

  // Render dựa vào currentView
  if (currentView === BacktestView.RESULT && selectedBacktestId) {
    return <BacktestResult id={selectedBacktestId} onBack={handleBackToList} />;
  }

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
              Quản lý Backtest
            </Typography>
          </Grid>
          <Grid size={{ xs: "auto" }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<OptimizeIcon />}
                onClick={handleOpenOptimizationDialog}
              >
                Tối ưu hóa với LLM
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog("create")}
              >
                Tạo backtest mới
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="backtest tabs"
            sx={{ mb: 2 }}
          >
            <Tab label="Tất cả" value="all" />
            <Tab label="Đang chờ" value="created" />
            <Tab label="Đang chạy" value="running" />
            <Tab label="Hoàn thành" value="completed" />
            <Tab label="Thất bại" value="failed" />
            <Tab label="Đã dừng" value="stopped" />
          </Tabs>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm backtest..."
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
                    onClick={handleRefreshBacktests}
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
          <BacktestList
            processes={filteredProcesses}
            isLoading={isLoading}
            onEdit={handleEditBacktest}
            onDelete={(id, name) => handleOpenDeleteConfirm(id, name)}
            onView={handleShowBacktestResult}
            onRun={handleRunBacktest}
            onStop={handleStopBacktest}
            onRefresh={handleRefreshBacktests}
            pagination={pagination}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </TabPanel>
      </Paper>

      {/* Modal for creating, viewing or editing backtest */}
      <Modal
        open={openDialog}
        onClose={handleCloseDialog}
        title={dialogTitle}
        maxWidth="sm"
        footer={getModalFooter()}
      >
        <BacktestForm
          initialData={currentProcess ? {
            _id: currentProcess._id,
            name: currentProcess.name,
            description: currentProcess.description,
            parameters: currentProcess.parameters,
            bot_template_id: currentProcess.bot_template_id
          } : undefined}
          onSubmit={handleSubmitBacktest}
          isSubmitting={isLoading}
          isEditMode={dialogMode === "edit"}
          formId="backtest-form"
        />
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa backtest "${confirmDelete.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        confirmColor="error"
        onConfirm={handleDeleteBacktest}
        onCancel={handleCloseDeleteConfirm}
      />

      {/* Run Backtest Dialog */}
      <RunBacktestDialog
        open={runBacktestDialog.open}
        onClose={handleCloseRunBacktestDialog}
        onConfirm={handleRunBacktestWithDates}
        isLoading={isLoading}
        backtestName={runBacktestDialog.name}
      />

      {/* Optimization Dialog */}
      <OptimizationDialog
        open={optimizationDialog.open}
        onClose={handleCloseOptimizationDialog}
        backtestProcesses={processes}
        onSuccess={handleOptimizationSuccess}
      />

      {/* Optimization Results Dialog */}
      <OptimizationResults
        open={optimizationResultsDialog.open}
        onClose={handleCloseOptimizationResultsDialog}
      />
    </Box>
  );
};

export default memo(Backtest, areEqual);
