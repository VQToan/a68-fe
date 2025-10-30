import { useState, useEffect, memo, useCallback, useMemo } from "react";
import {
  TextField,
  MenuItem,
  Box,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  CircularProgress,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTradingAccount } from "@hooks/useTradingAccount";
import { useBotTemplate } from "@hooks/useBotTemplate";
import type {
  TradingProcessCreate,
  TradingProcessUpdate,
  TradingProcess,
} from "@/types/trading.types";
import type { BacktestParameter } from "@/types/backtest.type";
import { areEqual } from "@/utils/common";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { TextFieldProps } from "@mui/material/TextField";

interface TradingFormProps {
  initialData?: Partial<TradingProcess> & {
    _id?: string;
    bot_template_id: string;
    trading_account_id: string;
  };
  onSubmit: (data: TradingProcessCreate | TradingProcessUpdate) => void;
  isSubmitting: boolean;
  isEditMode: boolean;
  formId: string;
}

type TradingFormValues = {
  name: string;
  description: string;
  bot_template_id: string;
  trading_account_id: string;
  is_future: boolean;
  parameters: Record<keyof BacktestParameter, any>;
};

// Default trading parameters (similar to BacktestForm)
const defaultBotParams = {
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
  { value: -1, labelKey: "trading.form.tradeModes.shortOnly" },
  { value: 0, labelKey: "trading.form.tradeModes.both" },
  { value: 1, labelKey: "trading.form.tradeModes.longOnly" },
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

const TradingForm = ({
  initialData,
  onSubmit,
  isSubmitting,
  isEditMode,
  formId,
}: TradingFormProps) => {
  const { t } = useTranslation();
  // Get trading accounts and bot templates from the store
  const { 
    activeAccounts, 
    getActiveAccounts, 
    isLoading: isLoadingAccounts,
    error: accountsError 
  } = useTradingAccount();
  const {
    templates,
    getTemplates: getBotTemplates,
    isLoading: isLoadingTemplates,
  } = useBotTemplate();

  // State for exchange filter
  const [exchangeFilter, setExchangeFilter] = useState<string>("");

  const initialParameters = useMemo<Record<string, any>>(
    () => ({
      ...defaultBotParams,
      ...(initialData?.parameters || {}),
    }),
    [initialData]
  );

  const defaultFormValues = useMemo<TradingFormValues>(
    () => ({
      name: initialData?.name || "",
      description: initialData?.description || "",
      bot_template_id: initialData?.bot_template_id || "",
      trading_account_id: initialData?.trading_account_id || "",
      is_future: initialData?.is_future || false,
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
  } = useForm<TradingFormValues>({
    defaultValues: defaultFormValues,
  });

  // Watch is_future value to filter templates
  const isFutureValue = watch("is_future");

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

  // Filter templates based on is_future value
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => template.is_future === isFutureValue);
  }, [templates, isFutureValue]);

  useEffect(() => {
    reset(defaultFormValues);
  }, [ defaultFormValues]);

  // Fetch bot templates on component mount
  useEffect(() => {
    getBotTemplates();
  }, []);

  // Fetch trading accounts when exchange filter changes
  useEffect(() => {
    getActiveAccounts(exchangeFilter as any);
  }, [exchangeFilter]);

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

  const handleRefreshAccounts = useCallback(() => {
    getActiveAccounts(exchangeFilter as any);
  }, [getActiveAccounts, exchangeFilter]);

  const handleExchangeFilterChange = useCallback((exchange: string) => {
    setExchangeFilter(exchange);
  }, []);

  const formatParameters = useCallback(
    (params: Record<string, any>) => {
      const formattedParams = { ...params };
      formattedParams.PAUSE_DAY = selectedPauseDays.join(",");
      return formattedParams;
    },
    [selectedPauseDays]
  );

  const onFormSubmit = useCallback(
    (data: TradingFormValues) => {
      const formattedParameters = formatParameters(data.parameters || {});

      const formData = {
        ...data,
        parameters: formattedParameters,
      };

      onSubmit(formData as TradingProcessCreate | TradingProcessUpdate);
      reset(defaultFormValues);
    },
    [formatParameters, onSubmit, reset, defaultFormValues]
  );

  const pauseDayLabels = useMemo(() => {
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
              rules={{ required: t("trading.form.validation.nameRequired") }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("trading.form.fields.name")}
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
              rules={{ required: t("trading.form.validation.descriptionRequired") }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("trading.form.fields.description")}
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
              {t("trading.form.sections.configuration")}
            </Typography>

            <FormControl
              fullWidth
              sx={{ mb: 2 }}
              error={!!errors.bot_template_id}
            >
              <InputLabel id="bot-template-select-label">
                {t("trading.form.fields.botTemplate")}
              </InputLabel>
              <Controller
                name="bot_template_id"
                control={control}
                rules={{ required: t("trading.form.validation.botTemplateRequired") }}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="bot-template-select-label"
                    label={t("trading.form.fields.botTemplate")}
                    onChange={(e) => {
                      field.onChange(e);
                    }}
                    disabled={isLoadingTemplates || isEditMode}
                  >
                    {isLoadingTemplates ? (
                      <MenuItem value="">
                        <CircularProgress size={24} />
                      </MenuItem>
                    ) : filteredTemplates.length === 0 ? (
                      <MenuItem value="" disabled>
                        {t("trading.form.noTemplatesAvailable")}
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

            {/* Exchange Filter */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t("trading.form.fields.exchangeFilter")}</InputLabel>
              <Select
                value={exchangeFilter}
                label={t("trading.form.fields.exchangeFilter")}
                onChange={(e) => handleExchangeFilterChange(e.target.value)}
              >
                <MenuItem value="">
                  <em>{t("trading.form.options.allExchanges")}</em>
                </MenuItem>
                <MenuItem value="binance">Binance</MenuItem>
                <MenuItem value="bybit">Bybit</MenuItem>
                <MenuItem value="okx">OKX</MenuItem>
                <MenuItem value="bitget">Bitget</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FormControl
                fullWidth
                error={!!errors.trading_account_id}
              >
                <InputLabel id="trading-account-select-label">
                  {t("trading.form.fields.tradingAccount")}
                </InputLabel>
                <Controller
                  name="trading_account_id"
                  control={control}
                  rules={{ required: t("trading.form.validation.tradingAccountRequired") }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="trading-account-select-label"
                      label={t("trading.form.fields.tradingAccount")}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                      disabled={isSubmitting || isLoadingAccounts}
                    >
                      <MenuItem value="">
                        <em>{t("trading.form.placeholders.selectAccount")}</em>
                      </MenuItem>
                      {isLoadingAccounts ? (
                        <MenuItem value="" disabled>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          {t("trading.form.states.loadingAccounts")}
                        </MenuItem>
                      ) : (
                        activeAccounts.map((account) => (
                          <MenuItem key={account._id} value={account._id}>
                            {account.account_name} ({account.exchange.toUpperCase()})
                            {account.status && account.status !== 'valid' && (
                              <Typography 
                                component="span" 
                                sx={{ 
                                  color: account.status === 'invalid' ? 'error.main' : 'warning.main',
                                  fontSize: 'xs',
                                  ml: 1 
                                }}
                              >
                                [{account.status.toUpperCase()}]
                              </Typography>
                            )}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  )}
                />
              {errors.trading_account_id && (
                <Typography color="error" variant="caption">
                  {errors.trading_account_id.message as string}
                </Typography>
              )}
              {accountsError && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  {t("trading.form.errors.loadAccounts", { message: accountsError })}
                </Typography>
              )}
            </FormControl>
            
            <Tooltip title={t("trading.form.tooltips.refreshAccounts")}>
              <IconButton 
                onClick={handleRefreshAccounts}
                disabled={isLoadingAccounts || isSubmitting}
                  sx={{ mt: 1 }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Futures Trading Switch */}
            <FormControl fullWidth sx={{ mb: 2 }}>
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
                    label={t("trading.form.fields.isFuture")}
                    sx={{ gap: 1 }}
                  />
                )}
              />
            </FormControl>

            {/* Basic configuration */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t("trading.form.sections.basic")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="SYMBOL"
                      label={t("trading.form.fields.symbol")}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      control={control}
                      name="parameters.INTERVAL_1"
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>{t("trading.form.fields.interval1")}</InputLabel>
                          <Select
                            {...field}
                            label={t("trading.form.fields.interval1")}
                            value={field.value ?? defaultBotParams.INTERVAL_1}
                            onChange={(event) => field.onChange(event.target.value)}
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
                          <InputLabel>{t("trading.form.fields.interval2")}</InputLabel>
                          <Select
                            {...field}
                            label={t("trading.form.fields.interval2")}
                            value={field.value ?? defaultBotParams.INTERVAL_2}
                            onChange={(event) => field.onChange(event.target.value)}
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
                          <InputLabel>{t("trading.form.fields.tradeMode")}</InputLabel>
                          <Select
                            {...field}
                            label={t("trading.form.fields.tradeMode")}
                            value={field.value ?? defaultBotParams.TRADE_MODE}
                            onChange={(event) => field.onChange(Number(event.target.value))}
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
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Trading parameters */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t("trading.form.sections.trading")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="ENTRY_PERCENTAGE"
                      label={t("trading.form.fields.entryPercentage")}
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
                      label={t("trading.form.fields.trailingPercentage")}
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
                      label={t("trading.form.fields.callbackPercentage")}
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
                      label={t("trading.form.fields.leverage")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="FUNDS"
                      label={t("trading.form.fields.funds")}
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
                      label={t("trading.form.fields.timeBetweenOrders")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                      inputProps={{ step: "1" }}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              {t("trading.form.units.seconds")}
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="PAUSE_TIME"
                      label={t("trading.form.fields.pauseTime")}
                      fullWidth
                      placeholder={t("trading.form.placeholders.pauseTime")}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      control={control}
                      name="parameters.PAUSE_DAY"
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel id="pause-days-select-label">
                            {t("trading.form.fields.pauseDay")}
                          </InputLabel>
                          <Select
                            labelId="pause-days-select-label"
                            label={t("trading.form.fields.pauseDay")}
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
                            MenuProps={MenuProps}
                            renderValue={() => pauseDayLabels}
                          >
                            {pauseDayOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {t(option.labelKey)}
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
                <Typography>{t("trading.form.sections.profitMargin")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="MIN_ROI"
                      label={t("trading.form.fields.minRoi")}
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
                      label={t("trading.form.fields.riskToReward")}
                      fullWidth
                      placeholder="1:2"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="MIN_MARGIN"
                      label={t("trading.form.fields.minMargin")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                      inputProps={{ step: "0.1" }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="MAX_MARGIN_PERCENTAGE"
                      label={t("trading.form.fields.maxMarginPercentage")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                      inputProps={{ step: "0.1" }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="MAX_LOSS"
                      label={t("trading.form.fields.maxLoss")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                      inputProps={{ step: "0.1" }}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Technical indicators */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t("trading.form.sections.indicators")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="MA_PERIOD"
                      label={t("trading.form.fields.maPeriod")}
                      fullWidth
                      placeholder={t("trading.form.placeholders.maPeriod")}
                      helperText={t("trading.form.helper.maPeriod")}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_ENTRY_LONG"
                      label={t("trading.form.fields.rsiEntryLong")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_ENTRY_LONG_CANDLE"
                      label={t("trading.form.fields.rsiEntryLongCandle")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_EXIT_LONG"
                      label={t("trading.form.fields.rsiExitLong")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_EXIT_LONG_CANDLE"
                      label={t("trading.form.fields.rsiExitLongCandle")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_ENTRY_SHORT"
                      label={t("trading.form.fields.rsiEntryShort")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_ENTRY_SHORT_CANDLE"
                      label={t("trading.form.fields.rsiEntryShortCandle")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_EXIT_SHORT"
                      label={t("trading.form.fields.rsiExitShort")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="RSI_EXIT_SHORT_CANDLE"
                      label={t("trading.form.fields.rsiExitShortCandle")}
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
                <Typography>{t("trading.form.sections.hedge")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="DCA_HEDGE"
                      label={t("trading.form.fields.dcaHedge")}
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
                      label={t("trading.form.fields.gridHedge")}
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
                <Typography>{t("trading.form.sections.dca")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="DCA_GRID"
                      label={t("trading.form.fields.dcaGrid")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                      inputProps={{ step: "0.001" }}
                      helperText={t("trading.form.helper.dcaGrid")}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="GRID_MULTIPLIER"
                      label={t("trading.form.fields.gridMultiplier")}
                      type="number"
                      fullWidth
                      parseValue={toNumber}
                      inputProps={{ step: "0.01" }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ParameterTextField
                      paramName="DCA_MULTIPLIER"
                      label={t("trading.form.fields.dcaMultiplier")}
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

export default memo(TradingForm, areEqual);
