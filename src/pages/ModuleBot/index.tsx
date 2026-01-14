import { useState, useEffect, useCallback, memo, useMemo } from "react";
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
import {
  useModulesQuery,
  useModuleByIdQuery,
  useCreateModuleMutation,
  useUpdateModuleMutation,
  useDeleteModuleMutation,
} from "@hooks/queries";
import { useDebounce } from "@utils/debounceUtils";
import { useNotification } from "@context/NotificationContext";
import ConfirmDialog from "@components/ConfirmDialog";
import Modal from "@components/Modal";
import type { IModuleBot } from "@services/moduleBots.service";
import { areEqual } from "@/utils/common";
import { useTranslation } from "react-i18next";

const ModuleBot = () => {
  // Use TanStack Query mutations
  const createMutation = useCreateModuleMutation();
  const updateMutation = useUpdateModuleMutation();
  const deleteMutation = useDeleteModuleMutation();

  // Use the notification context
  const { showNotification } = useNotification();
  const { t } = useTranslation();

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<FormMode>("create");
  const [duplicateModuleData, setDuplicateModuleData] = useState<
    Partial<IModuleBot> | undefined
  >(undefined);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

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

  // Use TanStack Query for data fetching
  const {
    data: modules = [],
    isLoading,
    error,
  } = useModulesQuery(debouncedSearchTerm || undefined);

  // Fetch current module when editing/viewing
  const { data: currentModule } = useModuleByIdQuery(
    editingModuleId ?? undefined
  );

  // Show error notification when error occurs
  useEffect(() => {
    if (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      showNotification(errorMessage, "error");
    }
  }, [error, showNotification]);

  // Handle search
  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchTerm(value);
    },
    [setSearchTerm]
  );

  // Handle dialog open/close
  const handleOpenDialog = useCallback((mode: FormMode = "create") => {
    setDialogMode(mode);
    if (mode === "create") {
      setDuplicateModuleData(undefined);
      setEditingModuleId(null);
    }
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    // Clear the current module when dialog closes
    setEditingModuleId(null);
    setDuplicateModuleData(undefined);
  }, []);

  // Handle form submission (add or update module)
  const handleSubmitModule = useCallback(
    async (formData: Omit<IModuleBot, "_id" | "created_at">) => {
      try {
        if (dialogMode === "create") {
          // Create new module
          await createMutation.mutateAsync(formData);
          showNotification(
            t("moduleBot.notifications.createSuccess"),
            "success"
          );
        } else if (dialogMode === "edit" && currentModule) {
          // Update existing module
          await updateMutation.mutateAsync({
            id: currentModule._id,
            data: formData,
          });
          showNotification(
            t("moduleBot.notifications.updateSuccess"),
            "success"
          );
        }
        handleCloseDialog();
      } catch (error) {
        console.error("Error submitting module bot:", error);
      }
    },
    [
      createMutation,
      currentModule,
      dialogMode,
      handleCloseDialog,
      showNotification,
      t,
      updateMutation,
    ]
  );

  // Handle edit mode toggle from view mode
  const handleSwitchToEditMode = useCallback(() => {
    setDialogMode("edit");
  }, [setDialogMode]);

  // Handle view module details
  const handleViewModule = useCallback(
    (id: string) => {
      setEditingModuleId(id);
      handleOpenDialog("view");
    },
    [handleOpenDialog]
  );

  // Handle edit module directly
  const handleEditModule = useCallback(
    (id: string) => {
      setEditingModuleId(id);
      handleOpenDialog("edit");
    },
    [handleOpenDialog]
  );

  const handleDuplicateModule = useCallback((module: IModuleBot) => {
    setEditingModuleId(null);
    setDuplicateModuleData({
      name: `${module.name} Copy`,
      name_in_source: `${module.name_in_source}_copy`,
      description: module.description,
      type: module.type,
      is_future: module.is_future,
    });
    setDialogMode("create");
    setOpenDialog(true);
  }, []);

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
      await deleteMutation.mutateAsync(confirmDelete.id);
      showNotification(t("moduleBot.notifications.deleteSuccess"), "success");
      handleCloseDeleteConfirm();
    } catch (error) {
      console.error("Error deleting module bot:", error);
    }
  }, [
    confirmDelete.id,
    deleteMutation,
    handleCloseDeleteConfirm,
    showNotification,
    t,
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
              "module-bot-form"
            ) as HTMLFormElement;
            if (form)
              form.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
              );
          }}
          variant="contained"
        >
          {t("common.save")}
        </Button>
      </>
    );
  }, [dialogMode, handleCloseDialog, handleSwitchToEditMode, t]);

  const dialogTitleKey = useMemo(() => {
    switch (dialogMode) {
      case "view":
        return "moduleBot.dialog.viewTitle";
      case "edit":
        return "moduleBot.dialog.editTitle";
      default:
        return "moduleBot.dialog.createTitle";
    }
  }, [dialogMode]);

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
              {t("moduleBot.pageTitle")}
            </Typography>
          </Grid>
          <Grid
            size={{ xs: "auto", md: "auto" }}
            sx={{ ml: { xs: "auto", md: 0 } }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog("create")}
                aria-label={t("moduleBot.addNewAria")}
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
                  {t("moduleBot.addNew")}
                </Box>
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <TextField
          fullWidth
          variant="outlined"
          placeholder={t("moduleBot.searchPlaceholder")}
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
          onDuplicate={handleDuplicateModule}
        />
      </Paper>

      {/* Modal for creating, viewing or editing module */}
      <Modal
        open={openDialog}
        onClose={handleCloseDialog}
        title={t(dialogTitleKey)}
        maxWidth="md"
        footer={getModalFooter()}
      >
        <ModuleBotForm
          initialData={
            dialogMode === "create"
              ? duplicateModuleData || {}
              : currentModule || {}
          }
          onSubmit={handleSubmitModule}
          mode={dialogMode}
          formId="module-bot-form"
        />
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDelete.open}
        title={t("moduleBot.confirmDeleteTitle")}
        message={t("moduleBot.confirmDeleteMessage", {
          name: confirmDelete.name,
        })}
        confirmLabel={t("common.delete")}
        confirmColor="error"
        onConfirm={handleDeleteModule}
        onCancel={handleCloseDeleteConfirm}
      />
    </Box>
  );
};

export default memo(ModuleBot, areEqual);
