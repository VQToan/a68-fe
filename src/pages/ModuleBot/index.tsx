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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ModuleBotList from "./ModuleBotList";
import ModuleBotForm from "./ModuleBotForm";
import type { FormMode } from "./ModuleBotForm";
import { useModule, useDebounce } from "@hooks/useModule";
import { useNotification } from "@context/NotificationContext";
import ConfirmDialog from "@components/ConfirmDialog";
import type { IModuleBot } from "@services/moduleBots.service";

const ModuleBot = () => {
  // Use the moduleSlice through the useModule hook
  const {
    modules,
    isLoading,
    error,
    currentModule,
    getModules,
    getModuleById,
    createModule,
    updateModule,
    deleteModule,
    clearError,
    clearCurrentModule,
  } = useModule();

  // Use the notification context
  const { showNotification } = useNotification();

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<FormMode>("create");
  const [dialogTitle, setDialogTitle] = useState("Thêm Module Bot Mới");

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

  // Initial fetch
  useEffect(() => {
    getModules();
  }, []);

  // Search with debounce
  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      getModules(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

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
  };

  // Handle dialog open/close
  const handleOpenDialog = (mode: FormMode = "create") => {
    setDialogMode(mode);

    // Set dialog title based on mode
    switch (mode) {
      case "create":
        setDialogTitle("Thêm Module Bot Mới");
        break;
      case "view":
        setDialogTitle("Chi Tiết Module Bot");
        break;
      case "edit":
        setDialogTitle("Chỉnh Sửa Module Bot");
        break;
    }

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Clear the current module when dialog closes
    clearCurrentModule();
  };

  // Handle form submission (add or update module)
  const handleSubmitModule = async (
    formData: Omit<IModuleBot, "_id" | "created_at">
  ) => {
    try {
      if (dialogMode === "create") {
        // Create new module
        await createModule(formData);
        showNotification("Module bot đã được tạo thành công", "success");
      } else if (dialogMode === "edit" && currentModule) {
        // Update existing module
        await updateModule(currentModule._id, formData);
        showNotification("Module bot đã được cập nhật thành công", "success");
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error submitting module bot:", error);
    }
  };

  // Handle edit mode toggle from view mode
  const handleSwitchToEditMode = () => {
    setDialogMode("edit");
    setDialogTitle("Chỉnh Sửa Module Bot");
  };

  // Handle view module details
  const handleViewModule = async (id: string) => {
    try {
      await getModuleById(id);
      handleOpenDialog("view");
    } catch (error) {
      console.error("Error fetching module details:", error);
    }
  };

  // Handle edit module directly
  const handleEditModule = async (id: string) => {
    try {
      await getModuleById(id);
      handleOpenDialog("edit");
    } catch (error) {
      console.error("Error fetching module details:", error);
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

  // Handle delete module
  const handleDeleteModule = async () => {
    if (!confirmDelete.id) return;

    try {
      await deleteModule(confirmDelete.id);
      showNotification("Module bot đã được xóa thành công", "success");
      handleCloseDeleteConfirm();
    } catch (error) {
      console.error("Error deleting module bot:", error);
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
          <Grid item>
            <Typography variant="h5" component="h1" gutterBottom>
              Quản lý Module Bot
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog("create")}
            >
              Thêm module mới
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm module..."
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

        <ModuleBotList
          modules={modules}
          isLoading={isLoading}
          onEdit={handleEditModule}
          onDelete={(id, name) => handleOpenDeleteConfirm(id, name)}
          onView={handleViewModule}
        />
      </Paper>

      {/* Dialog for creating, viewing or editing module */}
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
          <ModuleBotForm
            initialData={currentModule || {}}
            onSubmit={handleSubmitModule}
            onCancel={handleCloseDialog}
            mode={dialogMode}
            onEdit={handleSwitchToEditMode}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa module "${confirmDelete.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        confirmColor="error"
        onConfirm={handleDeleteModule}
        onCancel={handleCloseDeleteConfirm}
      />
    </Box>
  );
};

export default ModuleBot;
