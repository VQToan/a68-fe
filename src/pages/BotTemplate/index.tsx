import { useState, useEffect, useCallback, memo } from "react";
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { useDebounce } from "@utils/debounceUtils";
import { useBotTemplate } from "@hooks/useBotTemplate";
import { useModule } from "@hooks/useModule";
import { useNotification } from "@context/NotificationContext";
import ConfirmDialog from "@components/ConfirmDialog";
import BotTemplateList from "./BotTemplateList";
import BotTemplateForm from "./BotTemplateForm";
import BotTemplateDetail from "./BotTemplateDetail";
import type {
  BotTemplateCreate,
  BotTemplateUpdate,
} from "../../types/botTemplate.types";
import { areEqual } from "@/utils/common";

// Form mode type definition
export type FormMode = "create" | "view" | "edit";

const BotTemplate = () => {
  // Use the botTemplate hook for state management
  const {
    templates,
    isLoading,
    error,
    currentTemplate,
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    clearError,
    clearCurrentTemplate,
  } = useBotTemplate();

  // Use the module hook to fetch modules for dropdowns
  const { getModules } = useModule();

  // Use the notification context
  const { showNotification } = useNotification();

  // Theme and responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 500);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<FormMode>("create");
  const [dialogTitle, setDialogTitle] = useState("Tạo Bot Template Mới");

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

  // Initial fetch of bot templates and modules
  useEffect(() => {
    getTemplates();
    getModules();
  }, []);

  // Fetch templates when search term changes
  useEffect(() => {
    getTemplates(debouncedSearchTerm);
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
          setDialogTitle("Tạo Bot Template Mới");
          clearCurrentTemplate();
          break;
        case "view":
          setDialogTitle("Chi Tiết Bot Template");
          break;
        case "edit":
          setDialogTitle("Chỉnh Sửa Bot Template");
          break;
      }

      setOpenDialog(true);
    },
    [setDialogMode, setDialogTitle, clearCurrentTemplate]
  );

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    // Delay clearing current template to avoid UI flicker during dialog close animation
    setTimeout(() => {
      if (dialogMode === "create") {
        clearCurrentTemplate();
      }
    }, 300);
  }, [dialogMode, clearCurrentTemplate]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (formData: BotTemplateCreate | BotTemplateUpdate) => {
      try {
        if (dialogMode === "create") {
          // Create new bot template
          await createTemplate(formData as BotTemplateCreate);
          showNotification("Bot template đã được tạo thành công", "success");
        } else if (dialogMode === "edit" && currentTemplate?._id) {
          // Update existing bot template
          await updateTemplate(
            currentTemplate._id,
            formData as BotTemplateUpdate
          );
          showNotification(
            "Bot template đã được cập nhật thành công",
            "success"
          );
        }
        handleCloseDialog();
        getTemplates(debouncedSearchTerm); // Refresh the list
      } catch (error) {
        console.error("Error submitting bot template:", error);
      }
    },
    [
      dialogMode,
      currentTemplate,
      createTemplate,
      updateTemplate,
      getTemplates,
      debouncedSearchTerm,
    ]
  );

  // Handle edit mode toggle from view mode
  const handleSwitchToEditMode = useCallback(() => {
    setDialogMode("edit");
    setDialogTitle("Chỉnh Sửa Bot Template");
  }, [setDialogMode, setDialogTitle]);

  // Handle view bot template details
  const handleViewTemplate = useCallback(
    async (id: string) => {
      try {
        await getTemplateById(id);
        handleOpenDialog("view");
      } catch (error) {
        console.error("Error fetching bot template details:", error);
      }
    },
    [getTemplateById, handleOpenDialog]
  );

  // Handle edit bot template directly
  const handleEditTemplate = useCallback(
    async (id: string) => {
      try {
        await getTemplateById(id);
        handleOpenDialog("edit");
      } catch (error) {
        console.error("Error fetching bot template details:", error);
      }
    },
    [getTemplateById, handleOpenDialog]
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

  // Handle delete bot template
  const handleDeleteTemplate = useCallback(async () => {
    if (!confirmDelete.id) return;

    try {
      await deleteTemplate(confirmDelete.id);
      showNotification("Bot template đã được xóa thành công", "success");
      handleCloseDeleteConfirm();
    } catch (error) {
      console.error("Error deleting bot template:", error);
    }
  }, [
    confirmDelete.id,
    deleteTemplate,
    showNotification,
    handleCloseDeleteConfirm,
  ]);

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
              Quản lý Bot Template
            </Typography>
          </Grid>
          <Grid size={{ xs: "auto" }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog("create")}
            >
              Tạo template mới
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm template..."
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

        <BotTemplateList
          templates={templates}
          isLoading={isLoading}
          onEdit={handleEditTemplate}
          onDelete={(id, name) => handleOpenDeleteConfirm(id, name)}
          onView={handleViewTemplate}
        />
      </Paper>

      {/* Dialog for creating, viewing or editing bot template */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 1,
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
          {dialogTitle}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          {dialogMode === "view" && currentTemplate ? (
            <BotTemplateDetail
              template={currentTemplate}
              isLoading={isLoading}
              onEdit={handleSwitchToEditMode}
            />
          ) : (
            <BotTemplateForm
              initialData={currentTemplate || undefined}
              onSubmit={handleSubmit}
              isSubmitting={isLoading}
              isEditMode={dialogMode === "edit"}
              onCancel={handleCloseDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa bot template "${confirmDelete.name}"?`}
        onConfirm={handleDeleteTemplate}
        onCancel={handleCloseDeleteConfirm}
      />
    </Box>
  );
};

export default memo(BotTemplate, areEqual);
