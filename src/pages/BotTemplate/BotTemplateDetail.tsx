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

interface BotTemplateDetailProps {
  template: BotTemplate | null;
  isLoading: boolean;
}

const BotTemplateDetail: React.FC<BotTemplateDetailProps> = ({
  template,
  isLoading,
}) => {
  const { modules } = useModule();

  // Helper function to get module name by ID
  const getModuleName = useCallback(
    (moduleId?: string) => {
      if (!moduleId) return "Không có";
      const module = modules.find((m) => m._id === moduleId);
      return module ? module.name : "Không tìm thấy module";
    },
    [modules]
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
          Không tìm thấy thông tin template.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          mb: 2,
        }}
      >
        <Typography variant="h6" component="h2">
          Chi tiết Bot Template
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Tên:
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {template.name}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Mô tả:
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {template.description}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Cấu hình Module:
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Entry Module:
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
              Exit Module:
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
              DCA/Cutloss Module:
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
              Entry Hedge Module:
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
              After Hedge Module:
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
              Stop Loss Module:
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
            Ngày tạo: {new Date(template.created_at).toLocaleString()}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="body2" color="text.secondary">
            Cập nhật lần cuối: {new Date(template.updated_at).toLocaleString()}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default memo(BotTemplateDetail, areEqual);
