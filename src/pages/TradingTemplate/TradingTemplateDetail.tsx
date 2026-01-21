import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Divider,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { formatDate } from "@/utils/common";
import { useTranslation } from "react-i18next";
import {
  useUpdateTradingTemplateMutation,
  useTradingTemplateByIdQuery,
} from "@/hooks/queries";
import { useNotification } from "@/context/NotificationContext";
import Modal from "@/components/Modal";

interface TradingTemplateDetailProps {
  templateId: string | null;
  open: boolean;
  onClose: () => void;
}

const TradingTemplateDetail: React.FC<TradingTemplateDetailProps> = ({
  templateId,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const updateMutation = useUpdateTradingTemplateMutation();

  const { data: template, isLoading } = useTradingTemplateByIdQuery(
    templateId || undefined,
  );

  console.log("TradingTemplate Detail Data:", template);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: false,
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || "",
        is_active: template.is_active,
      });
    }
  }, [template]);

  // Helper to render module value
  const renderModule = (name?: string, id?: string) => {
    if (name) return name;
    if (id) return id; // Fallback to ID if name is missing
    return "-";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!template) return;
    try {
      await updateMutation.mutateAsync({
        id: template._id,
        data: formData,
      });
      showNotification(
        t("tradingTemplate.notifications.updateSuccess", "Template updated"),
        "success",
      );
      onClose();
    } catch (error) {
      showNotification(
        t(
          "tradingTemplate.notifications.updateFailed",
          "Failed to update template",
        ),
        "error",
      );
      console.error(error);
    }
  };

  const renderFooter = () => (
    <>
      <Button onClick={onClose} variant="outlined" color="inherit">
        {t("common.close", "Close")}
      </Button>
      <Button
        onClick={handleSave}
        variant="contained"
        startIcon={<SaveIcon />}
        disabled={updateMutation.isPending || isLoading}
      >
        {updateMutation.isPending
          ? t("common.saving", "Saving...")
          : t("common.save", "Save")}
      </Button>
    </>
  );

  if (isLoading || !template) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title={t("tradingTemplate.detail.title", "Template Details")}
        maxWidth="md"
      >
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      </Modal>
    );
  }

  // Access bot_modules safely
  const { bot_modules } = template;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("tradingTemplate.detail.title", "Template Details")}
      maxWidth="md"
      footer={renderFooter()}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t("tradingTemplate.detail.name", "Name")}
              </Typography>
              <TextField
                fullWidth
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t("tradingTemplate.detail.createdAt", "Created At")}
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ mt: 0.5 }}>
                {formatDate(template.created_at)}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t("tradingTemplate.detail.description", "Description")}
              </Typography>
              <TextField
                fullWidth
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t("tradingTemplate.detail.type", "Type")}
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={
                    template.is_future
                      ? t("common.futures", "Futures")
                      : t("common.spot", "Spot")
                  }
                  color={template.is_future ? "warning" : "info"}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t("tradingTemplate.detail.status", "Status")}
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={handleChange}
                      name="is_active"
                      color="success"
                    />
                  }
                  label={
                    formData.is_active
                      ? t("common.active", "Active")
                      : t("common.inactive", "Inactive")
                  }
                />
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            {t("tradingTemplate.detail.modules", "Modules")}
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("tradingTemplate.fields.entryModule", "Entry Module")}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                  {renderModule(
                    bot_modules?.entry?.name,
                    bot_modules?.entry?._id,
                  )}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("tradingTemplate.fields.exitModule", "Exit Module")}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                  {renderModule(
                    bot_modules?.exit?.name,
                    bot_modules?.exit?._id,
                  )}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t(
                    "tradingTemplate.fields.stopLossModule",
                    "Stop Loss Module",
                  )}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                  {renderModule(
                    bot_modules?.stop_loss?.name,
                    bot_modules?.stop_loss?._id,
                  )}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t(
                    "tradingTemplate.fields.dcaCutlossModule",
                    "DCA/Cutloss Module",
                  )}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                  {renderModule(
                    bot_modules?.dca_cutloss?.name,
                    bot_modules?.dca_cutloss?._id,
                  )}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t(
                    "tradingTemplate.fields.entryHedgeModule",
                    "Entry Hedge Module",
                  )}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                  {renderModule(
                    bot_modules?.entry_hedge?.name,
                    bot_modules?.entry_hedge?._id,
                  )}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t(
                    "tradingTemplate.fields.afterHedgeModule",
                    "After Hedge Module",
                  )}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                  {renderModule(
                    bot_modules?.after_hedge?.name,
                    bot_modules?.after_hedge?._id,
                  )}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Modal>
  );
};

export default TradingTemplateDetail;
