import { useState, useEffect, useCallback, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import TradingList from "./TradingList";
import TradingForm from "./TradingForm";
import StopTradingConfirmDialog from "./components/StopTradingConfirmDialog";
import {
  useTradingProcessesQuery,
  useTradingProcessByIdQuery,
  useCreateTradingProcessMutation,
  useUpdateTradingProcessMutation,
  useDeleteTradingProcessMutation,
  useStartTradingProcessMutation,
  useStopTradingProcessMutation,
} from "@hooks/queries";
import { useNotification } from "@context/NotificationContext";
import ConfirmDialog from "@components/ConfirmDialog";
import Modal from "@components/Modal";
import type {
  TradingStatusType,
  TradingProcess,
  TradingProcessCreate,
  TradingProcessUpdate,
} from "@/types/trading.types";
import type { BacktestParameter } from "@/types/backtest.type";
import { areEqual } from "@/utils/common";
import FilterTabs from "@components/FilterTabs";
import { useTranslation } from "react-i18next";

export type FormMode = "create" | "view" | "edit";

// Tab interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trading-tabpanel-${index}`}
      aria-labelledby={`trading-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

// Tab status mapping
const tabStatusMap: Record<string, TradingStatusType | undefined> = {
  all: undefined,
  created: "created",
  queued: "queued",
  running: "running",
  stopped: "stopped",
  failed: "failed",
  paused: "paused",
};

type TradingDuplicatePayload = {
  name: string;
  description: string;
  bot_template_id: string;
  trading_account_id: string;
  parameters: Record<keyof BacktestParameter, any>;
  is_future: boolean;
};

const Trading = () => {
  const navigate = useNavigate();

  // Use TanStack Query mutations
  const createMutation = useCreateTradingProcessMutation();
  const updateMutation = useUpdateTradingProcessMutation();
  const deleteMutation = useDeleteTradingProcessMutation();
  const startMutation = useStartTradingProcessMutation();
  const stopMutation = useStopTradingProcessMutation();

  // Local state for current process being edited
  const [editingProcessId, setEditingProcessId] = useState<string | null>(null);

  // Fetch current process when editing
  const { data: currentProcess } = useTradingProcessByIdQuery(
    editingProcessId ?? undefined
  );

  // Use the notification context
  const { showNotification } = useNotification();

  // Local state for UI
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<FormMode>("create");
  const { t } = useTranslation();
  const [duplicateProcessData, setDuplicateProcessData] =
    useState<TradingDuplicatePayload | null>(null);

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

  // State for confirm stop dialog
  const [confirmStop, setConfirmStop] = useState<{
    open: boolean;
    process: TradingProcess | null;
  }>({
    open: false,
    process: null,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Get status filter from current tab
  const statusFilter = tabStatusMap[currentTab];

  // Use TanStack Query for data fetching - replaces 4 useEffects!
  const {
    data: processesData,
    isLoading,
    error,
    refetch,
  } = useTradingProcessesQuery(
    statusFilter,
    (currentPage - 1) * rowsPerPage,
    rowsPerPage
  );

  // Extract data from query result
  const processes = processesData?.items ?? [];
  const pagination = processesData
    ? {
        total: processesData.total,
        page: processesData.page,
        page_size: processesData.page_size,
        total_pages: processesData.total_pages,
      }
    : { total: 0, page: 1, page_size: 10, total_pages: 0 };

  // Show error notification when error occurs
  useEffect(() => {
    if (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      showNotification(errorMessage, "error");
    }
  }, [error, showNotification]);

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    // Note: API doesn't support search by keyword for trading processes
    // This is just UI filtering for now
  };

  // Handle tab change
  const handleFilterTabChange = (newValue: string) => {
    setCurrentTab(newValue);
    setCurrentPage(1);
  };

  // Filter processes based on search term if API doesn't support search
  const filteredProcesses = searchTerm
    ? processes.filter(
        (process) =>
          process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          process.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : processes;

  const tabItems = useMemo(
    () => [
      { label: t("trading.tabs.all"), value: "all" },
      { label: t("trading.tabs.created"), value: "created" },
      { label: t("trading.tabs.queued"), value: "queued" },
      { label: t("trading.tabs.running"), value: "running" },
      { label: t("trading.tabs.stopped"), value: "stopped" },
      { label: t("trading.tabs.failed"), value: "failed" },
      { label: t("trading.tabs.paused"), value: "paused" },
    ],
    [t]
  );

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
  }, []);

  // Handle dialog open/close
  const handleOpenDialog = useCallback((mode: FormMode = "create") => {
    setDialogMode(mode);
    if (mode === "create") {
      setDuplicateProcessData(null);
      setEditingProcessId(null);
    }
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    // Clear the editing process ID when dialog closes
    setEditingProcessId(null);
    setDuplicateProcessData(null);
  }, []);

  // Handle form submission (add or update trading process)
  const handleSubmitTradingProcess = useCallback(
    async (formData: TradingProcessCreate | TradingProcessUpdate) => {
      try {
        if (dialogMode === "create") {
          await createMutation.mutateAsync(formData as TradingProcessCreate);
          showNotification(t("trading.notifications.createSuccess"), "success");
        } else if (dialogMode === "edit" && currentProcess) {
          await updateMutation.mutateAsync({
            id: currentProcess._id,
            data: formData as TradingProcessUpdate,
          });
          showNotification(t("trading.notifications.updateSuccess"), "success");
        }
        handleCloseDialog();
      } catch (error) {
        console.error("Error submitting trading process:", error);
      }
    },
    [
      dialogMode,
      currentProcess,
      createMutation,
      updateMutation,
      showNotification,
      handleCloseDialog,
      t,
    ]
  );

  // Handle edit mode toggle from view mode
  const handleSwitchToEditMode = useCallback(() => {
    setDialogMode("edit");
  }, []);

  // Handle edit trading process directly
  const handleEditTradingProcess = useCallback(
    (id: string) => {
      setEditingProcessId(id);
      handleOpenDialog("edit");
    },
    [handleOpenDialog]
  );

  const handleDuplicateTradingProcess = useCallback(
    (process: TradingProcess) => {
      const clonedParameters = { ...process.parameters } as Record<
        keyof BacktestParameter,
        any
      >;
      setDuplicateProcessData({
        name: `${process.name} Copy`,
        description: process.description,
        bot_template_id: process.bot_template_id,
        trading_account_id: process.trading_account_id,
        parameters: clonedParameters,
        is_future: process.is_future,
      });
      setDialogMode("create");
      setEditingProcessId(null);
      setOpenDialog(true);
    },
    []
  );

  // Handle view trading process detail
  const handleViewTradingProcess = useCallback(
    (id: string) => {
      navigate(`/trading-process/${id}`);
    },
    [navigate]
  );

  // Handle opening confirm delete dialog
  const handleOpenDeleteConfirm = useCallback((id: string, name: string) => {
    setConfirmDelete({
      open: true,
      id,
      name,
    });
  }, []);

  // Handle closing confirm delete dialog
  const handleCloseDeleteConfirm = useCallback(() => {
    setConfirmDelete({
      open: false,
      id: null,
      name: "",
    });
  }, []);

  // Handle delete trading process
  const handleDeleteTradingProcess = useCallback(async () => {
    if (!confirmDelete.id) return;

    try {
      await deleteMutation.mutateAsync(confirmDelete.id);
      showNotification(t("trading.notifications.deleteSuccess"), "success");
      handleCloseDeleteConfirm();
    } catch (error) {
      console.error("Error deleting trading process:", error);
    }
  }, [
    confirmDelete.id,
    deleteMutation,
    showNotification,
    handleCloseDeleteConfirm,
    t,
  ]);

  // Handle start trading process
  const handleStartTradingProcess = useCallback(
    async (id: string) => {
      try {
        await startMutation.mutateAsync(id);
        showNotification(t("trading.notifications.startSuccess"), "success");
      } catch (error) {
        console.error("Error starting trading process:", error);
      }
    },
    [startMutation, showNotification, t]
  );

  // Open confirm stop dialog
  const handleOpenStopConfirm = useCallback((process: TradingProcess) => {
    setConfirmStop({ open: true, process });
  }, []);

  const handleCloseStopConfirm = useCallback(() => {
    setConfirmStop({ open: false, process: null });
  }, []);

  // Confirm stop trading process
  const handleConfirmStopTradingProcess = useCallback(
    async (shouldClearPositions: boolean) => {
      const processId = confirmStop.process?._id;
      if (!processId) return;

      try {
        await stopMutation.mutateAsync({
          id: processId,
          clearPositions: shouldClearPositions ? true : undefined,
        });
        const message = shouldClearPositions
          ? t("trading.notifications.stopWithCloseSuccess")
          : t("trading.notifications.stopSuccess");
        showNotification(message, "success");
        handleCloseStopConfirm();
      } catch (error) {
        console.error("Error stopping trading process:", error);
      }
    },
    [
      confirmStop.process,
      stopMutation,
      showNotification,
      handleCloseStopConfirm,
      t,
    ]
  );

  // Handle refreshing the trading process list
  const handleRefreshTradingProcesses = useCallback(() => {
    refetch();
    showNotification(t("trading.notifications.refreshSuccess"), "success");
  }, [refetch, showNotification, t]);

  // Create form footer based on dialog mode
  const dialogTitleKey = useMemo(() => {
    switch (dialogMode) {
      case "view":
        return "trading.dialog.viewTitle";
      case "edit":
        return "trading.dialog.editTitle";
      default:
        return "trading.dialog.createTitle";
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
            const form = document.getElementById(
              "trading-form"
            ) as HTMLFormElement;
            if (form)
              form.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
              );
          }}
          variant="contained"
          disabled={isLoading}
        >
          {dialogMode === "edit" ? t("common.update") : t("common.create")}
        </Button>
      </>
    );
  }, [dialogMode, handleCloseDialog, handleSwitchToEditMode, isLoading, t]);

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
              {t("trading.pageTitle")}
            </Typography>
          </Grid>
          <Grid
            size={{ xs: "auto", md: "auto" }}
            sx={{ ml: { xs: "auto", md: 0 } }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: { xs: "flex-end", md: "flex-end" },
              }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog("create")}
                aria-label={t("trading.create.aria")}
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
                  {t("trading.create.button")}
                </Box>
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <FilterTabs
          ariaLabel={t("trading.tabs.ariaLabel")}
          value={currentTab}
          onChange={handleFilterTabChange}
          items={tabItems}
        />

        <TextField
          fullWidth
          variant="outlined"
          placeholder={t("trading.searchPlaceholder")}
          value={searchTerm}
          onChange={handleSearch}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={t("trading.refreshTooltip")}>
                  <IconButton
                    onClick={handleRefreshTradingProcesses}
                    disabled={isLoading}
                    size="small"
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />

        <TabPanel value={currentTab} index={currentTab}>
          <TradingList
            processes={filteredProcesses}
            isLoading={isLoading}
            onView={handleViewTradingProcess}
            onEdit={handleEditTradingProcess}
            onDelete={(id: string, name: string) =>
              handleOpenDeleteConfirm(id, name)
            }
            onStart={handleStartTradingProcess}
            onStop={handleOpenStopConfirm}
            onRefresh={handleRefreshTradingProcesses}
            onDuplicate={handleDuplicateTradingProcess}
            pagination={pagination}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </TabPanel>
      </Paper>

      {/* Modal for creating, viewing or editing trading process */}
      <Modal
        open={openDialog}
        onClose={handleCloseDialog}
        title={t(dialogTitleKey)}
        maxWidth="sm"
        footer={getModalFooter()}
      >
        <TradingForm
          initialData={
            dialogMode === "edit" && currentProcess
              ? {
                  _id: currentProcess._id,
                  name: currentProcess.name,
                  description: currentProcess.description,
                  parameters: currentProcess.parameters,
                  bot_template_id: currentProcess.bot_template_id,
                  trading_account_id: currentProcess.trading_account_id,
                  is_future: currentProcess.is_future,
                }
              : dialogMode === "create" && duplicateProcessData
              ? {
                  ...duplicateProcessData,
                  parameters: { ...duplicateProcessData.parameters },
                }
              : undefined
          }
          onSubmit={handleSubmitTradingProcess}
          isSubmitting={isLoading}
          isEditMode={dialogMode === "edit"}
          formId="trading-form"
        />
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDelete.open}
        title={t("trading.confirmDelete.title")}
        message={t("trading.confirmDelete.message", {
          name: confirmDelete.name,
        })}
        confirmLabel={t("common.delete")}
        confirmColor="error"
        onConfirm={handleDeleteTradingProcess}
        onCancel={handleCloseDeleteConfirm}
      />

      {/* Confirm Stop Dialog */}
      <StopTradingConfirmDialog
        open={confirmStop.open}
        processName={confirmStop.process?.name}
        accountId={confirmStop.process?.trading_account_id}
        symbol={confirmStop.process?.parameters?.SYMBOL as string | undefined}
        onClose={handleCloseStopConfirm}
        onStop={handleConfirmStopTradingProcess}
      />
    </Box>
  );
};

export default memo(Trading, areEqual);
