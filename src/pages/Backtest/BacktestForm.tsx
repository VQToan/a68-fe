import { useEffect, useCallback, useMemo, memo } from "react";
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
import type { TextFieldProps } from "@mui/material/TextField";
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

type BacktestFormValues = {
  name: string;
  description: string;
  bot_template_id: string;
  parameters: Record<keyof BacktestParameter, any>;
};

// Default bot parameters based on the BacktestParameter type
const defaultBotParams: Partial<BacktestParameter> = {
  SYMBOL: "btcusdt",
  INTERVAL_1: "1m",
  INTERVAL_2: "5m",
  TRADE_MODE: 0, // both
  ENTRY_PERCENTAGE: 1.0,
  LEVERAGE: 10,
  MIN_MARGIN: 0.0,
  FUNDS: 1000.0,
  MAX_MARGIN_PERCENTAGE: 3.0,
  MAX_LOSS: 0.0,
  MIN_ROI: 8.0,
  R2R: "1:2", // Default Risk to Reward ratio
  MA_PERIOD: "8:20",
  DCA_GRID: 0.008,
  GRID_MULTIPLIER: 1.1,
  DCA_MULTIPLIER: 1.1,
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
  formId = "backtest-form",
}: BacktestFormProps) => {
  // Get bot templates from the store
  const {
    templates,
    getTemplates: getBotTemplates,
    isLoading: isLoadingTemplates,
  } = useBotTemplate();

  const initialParameters = useMemo<Record<string, any>>(
    () => ({
      ...defaultBotParams,
      ...(initialData?.parameters || {}),
    }),
    [initialData]
  );

  const defaultFormValues = useMemo<BacktestFormValues>(
    () => ({
      name: initialData?.name || "",
      description: initialData?.description || "",
      bot_template_id: initialData?.bot_template_id || "",
      parameters: initialParameters,
    }),
    [initialData, initialParameters]
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BacktestFormValues>({
    defaultValues: defaultFormValues,
  });

  interface ParameterTextFieldProps
    extends Omit<TextFieldProps, "name" | "defaultValue" | "onChange"> {
    paramName: keyof BacktestParameter | string;
    parseValue?: (value: string) => unknown;
  }

  const toNumber = (value: string) =>
    value === "" || value === undefined ? null : Number(value);

  const ParameterTextField = ({
    paramName,
    parseValue,
    ...textFieldProps
  }: ParameterTextFieldProps) => (
    <Controller
      name={`parameters.${paramName}` as any}
      control={control}
      render={({ field }) => (
        <TextField
          {...textFieldProps}
          {...field}
          value={field.value ?? ""}
          onChange={(event) => {
            const { value } = event.target;
            field.onChange(parseValue ? parseValue(value) : value);
          }}
        />
      )}
    />
  );

  const pauseDayValue = watch("parameters.PAUSE_DAY");

  const selectedPauseDays = useMemo(() => {
    const pauseDay = pauseDayValue ?? initialParameters.PAUSE_DAY;
    if (typeof pauseDay === "string" && pauseDay.length > 0) {
      return pauseDay
        .split(",")
        .map((day: string) => day.trim())
        .filter(Boolean);
    }
    return [];
  }, [pauseDayValue, initialParameters.PAUSE_DAY]);


  useEffect(() => {
    reset(defaultFormValues);
  }, [ defaultFormValues]);

  // Fetch bot templates on component mount
  useEffect(() => {
    getBotTemplates();
  }, []);

  // Format parameters before submission
  const formatParameters = useCallback(
    (params: Record<string, any>) => {
      const formattedParams = { ...params };

      // Convert dates to UTC timestamps
     

      // Ensure PAUSE_DAY is correctly formatted as a comma-separated string
      formattedParams.PAUSE_DAY = selectedPauseDays.join(",");

      return formattedParams;
    },
    [selectedPauseDays]
  );

  // Handle form submission
  const onFormSubmit = useCallback(
    (data: BacktestFormValues) => {
      const formattedParameters = formatParameters(data.parameters || {});

      const formData = {
        ...data,
        parameters: formattedParameters,
      };

      onSubmit(formData as BacktestProcessCreate | BacktestProcessUpdate);
      reset(defaultFormValues); // Reset the form after submission
    },
    [formatParameters, onSubmit, reset, defaultFormValues]
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
              rules={{ required: "Tên backtest là bắt buộc" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tên Backtest"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message as string}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="description"
              control={control}
              rules={{ required: "Mô tả là bắt buộc" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Mô tả"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message as string}
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
              error={!!errors.bot_template_id}
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
              {errors.bot_template_id && (
                <Typography color="error" variant="caption">
                  {errors.bot_template_id.message as string}
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
                    <ParameterTextField
                      paramName="SYMBOL"
                      label="Cặp giao dịch"
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      control={control}
                      name="parameters.INTERVAL_1"
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Interval 1</InputLabel>
                          <Select
                            {...field}
                            label="Interval 1"
                            value={
                              field.value ?? defaultBotParams.INTERVAL_1
                            }
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
                          >
                            {timeIntervalOptions.map((interval) => (
                              <MenuItem key={interval} value={interval}>
                                {interval}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      control={control}
                      name="parameters.INTERVAL_2"
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Interval 2</InputLabel>
                          <Select
                            {...field}
                            label="Interval 2"
                            value={
                              field.value ?? defaultBotParams.INTERVAL_2
                            }
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
                          >
                            {timeIntervalOptions.map((interval) => (
                              <MenuItem key={interval} value={interval}>
                                {interval}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      control={control}
                      name="parameters.TRADE_MODE"
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Trade Mode</InputLabel>
                          <Select
                            {...field}
                            label="Trade Mode"
                            value={
                              field.value ?? defaultBotParams.TRADE_MODE
                            }
                            onChange={(event) =>
                              field.onChange(Number(event.target.value))
                            }
                          >
                            {tradeModeOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
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
                    <ParameterTextField
                      paramName="ENTRY_PERCENTAGE"
                      label="Tỷ lệ vào lệnh (ENTRY_PERCENTAGE)"
                      type="number"
                      fullWidth
                      parseValue={toNumber}
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
                    <ParameterTextField
                      paramName="LEVERAGE"
                      label="Đòn bẩy (LEVERAGE)"
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="FUNDS"
                      label="Vốn ban đầu (FUNDS)"
                      type="number"
                      fullWidth
                      parseValue={toNumber}
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
                    <ParameterTextField
                      paramName="TIME_BETWEEN_ORDERS"
                      label="Thời gian nghỉ giữa các lệnh (giây)"
                      type="number"
                      fullWidth
                      parseValue={toNumber}
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
                    <ParameterTextField
                      paramName="PAUSE_TIME"
                      label="Thời gian tạm dừng (PAUSE_TIME)"
                      fullWidth
                      placeholder="HH:MM-HH:MM"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      control={control}
                      name="parameters.PAUSE_DAY"
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel id="pause-day-select-label">
                            Tạm dừng theo ngày
                          </InputLabel>
                          <Select
                            labelId="pause-day-select-label"
                            id="pause-day-select"
                            multiple
                            value={selectedPauseDays}
                            onChange={(event) => {
                              const {
                                target: { value },
                              } = event;
                              const days =
                                typeof value === "string"
                                  ? value.split(",")
                                  : value;
                              const formattedDays = days
                                .map((day: string) => day.trim())
                                .filter(Boolean)
                                .join(",");

                              field.onChange(formattedDays);
                            }}
                            inputRef={field.ref}
                            onBlur={field.onBlur}
                            name={field.name}
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
                      )}
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
                    <ParameterTextField
                      paramName="MIN_ROI"
                      label="Lợi nhuận tối thiểu (MIN_ROI)"
                      type="number"
                      fullWidth
                      parseValue={toNumber}
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
                    <ParameterTextField
                      paramName="R2R"
                      label="Risk to Reward Ratio (R2R)"
                      fullWidth
                      placeholder="1:2"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="MIN_MARGIN"
                      label="Biên độ tối thiểu (MIN_MARGIN)"
                      type="number"
                      fullWidth
                      parseValue={toNumber}
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
                    <ParameterTextField
                      paramName="MAX_MARGIN_PERCENTAGE"
                      label="Biên độ tối đa (MAX_MARGIN_PERCENTAGE)"
                      type="number"
                      fullWidth
                      parseValue={toNumber}
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
                    <ParameterTextField
                      paramName="MAX_LOSS"
                      label="Lỗ tối đa (MAX_LOSS)"
                      type="number"
                      fullWidth
                      parseValue={toNumber}
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
                    <ParameterTextField
                      paramName="MA_PERIOD"
                      label="Chu kỳ MA (MA_PERIOD)"
                      fullWidth
                      placeholder="8:20"
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
                    <ParameterTextField
                      paramName="RSI_ENTRY_LONG"
                      label="RSI Long Entry"
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_ENTRY_LONG_CANDLE"
                      label="RSI Long Entry Candle"
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_EXIT_LONG"
                      label="RSI Long Exit"
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_EXIT_LONG_CANDLE"
                      label="RSI Long Exit Candle"
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_ENTRY_SHORT"
                      label="RSI Short Entry"
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_ENTRY_SHORT_CANDLE"
                      label="RSI Short Entry Candle"
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_EXIT_SHORT"
                      label="RSI Short Exit"
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_EXIT_SHORT_CANDLE"
                      label="RSI Short Exit Candle"
                      type="number"
                      fullWidth
                      parseValue={toNumber}
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
                    <ParameterTextField
                      paramName="DCA_GRID"
                      label="Lưới DCA (DCA_GRID)"
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                      inputProps={{ step: "0.001" }}
                      helperText="Ví dụ: 0.008 là 0.8%"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="GRID_MULTIPLIER"
                      label="Hệ số lưới (GRID_MULTIPLIER)"
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                      inputProps={{ step: "0.01" }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="DCA_MULTIPLIER"
                      label="Hệ số DCA (DCA_MULTIPLIER)"
                      type="number"
                      fullWidth
                      parseValue={toNumber}
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
