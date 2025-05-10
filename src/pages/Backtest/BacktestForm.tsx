import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useForm, Controller } from "react-hook-form";
import type {
  BacktestProcessCreate,
  BacktestProcessUpdate,
} from "@services/backtest.service";
import { useModule } from "@hooks/useModule";
import type { SelectChangeEvent } from "@mui/material";

interface BacktestFormProps {
  initialData?: BacktestProcessUpdate & { _id?: string };
  onSubmit: (data: BacktestProcessCreate | BacktestProcessUpdate) => void;
  isSubmitting: boolean;
  isEditMode: boolean;
  onCancel: () => void;
}

// Default bot parameters based on provided example
const defaultBotParams = {
  BOT_NAME: "trade_RC_v28_4_new",
  SYMBOL: "btcusdt",
  INTERVAL_1: "5m",
  INTERVAL_2: "15m",
  TRADE_MODE: 0, // BOTH
  QUANTITY: 0.01,
  LEVERAGE: 10,
  TAKE_PROFIT: 20.0,
  MIN_MARGIN: 0.0,
  MAX_MARGIN: 20.0,
  FUNDS: 1000.0,
  MAX_LOSS: 0.0,
  TRAILING_PERCENTAGE: 1.0,
  MIN_PROFIT_MARGIN: 3.0,
  MIN_PROFIT_MULTIPLIER: 1.2,
  MIN_ROI: 8.0,
  MA_PERIOD: "8:20",
  DCA_GRID: 0.008,
  DCA_MULTIPLIER: 1.05,
  DCA_AMOUNT: 100.0,
  DCA_AMOUNT_MULTIPLIER: 1.0,
  RSI_ENTRY_SHORT_CANDLE: 65,
  RSI_ENTRY_SHORT: 75,
  RSI_EXIT_SHORT_CANDLE: 40,
  RSI_EXIT_SHORT: 25,
  RSI_ENTRY_LONG_CANDLE: 35,
  RSI_ENTRY_LONG: 19,
  RSI_EXIT_LONG_CANDLE: 60,
  RSI_EXIT_LONG: 75,
  TIME_BETWEEN_ORDERS: 0,
  PAUSE_TIME: "00:00-00:00",
  PAUSE_DAY: "",
};

// Trade mode options
const tradeModeOptions = [
  { value: 0, label: "BOTH" },
  { value: 1, label: "LONG ONLY" },
  { value: 2, label: "SHORT ONLY" },
];

// Time interval options
const timeIntervalOptions = [
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "4h",
  "6h",
  "8h",
  "12h",
  "1d",
  "3d",
  "1w",
  "1M",
];

const BacktestForm = ({
  initialData,
  onSubmit,
  isSubmitting,
  isEditMode,
  onCancel,
}: BacktestFormProps) => {
  // Get modules from the store for the module selection
  const { modules, getModules, isLoading: isLoadingModules } = useModule();

  // State for the selected module
  const [selectedModule, setSelectedModule] = useState<string>("");

  // State for validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // State for parameters (will be dynamically generated based on selected module)
  const [parameters, setParameters] = useState<Record<string, any>>({
    ...defaultBotParams,
    ...(initialData?.parameters || {}),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      parameters: initialData?.parameters || defaultBotParams,
    },
  });

  // Fetch modules on component mount
  useEffect(() => {
    getModules();
  }, []);

  // Set initial parameters if in edit mode
  useEffect(() => {
    if (isEditMode && initialData?.parameters) {
      setParameters({
        ...defaultBotParams,
        ...initialData.parameters,
      });
      // Try to set selected module if it exists in parameters
      if (initialData.parameters.module_name) {
        setSelectedModule(initialData.parameters.module_name);
      }
    }
  }, [isEditMode, initialData]);

  // Handle module selection change
  const handleModuleChange = (event: SelectChangeEvent) => {
    const moduleName = event.target.value as string;
    setSelectedModule(moduleName);

    // Update parameters with the selected module
    setParameters({
      ...parameters,
      module_name: moduleName,
    });
  };

  // Handle parameter changes
  const handleParameterChange = (paramName: string, value: any) => {
    setParameters({
      ...parameters,
      [paramName]: value,
    });
  };

  // Validate form data
  const validateFormData = (data: any): boolean => {
    const errors: Record<string, string> = {};
    
    if (!data.name?.trim()) {
      errors.name = "Tên backtest là bắt buộc";
    }
    
    if (!data.description?.trim()) {
      errors.description = "Mô tả là bắt buộc";
    }
    
    if (!selectedModule) {
      errors.module = "Vui lòng chọn module";
    }
    
    // Validate start_time and end_time if they exist
    if (parameters.start_time && parameters.end_time) {
      const startDate = new Date(parameters.start_time);
      const endDate = new Date(parameters.end_time);
      
      if (startDate >= endDate) {
        errors.time = "Thời gian kết thúc phải sau thời gian bắt đầu";
      }
    }
    
    // You can add more parameter-specific validations here
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const onFormSubmit = (data: any) => {
    // Add parameters to the form data
    const formData = {
      ...data,
      parameters: parameters,
    };

    if (validateFormData(formData)) {
      onSubmit(formData);
    }
  };

  // Cancel form and reset
  const handleCancel = () => {
    reset();
    setValidationErrors({});
    onCancel();
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {isEditMode ? "Chỉnh sửa Backtest" : "Tạo Backtest mới"}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tên Backtest"
                  fullWidth
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Mô tả"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!validationErrors.description}
                  helperText={validationErrors.description}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              Cấu hình Backtest
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="module-select-label">Module Bot</InputLabel>
              <Select
                labelId="module-select-label"
                id="module-select"
                value={selectedModule}
                label="Module Bot"
                onChange={handleModuleChange}
                disabled={isLoadingModules}
              >
                {isLoadingModules ? (
                  <MenuItem value="">
                    <CircularProgress size={24} />
                  </MenuItem>
                ) : (
                  modules.map((module) => (
                    <MenuItem key={module._id} value={module.name_in_source}>
                      {module.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Basic configuration */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Cấu hình cơ bản</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Tên Bot"
                      fullWidth
                      value={parameters.BOT_NAME || defaultBotParams.BOT_NAME}
                      onChange={(e) =>
                        handleParameterChange("BOT_NAME", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Cặp giao dịch"
                      fullWidth
                      value={parameters.SYMBOL || defaultBotParams.SYMBOL}
                      onChange={(e) =>
                        handleParameterChange("SYMBOL", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Interval 1</InputLabel>
                      <Select
                        value={
                          parameters.INTERVAL_1 || defaultBotParams.INTERVAL_1
                        }
                        label="Interval 1"
                        onChange={(e) =>
                          handleParameterChange("INTERVAL_1", e.target.value)
                        }
                      >
                        {timeIntervalOptions.map((interval) => (
                          <MenuItem key={interval} value={interval}>
                            {interval}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Interval 2</InputLabel>
                      <Select
                        value={
                          parameters.INTERVAL_2 || defaultBotParams.INTERVAL_2
                        }
                        label="Interval 2"
                        onChange={(e) =>
                          handleParameterChange("INTERVAL_2", e.target.value)
                        }
                      >
                        {timeIntervalOptions.map((interval) => (
                          <MenuItem key={interval} value={interval}>
                            {interval}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Trade Mode</InputLabel>
                      <Select
                        value={
                          parameters.TRADE_MODE ?? defaultBotParams.TRADE_MODE
                        }
                        label="Trade Mode"
                        onChange={(e) =>
                          handleParameterChange(
                            "TRADE_MODE",
                            Number(e.target.value)
                          )
                        }
                      >
                        {tradeModeOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Thời gian bắt đầu"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={parameters.start_time || ""}
                      onChange={(e) =>
                        handleParameterChange("start_time", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Thời gian kết thúc"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={parameters.end_time || ""}
                      onChange={(e) =>
                        handleParameterChange("end_time", e.target.value)
                      }
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Trading parameters */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Tham số giao dịch</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Số lượng giao dịch (QUANTITY)"
                      type="number"
                      fullWidth
                      value={parameters.QUANTITY || defaultBotParams.QUANTITY}
                      onChange={(e) =>
                        handleParameterChange(
                          "QUANTITY",
                          Number(e.target.value)
                        )
                      }
                      inputProps={{ step: "0.001" }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Đòn bẩy (LEVERAGE)"
                      type="number"
                      fullWidth
                      value={parameters.LEVERAGE || defaultBotParams.LEVERAGE}
                      onChange={(e) =>
                        handleParameterChange(
                          "LEVERAGE",
                          Number(e.target.value)
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Chốt lời (TAKE_PROFIT) %"
                      type="number"
                      fullWidth
                      value={
                        parameters.TAKE_PROFIT || defaultBotParams.TAKE_PROFIT
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "TAKE_PROFIT",
                          Number(e.target.value)
                        )
                      }
                      inputProps={{ step: "0.1" }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Vốn ban đầu (FUNDS)"
                      type="number"
                      fullWidth
                      value={parameters.FUNDS || defaultBotParams.FUNDS}
                      onChange={(e) =>
                        handleParameterChange("FUNDS", Number(e.target.value))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Trailing Percentage (%)"
                      type="number"
                      fullWidth
                      value={
                        parameters.TRAILING_PERCENTAGE ||
                        defaultBotParams.TRAILING_PERCENTAGE
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "TRAILING_PERCENTAGE",
                          Number(e.target.value)
                        )
                      }
                      inputProps={{ step: "0.1" }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Thời gian nghỉ giữa các lệnh (giây)"
                      type="number"
                      fullWidth
                      value={
                        parameters.TIME_BETWEEN_ORDERS ??
                        defaultBotParams.TIME_BETWEEN_ORDERS
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "TIME_BETWEEN_ORDERS",
                          Number(e.target.value)
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Thời gian tạm dừng (PAUSE_TIME)"
                      fullWidth
                      placeholder="HH:MM-HH:MM"
                      value={
                        parameters.PAUSE_TIME || defaultBotParams.PAUSE_TIME
                      }
                      onChange={(e) =>
                        handleParameterChange("PAUSE_TIME", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Tạm dừng theo ngày (PAUSE_DAY)"
                      fullWidth
                      placeholder="Mon,Tue,..."
                      value={parameters.PAUSE_DAY || defaultBotParams.PAUSE_DAY}
                      onChange={(e) =>
                        handleParameterChange("PAUSE_DAY", e.target.value)
                      }
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Profit and Margin Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Cài đặt lợi nhuận và biên độ</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Biên lợi nhuận tối thiểu (%)"
                      type="number"
                      fullWidth
                      value={
                        parameters.MIN_PROFIT_MARGIN ||
                        defaultBotParams.MIN_PROFIT_MARGIN
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "MIN_PROFIT_MARGIN",
                          Number(e.target.value)
                        )
                      }
                      inputProps={{ step: "0.1" }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Hệ số lợi nhuận tối thiểu"
                      type="number"
                      fullWidth
                      value={
                        parameters.MIN_PROFIT_MULTIPLIER ||
                        defaultBotParams.MIN_PROFIT_MULTIPLIER
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "MIN_PROFIT_MULTIPLIER",
                          Number(e.target.value)
                        )
                      }
                      inputProps={{ step: "0.1" }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Lợi nhuận tối thiểu (MIN_ROI) %"
                      type="number"
                      fullWidth
                      value={parameters.MIN_ROI || defaultBotParams.MIN_ROI}
                      onChange={(e) =>
                        handleParameterChange("MIN_ROI", Number(e.target.value))
                      }
                      inputProps={{ step: "0.1" }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Biên độ tối thiểu (MIN_MARGIN) %"
                      type="number"
                      fullWidth
                      value={
                        parameters.MIN_MARGIN || defaultBotParams.MIN_MARGIN
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "MIN_MARGIN",
                          Number(e.target.value)
                        )
                      }
                      inputProps={{ step: "0.1" }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Biên độ tối đa (MAX_MARGIN) %"
                      type="number"
                      fullWidth
                      value={
                        parameters.MAX_MARGIN || defaultBotParams.MAX_MARGIN
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "MAX_MARGIN",
                          Number(e.target.value)
                        )
                      }
                      inputProps={{ step: "0.1" }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Thua lỗ tối đa (MAX_LOSS) %"
                      type="number"
                      fullWidth
                      value={parameters.MAX_LOSS || defaultBotParams.MAX_LOSS}
                      onChange={(e) =>
                        handleParameterChange(
                          "MAX_LOSS",
                          Number(e.target.value)
                        )
                      }
                      inputProps={{ step: "0.1" }}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Technical indicators */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Chỉ báo kỹ thuật</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Chu kỳ MA (MA_PERIOD)"
                      fullWidth
                      placeholder="8:20"
                      value={parameters.MA_PERIOD || defaultBotParams.MA_PERIOD}
                      onChange={(e) =>
                        handleParameterChange("MA_PERIOD", e.target.value)
                      }
                    />
                  </Grid>

                  {/* RSI Settings */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Cài đặt RSI
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="RSI Long Entry"
                      type="number"
                      fullWidth
                      value={
                        parameters.RSI_ENTRY_LONG ||
                        defaultBotParams.RSI_ENTRY_LONG
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "RSI_ENTRY_LONG",
                          Number(e.target.value)
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="RSI Long Entry Candle"
                      type="number"
                      fullWidth
                      value={
                        parameters.RSI_ENTRY_LONG_CANDLE ||
                        defaultBotParams.RSI_ENTRY_LONG_CANDLE
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "RSI_ENTRY_LONG_CANDLE",
                          Number(e.target.value)
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="RSI Long Exit"
                      type="number"
                      fullWidth
                      value={
                        parameters.RSI_EXIT_LONG ||
                        defaultBotParams.RSI_EXIT_LONG
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "RSI_EXIT_LONG",
                          Number(e.target.value)
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="RSI Long Exit Candle"
                      type="number"
                      fullWidth
                      value={
                        parameters.RSI_EXIT_LONG_CANDLE ||
                        defaultBotParams.RSI_EXIT_LONG_CANDLE
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "RSI_EXIT_LONG_CANDLE",
                          Number(e.target.value)
                        )
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="RSI Short Entry"
                      type="number"
                      fullWidth
                      value={
                        parameters.RSI_ENTRY_SHORT ||
                        defaultBotParams.RSI_ENTRY_SHORT
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "RSI_ENTRY_SHORT",
                          Number(e.target.value)
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="RSI Short Entry Candle"
                      type="number"
                      fullWidth
                      value={
                        parameters.RSI_ENTRY_SHORT_CANDLE ||
                        defaultBotParams.RSI_ENTRY_SHORT_CANDLE
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "RSI_ENTRY_SHORT_CANDLE",
                          Number(e.target.value)
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="RSI Short Exit"
                      type="number"
                      fullWidth
                      value={
                        parameters.RSI_EXIT_SHORT ||
                        defaultBotParams.RSI_EXIT_SHORT
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "RSI_EXIT_SHORT",
                          Number(e.target.value)
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="RSI Short Exit Candle"
                      type="number"
                      fullWidth
                      value={
                        parameters.RSI_EXIT_SHORT_CANDLE ||
                        defaultBotParams.RSI_EXIT_SHORT_CANDLE
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "RSI_EXIT_SHORT_CANDLE",
                          Number(e.target.value)
                        )
                      }
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* DCA Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Cài đặt DCA (Dollar-Cost Averaging)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Lưới DCA (DCA_GRID)"
                      type="number"
                      fullWidth
                      value={parameters.DCA_GRID || defaultBotParams.DCA_GRID}
                      onChange={(e) =>
                        handleParameterChange(
                          "DCA_GRID",
                          Number(e.target.value)
                        )
                      }
                      inputProps={{ step: "0.001" }}
                      helperText="Ví dụ: 0.008 là 0.8%"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Hệ số DCA (DCA_MULTIPLIER)"
                      type="number"
                      fullWidth
                      value={
                        parameters.DCA_MULTIPLIER ||
                        defaultBotParams.DCA_MULTIPLIER
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "DCA_MULTIPLIER",
                          Number(e.target.value)
                        )
                      }
                      inputProps={{ step: "0.01" }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Số tiền DCA (DCA_AMOUNT)"
                      type="number"
                      fullWidth
                      value={
                        parameters.DCA_AMOUNT || defaultBotParams.DCA_AMOUNT
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "DCA_AMOUNT",
                          Number(e.target.value)
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Hệ số số tiền DCA (DCA_AMOUNT_MULTIPLIER)"
                      type="number"
                      fullWidth
                      value={
                        parameters.DCA_AMOUNT_MULTIPLIER ||
                        defaultBotParams.DCA_AMOUNT_MULTIPLIER
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "DCA_AMOUNT_MULTIPLIER",
                          Number(e.target.value)
                        )
                      }
                      inputProps={{ step: "0.01" }}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting
                  ? "Đang xử lý..."
                  : isEditMode
                  ? "Cập nhật"
                  : "Tạo"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default BacktestForm;
