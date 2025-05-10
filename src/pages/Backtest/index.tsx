import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  IconButton,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import BacktestList from "./BacktestList";
import BacktestForm from "./BacktestForm";
import { useBacktest } from "@hooks/useBacktest";
import { useModule } from "@hooks/useModule";
import { useNotification } from "@context/NotificationContext";
import ConfirmDialog from "@components/ConfirmDialog";
import type {
  BacktestProcess,
  BacktestStatus,
} from "@services/backtest.service";

export type FormMode = "create" | "view" | "edit";

// Tab interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`backtest-tabpanel-${index}`}
      aria-labelledby={`backtest-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

// Tab status mapping
const tabStatusMap: Record<string, BacktestStatus | undefined> = {
  all: undefined,
  pending: "pending",
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
    getProcesses,
    getProcessById,
    createProcess,
    updateProcess,
    deleteProcess,
    performAction,
    clearError,
    clearCurrentProcess,
  } = useBacktest();

  // Use the module hook to get available modules
  const { getModules, modules } = useModule();

  // Use the notification context
  const { showNotification } = useNotification();

  // Local state for UI
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<FormMode>("create");
  const [dialogTitle, setDialogTitle] = useState("Tạo Backtest Mới");

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

  // Format modules for dropdowns
  const moduleOptions = modules.map((module) => ({
    id: module._id,
    name: module.name,
  }));

  // Initial fetch of backtests and modules
  useEffect(() => {
    getProcesses(tabStatusMap[currentTab]);
    getModules();
  }, []);

  // Fetch backtests when tab changes
  useEffect(() => {
    getProcesses(tabStatusMap[currentTab]);
  }, [currentTab]);

  // Show error notification when error occurs
  useEffect(() => {
    if (error) {
      showNotification(error, "error");
      clearError();
    }
  }, [error]);

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
  };

  // Filter processes based on search term if API doesn't support search
  const filteredProcesses = searchTerm
    ? processes.filter(
        (process) =>
          process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          process.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : processes;

  // Handle dialog open/close
  const handleOpenDialog = (mode: FormMode = "create") => {
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
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Clear the current process when dialog closes
    clearCurrentProcess();
  };

  // Handle form submission (add or update backtest)
  const handleSubmitBacktest = async (
    formData: Omit<
      BacktestProcess,
      | "_id"
      | "created_at"
      | "status"
      | "progress"
      | "result_id"
      | "completed_at"
    >
  ) => {
    try {
      if (dialogMode === "create") {
        // Create new backtest
        await createProcess(formData);
        showNotification("Backtest đã được tạo thành công", "success");
      } else if (dialogMode === "edit" && currentProcess) {
        // Update existing backtest
        await updateProcess(currentProcess._id, {
          name: formData.name,
          description: formData.description,
          parameters: formData.parameters,
        });
        showNotification("Backtest đã được cập nhật thành công", "success");
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error submitting backtest:", error);
    }
  };

  // Handle edit mode toggle from view mode
  const handleSwitchToEditMode = () => {
    setDialogMode("edit");
    setDialogTitle("Chỉnh Sửa Backtest");
  };

  // Handle view backtest details
  const handleViewBacktest = async (id: string) => {
    try {
      await getProcessById(id);
      handleOpenDialog("view");
    } catch (error) {
      console.error("Error fetching backtest details:", error);
    }
  };

  // Handle edit backtest directly
  const handleEditBacktest = async (id: string) => {
    try {
      await getProcessById(id);
      handleOpenDialog("edit");
    } catch (error) {
      console.error("Error fetching backtest details:", error);
    }
  };

  // Handle opening confirm delete dialog
  const handleOpenDeleteConfirm = (id: string, name: string) => {
    setConfirmDelete({
      open: true,
      id,
      name,
    });
  };

  // Handle closing confirm delete dialog
  const handleCloseDeleteConfirm = () => {
    setConfirmDelete({
      open: false,
      id: null,
      name: "",
    });
  };

  // Handle delete backtest
  const handleDeleteBacktest = async () => {
    if (!confirmDelete.id) return;

    try {
      await deleteProcess(confirmDelete.id);
      showNotification("Backtest đã được xóa thành công", "success");
      handleCloseDeleteConfirm();
    } catch (error) {
      console.error("Error deleting backtest:", error);
    }
  };

  // Handle run backtest
  const handleRunBacktest = async (id: string) => {
    try {
      await performAction(id, "run");
      showNotification("Backtest đã được bắt đầu chạy", "success");
    } catch (error) {
      console.error("Error running backtest:", error);
    }
  };

  // Handle stop backtest
  const handleStopBacktest = async (id: string) => {
    try {
      await performAction(id, "stop");
      showNotification("Backtest đã được dừng lại", "success");
    } catch (error) {
      console.error("Error stopping backtest:", error);
    }
  };

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
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog("create")}
            >
              Tạo backtest mới
            </Button>
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
            <Tab label="Đang chờ" value="pending" />
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
          }}
        />

        <TabPanel value={currentTab} index={currentTab}>
          <BacktestList
            processes={filteredProcesses}
            isLoading={isLoading}
            onEdit={handleEditBacktest}
            onDelete={(id, name) => handleOpenDeleteConfirm(id, name)}
            onView={handleViewBacktest}
            onRun={handleRunBacktest}
            onStop={handleStopBacktest}
          />
        </TabPanel>
      </Paper>

      {/* Dialog for creating, viewing or editing backtest */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">{dialogTitle}</Typography>
          <IconButton onClick={handleCloseDialog} size="small" sx={{ p: 0.5 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 3 }}>
          <BacktestForm
            initialData={currentProcess || {}}
            onSubmit={handleSubmitBacktest}
            onCancel={handleCloseDialog}
            mode={dialogMode}
            onEdit={handleSwitchToEditMode}
            moduleOptions={moduleOptions}
          />
        </DialogContent>
      </Dialog>

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
    </Box>
  );
};

export default Backtest;
