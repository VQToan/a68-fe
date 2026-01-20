import React, { useCallback, memo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  IconButton,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { areEqual } from "@/utils/common";
import ResultList from "./ResultList";
import ResultView from "./ResultView";
import Summary from "./Summary";
import { useTranslation } from "react-i18next";
import ReleaseTemplateDialog from "./ReleaseTemplateDialog";
import { useReleaseTemplateMutation } from "@/hooks/queries";
import type { ReleaseTemplateInput } from "@/types/tradingTemplate.type";

interface BacktestResultProps {
  id?: string;
  onBack?: () => void;
}

const BacktestResult: React.FC<BacktestResultProps> = ({
  id: propId,
  onBack,
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const id = propId || paramId;
  const [symbol, setSymbol] = useState<string>("");
  const [selectedResultId, setSelectedResultId] = useState<
    string | undefined
  >();
  const { t } = useTranslation();

  // Release Template State
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { mutate: releaseTemplate, isPending: isReleasing } =
    useReleaseTemplateMutation();

  const handleBackToList = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      navigate("/backtest");
    }
  }, [onBack, navigate]);

  const handleOpenReleaseDialog = () => {
    if (!id) {
      setSnackbar({
        open: true,
        message: t("backtest.errors.processIdMissing", "Process ID not found"),
        severity: "error",
      });
      return;
    }
    setIsReleaseDialogOpen(true);
  };

  const handleCloseReleaseDialog = () => {
    setIsReleaseDialogOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleReleaseTemplate = (data: ReleaseTemplateInput) => {
    if (!id) return;

    releaseTemplate(
      { processId: id, data },
      {
        onSuccess: () => {
          setSnackbar({
            open: true,
            message: t(
              "backtest.messages.releaseSuccess",
              "Template released successfully!",
            ),
            severity: "success",
          });
          handleCloseReleaseDialog();
        },
        onError: (error: any) => {
          setSnackbar({
            open: true,
            message:
              error?.response?.data?.detail ||
              error?.message ||
              t("backtest.errors.releaseFailed", "Failed to release template"),
            severity: "error",
          });
        },
      },
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={handleBackToList} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {t("backtest.results.title")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<RocketLaunchIcon />}
          onClick={handleOpenReleaseDialog}
          disabled={!id}
          sx={{ borderRadius: 2 }}
        >
          {t("backtest.actions.releaseTemplate", "Release Template")}
        </Button>
      </Box>

      {/* Backtest Process Information */}
      <Box mb={4}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Summary id={id} setSymbol={setSymbol} />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <ResultList
              processId={id}
              symbol={symbol}
              selectedResultId={selectedResultId}
              onViewResult={(resultId) => setSelectedResultId(resultId)}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Result Detail Section */}
      {selectedResultId && (
        <ResultView selectedResultId={selectedResultId} symbol={symbol} />
      )}

      {/* Release Dialog & Snackbar */}
      <ReleaseTemplateDialog
        open={isReleaseDialogOpen}
        onClose={handleCloseReleaseDialog}
        onSubmit={handleReleaseTemplate}
        loading={isReleasing}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default memo(BacktestResult, areEqual);
