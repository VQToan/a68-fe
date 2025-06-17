import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Box,
  TextField,
  Typography,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  ListItemText,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useForm, Controller } from "react-hook-form";
import { useBotTemplate } from "@hooks/useBotTemplate";
import type { SelectChangeEvent } from "@mui/material";
import type {
  BacktestParameter,
  BacktestProcessCreate,
  BacktestProcessUpdate,
} from "@/types/backtest.type";
import { areEqual } from "@/utils/common";

interface BacktestFormProps {
  initialData?: BacktestProcessUpdate & {
    _id?: string;
    bot_template_id?: string;
  };
  onSubmit: (data: BacktestProcessCreate | BacktestProcessUpdate) => void;
  isSubmitting: boolean;
  isEditMode: boolean;
  formId?: string;
}

// Default bot parameters based on the BacktestParameter type
const defaultBotParams: Partial<BacktestParameter> = {
  SYMBOL: "btcusdt",
  INTERVAL_1: "5m",
  INTERVAL_2: "15m",
  TRADE_MODE: 0, // both
  ENTRY_PERCENTAGE: 1.0,
  LEVERAGE: 10,
  MIN_MARGIN: 0.0,
  FUNDS: 1000.0,
  MAX_MARGIN_PERCENTAGE: 20.0,
  MAX_LOSS: 0.0,
  MIN_ROI: 8.0,
  R2R: "1:2", // Default Risk to Reward ratio
  MA_PERIOD: "8:20",
  DCA_GRID: 0.008,
  DCA_MULTIPLIER: 1.05,
  RSI_ENTRY_SHORT: 75,
  RSI_EXIT_SHORT: 25,
  RSI_ENTRY_LONG: 19,
  RSI_EXIT_LONG: 75,
  RSI_ENTRY_SHORT_CANDLE: 65,
  RSI_ENTRY_LONG_CANDLE: 35,
  RSI_EXIT_SHORT_CANDLE: 40,
  RSI_EXIT_LONG_CANDLE: 60,
  TIME_BETWEEN_ORDERS: 0,
  PAUSE_TIME: "00:00-00:00",
  PAUSE_DAY: "",
};

// Trade mode options
const tradeModeOptions = [
  { value: -1, label: "SHORT ONLY" },
  { value: 0, label: "BOTH" },
  { value: 1, label: "LONG ONLY" },
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

// Pause day options
const pauseDayOptions = [
  { value: "0", label: "Monday" },
  { value: "1", label: "Tuesday" },
  { value: "2", label: "Wednesday" },
  { value: "3", label: "Thursday" },
  { value: "4", label: "Friday" },
  { value: "5", label: "Saturday" },
  { value: "6", label: "Sunday" },
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const BacktestForm = ({
  initialData,
  onSubmit,
  isSubmitting,
  isEditMode,
  formId = "backtest-form",
}: BacktestFormProps) => {
  // Get bot templates from the store
  const {
    templates,
    getTemplates: getBotTemplates,
    isLoading: isLoadingTemplates,
  } = useBotTemplate();

  // State for the selected bot template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  // State for validation errors
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // State for selected pause days
  const [selectedPauseDays, setSelectedPauseDays] = useState<string[]>([]);

  // State for parameters (will be dynamically generated based on selected bot template)
  const [parameters, setParameters] = useState<Record<string, any>>({
    ...defaultBotParams,
    ...(initialData?.parameters || {}),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: {
      /* errors */
    },
  } = useForm({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      bot_template_id: initialData?.bot_template_id || "",
      parameters: initialData?.parameters || defaultBotParams,
    },
  });

  // Parse pause days from initialData if present
  useEffect(() => {
    if (initialData?.parameters?.PAUSE_DAY) {
      const pauseDays = initialData.parameters.PAUSE_DAY.split(",").map(
        (day: string) => day.trim()
      );
      setSelectedPauseDays(pauseDays);
    }
  }, [initialData]);

  // Fetch bot templates on component mount
  useEffect(() => {
    getBotTemplates();
  }, []);

  // Set initial parameters if in edit mode
  useEffect(() => {
    if (isEditMode && initialData?.parameters) {
      setParameters({
        ...defaultBotParams,
        ...initialData.parameters,
      });
      // Try to set selected bot template if it exists in initial data
      if (initialData.bot_template_id) {
        setSelectedTemplateId(initialData.bot_template_id);
      }
    }
  }, [isEditMode, initialData]);

  // Handle parameter changes
  const handleParameterChange = useCallback((paramName: string, value: any) => {
    setParameters((prevParams) => ({
      ...prevParams,
      [paramName]: value,
    }));
  }, []);

  // Handle pause days selection
  const handlePauseDaysChange = useCallback(
    (event: SelectChangeEvent<typeof selectedPauseDays>) => {
      const {
        target: { value },
      } = event;

      // On autofill we get a stringified value.
      const days = typeof value === "string" ? value.split(",") : value;
      setSelectedPauseDays(days);

      // Update parameters with comma-separated list of pause days
      setParameters((prevParams) => ({
        ...prevParams,
        PAUSE_DAY: days.join(","),
      }));
    },
    []
  );

  // Validate form data
  const validateFormData = useCallback(
    (data: any): boolean => {
      const errors: Record<string, string> = {};

      if (!data.name?.trim()) {
        errors.name = "Tên backtest là bắt buộc";
      }

      if (!data.description?.trim()) {
        errors.description = "Mô tả là bắt buộc";
      }

      if (!selectedTemplateId) {
        errors.template = "Vui lòng chọn bot template";
      }

      // Validate start_time and end_time if they exist
      if (parameters.START_DATE && parameters.END_DATE) {
        const startDate = new Date(parameters.START_DATE);
        const endDate = new Date(parameters.END_DATE);

        if (startDate >= endDate) {
          errors.time = "Thời gian kết thúc phải sau thời gian bắt đầu";
        }
      }

      // You can add more parameter-specific validations here

      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    },
    [parameters, selectedTemplateId]
  );

  // Format parameters before submission
  const formatParameters = useCallback(
    (params: Record<string, any>) => {
      const formattedParams = { ...params };

      // Convert dates to timestamps
      if (formattedParams.START_DATE) {
        formattedParams.START_DATE = new Date(
          formattedParams.START_DATE
        ).getTime();
      }

      if (formattedParams.END_DATE) {
        formattedParams.END_DATE = new Date(formattedParams.END_DATE).getTime();
      }

      // Ensure PAUSE_DAY is correctly formatted as a comma-separated string
      if (selectedPauseDays.length > 0) {
        formattedParams.PAUSE_DAY = selectedPauseDays.join(",");
      }

      return formattedParams;
    },
    [selectedPauseDays]
  );

  // Handle form submission
  const onFormSubmit = useCallback(
    (data: any) => {
      // Combine the form data with formatted parameters
      const formattedParameters = formatParameters(parameters);

      const formData = {
        name: data.name,
        description: data.description,
        bot_template_id: data.bot_template_id,
        parameters: formattedParameters,
      };

      // Validate the form data
      if (validateFormData(formData)) {
        onSubmit(formData as BacktestProcessCreate | BacktestProcessUpdate);
        reset(); // Reset the form after submission
      }
    },
    [parameters, onSubmit, validateFormData, formatParameters, reset]
  );

  // Render pause day display labels
  const pauseDayLabels = useMemo(() => {
    return selectedPauseDays
      .map((dayValue) => {
        const day = pauseDayOptions.find((opt) => opt.value === dayValue);
        return day ? day.label : dayValue;
      })
      .join(", ");
  }, [selectedPauseDays]);

  return (
    <Box
      component="form"
      id={formId}
      onSubmit={handleSubmit(onFormSubmit)}
      noValidate
    >
      <Box sx={{ p: 3, mb: 3 }}>
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

            <FormControl
              fullWidth
              sx={{ mb: 2 }}
              error={!!validationErrors.template}
            >
              <InputLabel id="bot-template-select-label">
                Bot Template
              </InputLabel>
              <Controller
                name="bot_template_id"
                control={control}
                rules={{ required: "Bot Template là bắt buộc" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="bot-template-select-label"
                    label="Bot Template"
                    onChange={(e) => {
                      field.onChange(e);
                      setSelectedTemplateId(e.target.value as string);
                    }}
                    disabled={isLoadingTemplates}
                  >
                    {isLoadingTemplates ? (
                      <MenuItem value="">
                        <CircularProgress size={24} />
                      </MenuItem>
                    ) : (
                      templates.map((template) => (
                        <MenuItem key={template._id} value={template._id}>
                          {template.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                )}
              />
              {validationErrors.template && (
                <Typography color="error" variant="caption">
                  {validationErrors.template}
                </Typography>
              )}
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
                  {/* Removed Start Date and End Date fields as they will be requested when running the backtest */}
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
                      label="Tỷ lệ vào lệnh (ENTRY_PERCENTAGE)"
                      type="number"
                      fullWidth
                      value={
                        parameters.ENTRY_PERCENTAGE ||
                        defaultBotParams.ENTRY_PERCENTAGE
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "ENTRY_PERCENTAGE",
                          Number(e.target.value)
                        )
                      }
                      inputProps={{ step: "0.001" }}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">%</InputAdornment>
                          ),
                        },
                      }}
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
                      label="Vốn ban đầu (FUNDS)"
                      type="number"
                      fullWidth
                      value={parameters.FUNDS || defaultBotParams.FUNDS}
                      onChange={(e) =>
                        handleParameterChange("FUNDS", Number(e.target.value))
                      }
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">USDT</InputAdornment>
                          ),
                        },
                      }}
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
                      inputProps={{ step: "1" }}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">giây</InputAdornment>
                          ),
                        },
                      }}
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
                    <FormControl fullWidth>
                      <InputLabel id="pause-day-select-label">
                        Tạm dừng theo ngày
                      </InputLabel>
                      <Select
                        labelId="pause-day-select-label"
                        id="pause-day-select"
                        multiple
                        value={selectedPauseDays}
                        onChange={handlePauseDaysChange}
                        input={<OutlinedInput label="Tạm dừng theo ngày" />}
                        renderValue={() => pauseDayLabels}
                        MenuProps={MenuProps}
                      >
                        {pauseDayOptions.map((day) => (
                          <MenuItem key={day.value} value={day.value}>
                            <Checkbox
                              checked={
                                selectedPauseDays.indexOf(day.value) > -1
                              }
                            />
                            <ListItemText primary={day.label} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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
                      label="Lợi nhuận tối thiểu (MIN_ROI)"
                      type="number"
                      fullWidth
                      value={parameters.MIN_ROI || defaultBotParams.MIN_ROI}
                      onChange={(e) =>
                        handleParameterChange("MIN_ROI", Number(e.target.value))
                      }
                      inputProps={{ step: "0.1" }}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">%</InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Risk to Reward Ratio (R2R)"
                      fullWidth
                      placeholder="1:2"
                      value={parameters.R2R || defaultBotParams.R2R}
                      onChange={(e) =>
                        handleParameterChange("R2R", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Biên độ tối thiểu (MIN_MARGIN)"
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
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">%</InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Biên độ tối đa (MAX_MARGIN_PERCENTAGE)"
                      type="number"
                      fullWidth
                      value={
                        parameters.MAX_MARGIN_PERCENTAGE ||
                        defaultBotParams.MAX_MARGIN_PERCENTAGE
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          "MAX_MARGIN_PERCENTAGE",
                          Number(e.target.value)
                        )
                      }
                      inputProps={{ step: "0.1" }}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">%</InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Lỗ tối đa (MAX_LOSS)"
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
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">%</InputAdornment>
                          ),
                        },
                      }}
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
                      helperText="Định dạng: 'chu kỳ ngắn:chu kỳ dài' (vd: 8:20)"
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
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>

        {/* Loading indicator when submitting */}
        {isSubmitting && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default memo(BacktestForm, areEqual);
