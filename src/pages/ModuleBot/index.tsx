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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ModuleBotList from "./ModuleBotList";
import ModuleBotForm from "./ModuleBotForm";
import type { FormMode } from "./ModuleBotForm";
import { useModule } from "@hooks/useModule";
import { useDebounce } from "@utils/debounceUtils";
import { useNotification } from "@context/NotificationContext";
import ConfirmDialog from "@components/ConfirmDialog";
import Modal from "@components/Modal";
import type { IModuleBot } from "@services/moduleBots.service";
import { areEqual } from "@/utils/common";

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
  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchTerm(value);
    },
    [setSearchTerm]
  );

  // Handle dialog open/close
  const handleOpenDialog = useCallback(
    (mode: FormMode = "create") => {
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
    },
    [setDialogMode, setDialogTitle]
  );

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    // Clear the current module when dialog closes
    clearCurrentModule();
  }, [clearCurrentModule, setOpenDialog]);

  // Handle form submission (add or update module)
  const handleSubmitModule = useCallback(
    async (formData: Omit<IModuleBot, "_id" | "created_at">) => {
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
    },
    [dialogMode, currentModule, createModule, updateModule, showNotification]
  );

  // Handle edit mode toggle from view mode
  const handleSwitchToEditMode = useCallback(() => {
    setDialogMode("edit");
    setDialogTitle("Chỉnh Sửa Module Bot");
  }, [setDialogMode, setDialogTitle]);

  // Handle view module details
  const handleViewModule = useCallback(
    async (id: string) => {
      try {
        await getModuleById(id);
        handleOpenDialog("view");
      } catch (error) {
        console.error("Error fetching module details:", error);
      }
    },
    [getModuleById, handleOpenDialog]
  );

  // Handle edit module directly
  const handleEditModule = useCallback(
    async (id: string) => {
      try {
        await getModuleById(id);
        handleOpenDialog("edit");
      } catch (error) {
        console.error("Error fetching module details:", error);
      }
    },
    [getModuleById, handleOpenDialog]
  );

  // Handle opening confirm delete dialog
  const handleOpenDeleteConfirm = useCallback(
    (id: string, name: string) => {
      setConfirmDelete({
        open: true,
        id,
        name,
      });
    },
    [setConfirmDelete]
  );

  // Handle closing confirm delete dialog
  const handleCloseDeleteConfirm = useCallback(() => {
    setConfirmDelete({
      open: false,
      id: null,
      name: "",
    });
  }, [setConfirmDelete]);

  // Handle delete module
  const handleDeleteModule = useCallback(async () => {
    if (!confirmDelete.id) return;

    try {
      await deleteModule(confirmDelete.id);
      showNotification("Module bot đã được xóa thành công", "success");
      handleCloseDeleteConfirm();
    } catch (error) {
      console.error("Error deleting module bot:", error);
    }
  }, [
    confirmDelete.id,
    deleteModule,
    handleCloseDeleteConfirm,
    showNotification,
  ]);

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
            const form = document.getElementById('module-bot-form') as HTMLFormElement;
            if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }} 
          variant="contained"
        >
          Lưu
        </Button>
      </>
    );
  }, [dialogMode, handleCloseDialog, handleSwitchToEditMode]);

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
              Quản lý Module Bot
            </Typography>
          </Grid>
          <Grid size={{ xs: "auto" }}>
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

      {/* Modal for creating, viewing or editing module */}
      <Modal
        open={openDialog}
        onClose={handleCloseDialog}
        title={dialogTitle}
        maxWidth="md"
        footer={getModalFooter()}
      >
        <ModuleBotForm
          initialData={currentModule || {}}
          onSubmit={handleSubmitModule}
          mode={dialogMode}
          formId="module-bot-form"
        />
      </Modal>

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

export default memo(ModuleBot, areEqual);
