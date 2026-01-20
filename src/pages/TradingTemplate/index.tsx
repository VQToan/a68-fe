import { useState, useCallback, memo } from "react";
import { Box, Typography, Paper, Grid, Divider } from "@mui/material";
import {
  useAllTradingTemplatesQuery,
  useToggleTemplateActiveMutation,
  useDeleteTemplateMutation,
} from "@/hooks/queries";
import { useNotification } from "@/context/NotificationContext";
import ConfirmDialog from "@/components/ConfirmDialog";
import TradingTemplateList from "./TradingTemplateList";
import TradingTemplateDetail from "./TradingTemplateDetail";
import { areEqual } from "@/utils/common";
import { useTranslation } from "react-i18next";

const TradingTemplate = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();

  // State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: string | null;
    name: string;
  }>({
    open: false,
    id: null,
    name: "",
  });

  // Queries & Mutations
  const { data: templates = [], isLoading } = useAllTradingTemplatesQuery();
  const toggleMutation = useToggleTemplateActiveMutation();
  const deleteMutation = useDeleteTemplateMutation();

  // Handlers
  const handleToggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        await toggleMutation.mutateAsync({ id, data: { is_active: isActive } });
        showNotification(
          t(
            "tradingTemplate.notifications.updateSuccess",
            "Template status updated",
          ),
          "success",
        );
      } catch (error) {
        showNotification(
          t(
            "tradingTemplate.notifications.updateFailed",
            "Failed to update status",
          ),
          "error",
        );
        console.error(error);
      }
    },
    [toggleMutation, showNotification, t],
  );

  const handleOpenDelete = useCallback((id: string, name: string) => {
    setConfirmDelete({ open: true, id, name });
  }, []);

  const handleCloseDelete = useCallback(() => {
    setConfirmDelete({ open: false, id: null, name: "" });
  }, []);

  const handleDelete = useCallback(async () => {
    if (!confirmDelete.id) return;
    try {
      await deleteMutation.mutateAsync(confirmDelete.id);
      showNotification(
        t(
          "tradingTemplate.notifications.deleteSuccess",
          "Template deleted successfully",
        ),
        "success",
      );
      handleCloseDelete();
    } catch (error) {
      showNotification(
        t(
          "tradingTemplate.notifications.deleteFailed",
          "Failed to delete template",
        ),
        "error",
      );
      console.error(error);
    }
  }, [
    confirmDelete.id,
    deleteMutation,
    showNotification,
    handleCloseDelete,
    t,
  ]);

  const handleOpenDetail = useCallback((template: any) => {
    setSelectedTemplateId(template._id);
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedTemplateId(null);
  }, []);

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
          justifyContent="space-between"
        >
          <Grid size={{ xs: 12 }} sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              {t("tradingTemplate.pageTitle", "Trading Templates")}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <TradingTemplateList
          templates={templates as any[]}
          isLoading={isLoading}
          onToggleActive={handleToggleActive}
          onDelete={handleOpenDelete}
          onEdit={handleOpenDetail}
          onView={handleOpenDetail}
        />
      </Paper>

      {/* Detail Modal */}
      <TradingTemplateDetail
        templateId={selectedTemplateId}
        open={isDetailOpen}
        onClose={handleCloseDetail}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDelete.open}
        title={t("tradingTemplate.confirmDelete.title", "Delete Template")}
        message={t("tradingTemplate.confirmDelete.message", {
          name: confirmDelete.name,
          defaultValue: "Are you sure you want to delete {{name}}?",
        })}
        onConfirm={handleDelete}
        onCancel={handleCloseDelete}
      />
    </Box>
  );
};

export default memo(TradingTemplate, areEqual);
