import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { ReleaseTemplateInput } from "@/types/tradingTemplate.type";

interface ReleaseTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ReleaseTemplateInput) => void;
  loading?: boolean;
}

const ReleaseTemplateDialog: React.FC<ReleaseTemplateDialogProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<ReleaseTemplateInput>({
    defaultValues: {
      name: "",
      description: "",
      icon: "",
    },
  });

  const handleFormSubmit = (data: ReleaseTemplateInput) => {
    onSubmit(data);
  };

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("backtest.results.releaseDialog.title", "Release Trading Template")}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="body2" color="text.secondary">
              {t(
                "backtest.results.releaseDialog.description",
                "Create a trading template from this backtest. The template will include aggregated metrics (7D, 30D, 90D) and be available for other users.",
              )}
            </Typography>

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t(
                    "backtest.results.releaseDialog.nameLabel",
                    "Template Name",
                  )}
                  placeholder={t(
                    "backtest.results.releaseDialog.namePlaceholder",
                    "Auto-generated if empty",
                  )}
                  fullWidth
                  variant="outlined"
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t(
                    "backtest.results.releaseDialog.descLabel",
                    "Description",
                  )}
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                />
              )}
            />

            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t(
                    "backtest.results.releaseDialog.iconLabel",
                    "Icon (Emoji/URL)",
                  )}
                  fullWidth
                  variant="outlined"
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {loading
              ? t("common.releasing", "Releasing...")
              : t("common.release", "Release")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ReleaseTemplateDialog;
