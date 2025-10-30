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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { useDebounce } from "@utils/debounceUtils";
import { useBotTemplate } from "@hooks/useBotTemplate";
import { useModule } from "@hooks/useModule";
import { useNotification } from "@context/NotificationContext";
import ConfirmDialog from "@components/ConfirmDialog";
import Modal from "@components/Modal";
import BotTemplateList from "./BotTemplateList";
import BotTemplateForm from "./BotTemplateForm";
import BotTemplateDetail from "./BotTemplateDetail";
import type {
  BotTemplate,
  BotTemplateCreate,
  BotTemplateUpdate,
} from "../../types/botTemplate.types";
import { areEqual } from "@/utils/common";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [duplicateTemplateData, setDuplicateTemplateData] = useState<
    BotTemplateUpdate | undefined
  >(undefined);

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
      if (mode === "create") {
        setDuplicateTemplateData(undefined);
        clearCurrentTemplate();
      }
      setOpenDialog(true);
    },
    [clearCurrentTemplate]
  );

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setDuplicateTemplateData(undefined);
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
          await createTemplate(formData as BotTemplateCreate);
          showNotification(t("botTemplate.notifications.createSuccess"), "success");
        } else if (dialogMode === "edit" && currentTemplate?._id) {
          await updateTemplate(currentTemplate._id, formData as BotTemplateUpdate);
          showNotification(t("botTemplate.notifications.updateSuccess"), "success");
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
      handleCloseDialog,
      t,
    ]
  );

  // Handle edit mode toggle from view mode
  const handleSwitchToEditMode = useCallback(() => {
    setDialogMode("edit");
  }, []);

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

  const handleDuplicateTemplate = useCallback(
    (template: BotTemplate) => {
      clearCurrentTemplate();
      setDuplicateTemplateData({
        name: `${template.name} Copy`,
        description: template.description,
        entry_module: template.entry_module,
        exit_module: template.exit_module,
        dca_cutloss_module: template.dca_cutloss_module,
        entry_hedge_module: template.entry_hedge_module,
        after_hedge_module: template.after_hedge_module,
        stop_loss_module: template.stop_loss_module,
        is_future: template.is_future,
      });
      setDialogMode("create");
      setOpenDialog(true);
    },
    [clearCurrentTemplate]
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
      showNotification(t("botTemplate.notifications.deleteSuccess"), "success");
      handleCloseDeleteConfirm();
    } catch (error) {
      console.error("Error deleting bot template:", error);
    }
  }, [
    confirmDelete.id,
    deleteTemplate,
    showNotification,
    handleCloseDeleteConfirm,
    t,
  ]);

  // Create form footer based on dialog mode
  const dialogTitleKey = useMemo(() => {
    switch (dialogMode) {
      case "view":
        return "botTemplate.dialog.viewTitle";
      case "edit":
        return "botTemplate.dialog.editTitle";
      default:
        return "botTemplate.dialog.createTitle";
    }
  }, [dialogMode]);

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
            const form = document.getElementById('bot-template-form') as HTMLFormElement;
            if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }} 
          variant="contained"
          disabled={isLoading}
        >
          {t("common.save")}
        </Button>
      </>
    );
  }, [dialogMode, handleCloseDialog, handleSwitchToEditMode, isLoading, t]);

  return (
    <Box>
      <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2.5, md: 3 }, mb: 3, overflow: 'hidden', borderRadius: { xs: 1.5, md: 2 } }}>
        <Grid
          container
          spacing={2}
          alignItems="center"
          wrap="wrap"
          justifyContent="space-between"
        >
          <Grid size={{ xs: 'auto', md: 'auto' }} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              {t("botTemplate.pageTitle")}
            </Typography>
          </Grid>
          <Grid size={{ xs: 'auto', md: 'auto' }} sx={{ ml: { xs: 'auto', md: 0 } }}>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog("create")}
                aria-label={t("botTemplate.create.aria")}
                sx={{
                  px: { xs: 1.25, sm: 2 },
                  minHeight: 40,
                  minWidth: { xs: 44, sm: 'auto' },
                  '& .MuiButton-startIcon': {
                    mr: { xs: 0, sm: 1 },
                  },
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  {t("botTemplate.create.button")}
                </Box>
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <TextField
          fullWidth
          variant="outlined"
          placeholder={t("botTemplate.searchPlaceholder")}
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
          onDuplicate={handleDuplicateTemplate}
        />
      </Paper>

      {/* Modal for creating, viewing or editing bot template */}
      <Modal
        open={openDialog}
        onClose={handleCloseDialog}
        title={t(dialogTitleKey)}
        maxWidth="md"
        fullScreen={isMobile}
        footer={getModalFooter()}
      >
        {dialogMode === "view" && currentTemplate ? (
          <BotTemplateDetail
            template={currentTemplate}
            isLoading={isLoading}
          />
        ) : (
          <BotTemplateForm
            initialData={
              dialogMode === "create"
                ? duplicateTemplateData
                : currentTemplate || undefined
            }
            onSubmit={handleSubmit}
            isSubmitting={isLoading}
            isEditMode={dialogMode === "edit"}
            formId="bot-template-form"
          />
        )}
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDelete.open}
        title={t("botTemplate.confirmDelete.title")}
        message={t("botTemplate.confirmDelete.message", { name: confirmDelete.name })}
        onConfirm={handleDeleteTemplate}
        onCancel={handleCloseDeleteConfirm}
      />
    </Box>
  );
};

export default memo(BotTemplate, areEqual);
