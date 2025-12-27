import React, { memo, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import type { BotTemplate } from "../../types/botTemplate.types";
import { useModule } from "@hooks/useModule";
import { areEqual } from "@/utils/common";
import { useTranslation } from "react-i18next";

interface BotTemplateDetailProps {
  template: BotTemplate | null;
  isLoading: boolean;
}

const BotTemplateDetail: React.FC<BotTemplateDetailProps> = ({
  template,
  isLoading,
}) => {
  const { modules } = useModule();
  const { t } = useTranslation();

  // Helper function to get module name by ID
  const getModuleName = useCallback(
    (moduleId?: string) => {
      if (!moduleId) return t("botTemplate.detail.missing");
      const module = modules.find((m) => m._id === moduleId);
      return module ? module.name : t("botTemplate.detail.moduleMissing");
    },
    [modules, t]
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!template) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1">
          {t("botTemplate.detail.notFound")}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Chip
              label={
                template.is_future ? t("common.futures") : t("common.spot")
              }
              size="medium"
              color={template.is_future ? "warning" : "info"}
              variant="outlined"
            />
            <Chip
              label={
                template.is_active ? t("common.active") : t("common.inactive")
              }
              size="medium"
              color={template.is_active ? "success" : "default"}
              variant="outlined"
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {t("botTemplate.detail.name")}:
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {template.name}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {t("botTemplate.detail.description")}:
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {template.description}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            {t("botTemplate.detail.modules")}:
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {t("botTemplate.form.fields.entry")}:
            </Typography>
            <Chip
              label={getModuleName(template.entry_module)}
              variant="outlined"
              color={template.entry_module ? "primary" : "default"}
              sx={{ mt: 1 }}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {t("botTemplate.form.fields.exit")}:
            </Typography>
            <Chip
              label={getModuleName(template.exit_module)}
              variant="outlined"
              color={template.exit_module ? "primary" : "default"}
              sx={{ mt: 1 }}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {t("botTemplate.form.fields.dca")}:
            </Typography>
            <Chip
              label={getModuleName(template.dca_cutloss_module)}
              variant="outlined"
              color={template.dca_cutloss_module ? "primary" : "default"}
              sx={{ mt: 1 }}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {t("botTemplate.form.fields.entryHedge")}:
            </Typography>
            <Chip
              label={getModuleName(template.entry_hedge_module)}
              variant="outlined"
              color={template.entry_hedge_module ? "primary" : "default"}
              sx={{ mt: 1 }}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {t("botTemplate.form.fields.afterHedge")}:
            </Typography>
            <Chip
              label={getModuleName(template.after_hedge_module)}
              variant="outlined"
              color={template.after_hedge_module ? "primary" : "default"}
              sx={{ mt: 1 }}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {t("botTemplate.form.fields.stopLoss")}:
            </Typography>
            <Chip
              label={getModuleName(template.stop_loss_module)}
              variant="outlined"
              color={template.stop_loss_module ? "primary" : "default"}
              sx={{ mt: 1 }}
            />
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="body2" color="text.secondary">
            {t("botTemplate.detail.createdAt")}:{" "}
            {new Date(template.created_at).toLocaleString()}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="body2" color="text.secondary">
            {t("botTemplate.detail.updatedAt")}:{" "}
            {new Date(template.updated_at).toLocaleString()}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default memo(BotTemplateDetail, areEqual);
