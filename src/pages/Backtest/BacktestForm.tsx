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
  FormControlLabel,
  Switch,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useForm, Controller } from "react-hook-form";
import { useActiveBotTemplatesQuery } from "@hooks/queries";
import type { TextFieldProps } from "@mui/material/TextField";
import type {
  BacktestParameter,
  BacktestProcessCreate,
  BacktestProcessUpdate,
} from "@/types/backtest.type";
import { areEqual } from "@/utils/common";
import { useTranslation } from "react-i18next";

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
  is_future: boolean;
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
  AVG_PRICE_PERIOD: 14,
  DCA_GRID: 0.008,
  GRID_MULTIPLIER: 1.1,
  DCA_MULTIPLIER: 1.1,
  TRAILING_PERCENTAGE: 1.0,
  CALLBACK_PERCENTAGE: 0.2,
  RSI_ENTRY_SHORT: 75,
  RSI_EXIT_SHORT: 25,
  RSI_ENTRY_LONG: 19,
  RSI_EXIT_LONG: 75,
  RSI_ENTRY_SHORT_CANDLE: 65,
  RSI_ENTRY_LONG_CANDLE: 35,
  RSI_EXIT_SHORT_CANDLE: 40,
  RSI_EXIT_LONG_CANDLE: 60,
  TIME_BETWEEN_ORDERS: 0,
  DCA_HEDGE: 10,
  GRID_HEDGE: 1,
  PAUSE_TIME: "00:00-00:00",
  PAUSE_DAY: "",
};

// Trade mode options
const tradeModeOptions = [
  { value: -1, labelKey: "backtest.form.tradeModes.shortOnly" },
  { value: 0, labelKey: "backtest.form.tradeModes.both" },
  { value: 1, labelKey: "backtest.form.tradeModes.longOnly" },
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
  { value: "0", labelKey: "common.weekdays.monday" },
  { value: "1", labelKey: "common.weekdays.tuesday" },
  { value: "2", labelKey: "common.weekdays.wednesday" },
  { value: "3", labelKey: "common.weekdays.thursday" },
  { value: "4", labelKey: "common.weekdays.friday" },
  { value: "5", labelKey: "common.weekdays.saturday" },
  { value: "6", labelKey: "common.weekdays.sunday" },
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
  const { t } = useTranslation();
  // Use TanStack Query for bot templates
  const { data: templates = [], isLoading: isLoadingTemplates } =
    useActiveBotTemplatesQuery();

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
      is_future: initialData?.is_future || false,
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
  const isFutureValue = watch("is_future");

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

  // Filter templates based on is_future value
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => template.is_future === isFutureValue);
  }, [templates, isFutureValue]);

  useEffect(() => {
    reset(defaultFormValues);
  }, [defaultFormValues]);

  // Note: Bot templates are fetched automatically by TanStack Query

  // Reset bot_template_id when is_future changes
  useEffect(() => {
    // Only reset if not initial data load and value has changed
    if (initialData && initialData.is_future !== isFutureValue) {
      reset({
        ...defaultFormValues,
        bot_template_id: "",
        is_future: isFutureValue,
      });
    }
  }, [isFutureValue]);

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
    if (selectedPauseDays.length === 0) {
      return "";
    }

    return selectedPauseDays
      .map((dayValue) => {
        const day = pauseDayOptions.find((opt) => opt.value === dayValue);
        return day ? t(day.labelKey) : dayValue;
      })
      .join(", ");
  }, [selectedPauseDays, t]);

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
              rules={{ required: t("backtest.form.validation.nameRequired") }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("backtest.form.fields.name")}
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
              rules={{
                required: t("backtest.form.validation.descriptionRequired"),
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("backtest.form.fields.description")}
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={
                    (errors.description?.message as string) ||
                    t("backtest.form.helper.description")
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t("backtest.form.sections.configuration")}
            </Typography>

            <FormControl
              fullWidth
              sx={{ mb: 2 }}
              error={!!errors.bot_template_id}
            >
              <InputLabel id="bot-template-select-label">
                {t("backtest.form.fields.botTemplate")}
              </InputLabel>
              <Controller
                name="bot_template_id"
                control={control}
                rules={{
                  required: t("backtest.form.validation.botTemplateRequired"),
                }}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="bot-template-select-label"
                    label={t("backtest.form.fields.botTemplate")}
                    onChange={(e) => {
                      field.onChange(e);
                    }}
                    disabled={isLoadingTemplates}
                  >
                    {isLoadingTemplates ? (
                      <MenuItem value="">
                        <CircularProgress size={24} />
                      </MenuItem>
                    ) : filteredTemplates.length === 0 ? (
                      <MenuItem value="" disabled>
                        {t("backtest.form.noTemplatesAvailable") ||
                          "No templates available for this trading type"}
                      </MenuItem>
                    ) : (
                      filteredTemplates.map((template) => (
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

            <Controller
              name="is_future"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(field.value)}
                      onChange={(_, checked) => field.onChange(checked)}
                      onBlur={field.onBlur}
                      inputRef={field.ref}
                      name={field.name}
                      disabled={isSubmitting}
                    />
                  }
                  label={
                    t("backtest.form.fields.isFuture") || "Futures Trading"
                  }
                  sx={{ gap: 1 }}
                />
              )}
            />

            {/* Basic configuration */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t("backtest.form.sections.basic")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="SYMBOL"
                      label={t("backtest.form.fields.symbol")}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      control={control}
                      name="parameters.INTERVAL_1"
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>
                            {t("backtest.form.fields.interval1")}
                          </InputLabel>
                          <Select
                            {...field}
                            label={t("backtest.form.fields.interval1")}
                            value={field.value ?? defaultBotParams.INTERVAL_1}
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
                          <InputLabel>
                            {t("backtest.form.fields.interval2")}
                          </InputLabel>
                          <Select
                            {...field}
                            label={t("backtest.form.fields.interval2")}
                            value={field.value ?? defaultBotParams.INTERVAL_2}
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
                          <InputLabel>
                            {t("backtest.form.fields.tradeMode")}
                          </InputLabel>
                          <Select
                            {...field}
                            label={t("backtest.form.fields.tradeMode")}
                            value={field.value ?? defaultBotParams.TRADE_MODE}
                            onChange={(event) =>
                              field.onChange(Number(event.target.value))
                            }
                          >
                            {tradeModeOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {t(option.labelKey)}
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
                <Typography>{t("backtest.form.sections.trading")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="ENTRY_PERCENTAGE"
                      label={t("backtest.form.fields.entryPercentage")}
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
                      paramName="TRAILING_PERCENTAGE"
                      label={t("backtest.form.fields.trailingPercentage")}
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
                      paramName="CALLBACK_PERCENTAGE"
                      label={t("backtest.form.fields.callbackPercentage")}
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
                      paramName="LEVERAGE"
                      label={t("backtest.form.fields.leverage")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="FUNDS"
                      label={t("backtest.form.fields.funds")}
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
                      label={t("backtest.form.fields.timeBetweenOrders")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                      inputProps={{ step: "1" }}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              {t("backtest.form.units.seconds")}
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="PAUSE_TIME"
                      label={t("backtest.form.fields.pauseTime")}
                      fullWidth
                      placeholder={t("backtest.form.placeholders.pauseTime")}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      control={control}
                      name="parameters.PAUSE_DAY"
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel id="pause-day-select-label">
                            {t("backtest.form.fields.pauseDay")}
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
                            input={
                              <OutlinedInput
                                label={t("backtest.form.fields.pauseDay")}
                              />
                            }
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
                                <ListItemText primary={t(day.labelKey)} />
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
                <Typography>
                  {t("backtest.form.sections.profitMargin")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="MIN_ROI"
                      label={t("backtest.form.fields.minRoi")}
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
                      label={t("backtest.form.fields.riskToReward")}
                      fullWidth
                      placeholder="1:2"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="MIN_MARGIN"
                      label={t("backtest.form.fields.minMargin")}
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
                      label={t("backtest.form.fields.maxMarginPercentage")}
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
                      label={t("backtest.form.fields.maxLoss")}
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
                <Typography>
                  {t("backtest.form.sections.indicators")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="MA_PERIOD"
                      label={t("backtest.form.fields.maPeriod")}
                      fullWidth
                      placeholder={t("backtest.form.placeholders.maPeriod")}
                      helperText={t("backtest.form.helper.maPeriod")}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="AVG_PRICE_PERIOD"
                      label={t("backtest.form.fields.avgPricePeriod")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                      inputProps={{ step: "1", min: "1" }}
                    />
                  </Grid>

                  {/* RSI Settings */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      {t("backtest.form.sections.rsi")}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_ENTRY_LONG"
                      label={t("backtest.form.fields.rsiEntryLong")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_ENTRY_LONG_CANDLE"
                      label={t("backtest.form.fields.rsiEntryLongCandle")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_EXIT_LONG"
                      label={t("backtest.form.fields.rsiExitLong")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_EXIT_LONG_CANDLE"
                      label={t("backtest.form.fields.rsiExitLongCandle")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_ENTRY_SHORT"
                      label={t("backtest.form.fields.rsiEntryShort")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_ENTRY_SHORT_CANDLE"
                      label={t("backtest.form.fields.rsiEntryShortCandle")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_EXIT_SHORT"
                      label={t("backtest.form.fields.rsiExitShort")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_EXIT_SHORT_CANDLE"
                      label={t("backtest.form.fields.rsiExitShortCandle")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Hedge Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t("backtest.form.sections.hedge")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="DCA_HEDGE"
                      label={t("backtest.form.fields.dcaHedge")}
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
                      paramName="GRID_HEDGE"
                      label={t("backtest.form.fields.gridHedge")}
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

            {/* DCA Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t("backtest.form.sections.dca")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="DCA_GRID"
                      label={t("backtest.form.fields.dcaGrid")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                      inputProps={{ step: "0.001" }}
                      helperText={t("backtest.form.helper.dcaGrid")}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="GRID_MULTIPLIER"
                      label={t("backtest.form.fields.gridMultiplier")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                      inputProps={{ step: "0.01" }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="DCA_MULTIPLIER"
                      label={t("backtest.form.fields.dcaMultiplier")}
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
