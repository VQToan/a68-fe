import React, { useState, useEffect, useCallback, memo } from "react";
import {
  Box,
  TextField,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useModulesQuery } from "@hooks/queries";
import {
  ModuleType,
  type BotTemplateCreate,
  type BotTemplateUpdate,
} from "../../types/botTemplate.types";
import type { IModuleBot } from "@services/moduleBots.service";
import { areEqual } from "@/utils/common";
import { useTranslation } from "react-i18next";

export type FormMode = "create" | "edit";

interface BotTemplateFormProps {
  initialData?: BotTemplateUpdate & { _id?: string };
  onSubmit: (data: BotTemplateCreate | BotTemplateUpdate) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
  formId?: string;
  isEditMode?: boolean;
}

interface ModuleOption {
  id: string;
  name: string;
  type: string;
}

const moduleLabelKeyMap: Record<ModuleType, string> = {
  [ModuleType.ENTRY]: "botTemplate.form.fields.entry",
  [ModuleType.EXIT]: "botTemplate.form.fields.exit",
  [ModuleType.DCA_CUTLOSS]: "botTemplate.form.fields.dca",
  [ModuleType.ENTRY_HEDGE]: "botTemplate.form.fields.entryHedge",
  [ModuleType.AFTER_HEDGE]: "botTemplate.form.fields.afterHedge",
  [ModuleType.STOP_LOSS]: "botTemplate.form.fields.stopLoss",
};

const BotTemplateForm: React.FC<BotTemplateFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  formId = "bot-template-form",
}) => {
  // Use TanStack Query for modules
  const { data: modules = [], isLoading: isLoadingModules } = useModulesQuery();
  const { t } = useTranslation();

  // Group modules by type
  const [moduleOptions, setModuleOptions] = useState<
    Record<ModuleType, ModuleOption[]>
  >({
    [ModuleType.ENTRY]: [],
    [ModuleType.EXIT]: [],
    [ModuleType.DCA_CUTLOSS]: [],
    [ModuleType.ENTRY_HEDGE]: [],
    [ModuleType.AFTER_HEDGE]: [],
    [ModuleType.STOP_LOSS]: [],
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      entry_module: initialData?.entry_module || "",
      exit_module: initialData?.exit_module || "",
      dca_cutloss_module: initialData?.dca_cutloss_module || "",
      entry_hedge_module: initialData?.entry_hedge_module || "",
      after_hedge_module: initialData?.after_hedge_module || "",
      stop_loss_module: initialData?.stop_loss_module || "",
      is_future: initialData?.is_future || false,
      is_active: initialData?.is_active ?? true, // Default to true for new templates
    },
  });

  // Watch is_future value to filter modules
  const isFutureValue = watch("is_future");

  // Note: Modules are fetched automatically by TanStack Query

  // Group modules by type when modules are loaded
  useEffect(() => {
    if (modules.length) {
      const grouped: Record<ModuleType, ModuleOption[]> = {
        [ModuleType.ENTRY]: [],
        [ModuleType.EXIT]: [],
        [ModuleType.DCA_CUTLOSS]: [],
        [ModuleType.ENTRY_HEDGE]: [],
        [ModuleType.AFTER_HEDGE]: [],
        [ModuleType.STOP_LOSS]: [],
      };

      modules.forEach((module: IModuleBot) => {
        // Check if module.type is a valid ModuleType
        // Filter by is_future value
        if (
          module.type &&
          Object.values(ModuleType).includes(module.type as ModuleType) &&
          module.is_future === isFutureValue
        ) {
          grouped[module.type as ModuleType].push({
            id: module._id,
            name: module.name,
            type: module.type,
          });
        }
      });

      setModuleOptions(grouped);
    }
  }, [modules, isFutureValue]);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        description: initialData.description || "",
        entry_module: initialData.entry_module || "",
        exit_module: initialData.exit_module || "",
        dca_cutloss_module: initialData.dca_cutloss_module || "",
        entry_hedge_module: initialData.entry_hedge_module || "",
        after_hedge_module: initialData.after_hedge_module || "",
        stop_loss_module: initialData.stop_loss_module || "",
        is_future: initialData.is_future || false,
        is_active: initialData.is_active ?? true,
      });
    }
  }, [initialData, reset]);

  // Reset module selections when is_future changes (except on initial load)
  useEffect(() => {
    // Only reset if not initial data load
    if (initialData && initialData.is_future !== isFutureValue) {
      reset({
        name: initialData.name || "",
        description: initialData.description || "",
        entry_module: "",
        exit_module: "",
        dca_cutloss_module: "",
        entry_hedge_module: "",
        after_hedge_module: "",
        stop_loss_module: "",
        is_future: isFutureValue,
        is_active: true,
      });
    }
  }, [isFutureValue]);

  // Handle form submission
  const onFormSubmit = useCallback(
    (data: any) => {
      // Since all fields are now required, we don't need to clean empty values
      onSubmit(data);
    },
    [onSubmit]
  );

  return (
    <Box
      component="form"
      id={formId}
      onSubmit={handleSubmit(onFormSubmit)}
      sx={{ mt: 1 }}
    >
      {/* Basic information section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Controller
              name="is_active"
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
                      color="success"
                    />
                  }
                  label={t("botTemplate.form.fields.isActive")}
                  sx={{ gap: 1 }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Controller
              name="name"
              control={control}
              rules={{
                required: t("botTemplate.form.validation.nameRequired"),
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("botTemplate.form.fields.name")}
                  placeholder={t("botTemplate.form.placeholders.name")}
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  disabled={isSubmitting}
                  size="medium"
                  InputProps={{
                    sx: { height: 56 },
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="description"
              control={control}
              rules={{
                required: t("botTemplate.form.validation.descriptionRequired"),
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("botTemplate.form.fields.description")}
                  placeholder={t("botTemplate.form.placeholders.description")}
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  disabled={isSubmitting}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
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
                    t("botTemplate.form.fields.isFuture") || "Futures Trading"
                  }
                  sx={{ gap: 1 }}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Module configuration section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          {t("botTemplate.form.sections.modules")}
        </Typography>

        <Grid container spacing={3}>
          {/* First row - Entry and Exit */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="entry_module"
              control={control}
              rules={{
                required: t("botTemplate.form.validation.entryRequired"),
              }}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  disabled={isSubmitting || isLoadingModules}
                  error={!!errors.entry_module}
                >
                  <InputLabel id="entry-module-label">
                    {t(moduleLabelKeyMap[ModuleType.ENTRY])}
                  </InputLabel>
                  <Select
                    {...field}
                    labelId="entry-module-label"
                    label={t(moduleLabelKeyMap[ModuleType.ENTRY])}
                    sx={{
                      height: 56,
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                  >
                    {moduleOptions[ModuleType.ENTRY].map((module) => (
                      <MenuItem key={module.id} value={module.id}>
                        {module.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.entry_module && (
                    <Typography
                      color="error"
                      variant="caption"
                      sx={{ mt: 0.5, ml: 1.5 }}
                    >
                      {errors.entry_module.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="exit_module"
              control={control}
              rules={{
                required: t("botTemplate.form.validation.exitRequired"),
              }}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  disabled={isSubmitting || isLoadingModules}
                  error={!!errors.exit_module}
                >
                  <InputLabel id="exit-module-label">
                    {t(moduleLabelKeyMap[ModuleType.EXIT])}
                  </InputLabel>
                  <Select
                    {...field}
                    labelId="exit-module-label"
                    label={t(moduleLabelKeyMap[ModuleType.EXIT])}
                    sx={{
                      height: 56,
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                  >
                    {moduleOptions[ModuleType.EXIT].map((module) => (
                      <MenuItem key={module.id} value={module.id}>
                        {module.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.exit_module && (
                    <Typography
                      color="error"
                      variant="caption"
                      sx={{ mt: 0.5, ml: 1.5 }}
                    >
                      {errors.exit_module.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Second row - DCA/Cutloss and Stop Loss */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="dca_cutloss_module"
              control={control}
              rules={{ required: t("botTemplate.form.validation.dcaRequired") }}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  disabled={isSubmitting || isLoadingModules}
                  error={!!errors.dca_cutloss_module}
                >
                  <InputLabel id="dca-cutloss-module-label">
                    {t(moduleLabelKeyMap[ModuleType.DCA_CUTLOSS])}
                  </InputLabel>
                  <Select
                    {...field}
                    labelId="dca-cutloss-module-label"
                    label={t(moduleLabelKeyMap[ModuleType.DCA_CUTLOSS])}
                    sx={{
                      height: 56,
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                  >
                    {moduleOptions[ModuleType.DCA_CUTLOSS].map((module) => (
                      <MenuItem key={module.id} value={module.id}>
                        {module.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.dca_cutloss_module && (
                    <Typography
                      color="error"
                      variant="caption"
                      sx={{ mt: 0.5, ml: 1.5 }}
                    >
                      {errors.dca_cutloss_module.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="stop_loss_module"
              control={control}
              rules={{
                required: t("botTemplate.form.validation.stopLossRequired"),
              }}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  disabled={isSubmitting || isLoadingModules}
                  error={!!errors.stop_loss_module}
                >
                  <InputLabel id="stop-loss-module-label">
                    {t(moduleLabelKeyMap[ModuleType.STOP_LOSS])}
                  </InputLabel>
                  <Select
                    {...field}
                    labelId="stop-loss-module-label"
                    label={t(moduleLabelKeyMap[ModuleType.STOP_LOSS])}
                    sx={{
                      height: 56,
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                  >
                    {moduleOptions[ModuleType.STOP_LOSS].map((module) => (
                      <MenuItem key={module.id} value={module.id}>
                        {module.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.stop_loss_module && (
                    <Typography
                      color="error"
                      variant="caption"
                      sx={{ mt: 0.5, ml: 1.5 }}
                    >
                      {errors.stop_loss_module.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Third row - Entry Hedge and After Hedge */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="entry_hedge_module"
              control={control}
              rules={{
                required: t("botTemplate.form.validation.entryHedgeRequired"),
              }}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  disabled={isSubmitting || isLoadingModules}
                  error={!!errors.entry_hedge_module}
                >
                  <InputLabel id="entry-hedge-module-label">
                    {t(moduleLabelKeyMap[ModuleType.ENTRY_HEDGE])}
                  </InputLabel>
                  <Select
                    {...field}
                    labelId="entry-hedge-module-label"
                    label={t(moduleLabelKeyMap[ModuleType.ENTRY_HEDGE])}
                    sx={{
                      height: 56,
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                  >
                    {moduleOptions[ModuleType.ENTRY_HEDGE].map((module) => (
                      <MenuItem key={module.id} value={module.id}>
                        {module.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.entry_hedge_module && (
                    <Typography
                      color="error"
                      variant="caption"
                      sx={{ mt: 0.5, ml: 1.5 }}
                    >
                      {errors.entry_hedge_module.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="after_hedge_module"
              control={control}
              rules={{
                required: t("botTemplate.form.validation.afterHedgeRequired"),
              }}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  disabled={isSubmitting || isLoadingModules}
                  error={!!errors.after_hedge_module}
                >
                  <InputLabel id="after-hedge-module-label">
                    {t(moduleLabelKeyMap[ModuleType.AFTER_HEDGE])}
                  </InputLabel>
                  <Select
                    {...field}
                    labelId="after-hedge-module-label"
                    label={t(moduleLabelKeyMap[ModuleType.AFTER_HEDGE])}
                    sx={{
                      height: 56,
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                  >
                    {moduleOptions[ModuleType.AFTER_HEDGE].map((module) => (
                      <MenuItem key={module.id} value={module.id}>
                        {module.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.after_hedge_module && (
                    <Typography
                      color="error"
                      variant="caption"
                      sx={{ mt: 0.5, ml: 1.5 }}
                    >
                      {errors.after_hedge_module.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Loading indicator when submitting */}
      {isSubmitting && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

export default memo(BotTemplateForm, areEqual);
