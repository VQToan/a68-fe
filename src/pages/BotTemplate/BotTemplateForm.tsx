import React, { useState, useEffect, useCallback, memo } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useModule } from "@hooks/useModule";
import {
  ModuleType,
  moduleTypeToField,
  type BotTemplateCreate,
  type BotTemplateUpdate,
} from "../../types/botTemplate.types";
import type { IModuleBot } from "@services/moduleBots.service";
import { areEqual } from "@/utils/common";

export type FormMode = "create" | "edit";

interface BotTemplateFormProps {
  initialData?: BotTemplateUpdate & { _id?: string };
  onSubmit: (data: BotTemplateCreate | BotTemplateUpdate) => void;
  isSubmitting: boolean;
  isEditMode: boolean;
  onCancel: () => void;
}

interface ModuleOption {
  id: string;
  name: string;
  type: string;
}

// Mapping for Vietnamese module labels
const moduleLabels: Record<ModuleType, string> = {
  [ModuleType.ENTRY]: "Module Entry",
  [ModuleType.EXIT]: "Module Exit",
  [ModuleType.DCA_CUTLOSS]: "Module DCA/Cutloss",
  [ModuleType.ENTRY_HEDGE]: "Module Entry Hedge",
  [ModuleType.AFTER_HEDGE]: "Module After Hedge",
  [ModuleType.STOP_LOSS]: "Module Stop Loss",
};

const BotTemplateForm: React.FC<BotTemplateFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  isEditMode,
  onCancel,
}) => {
  // Get modules from the store for the module selections
  const { modules, getModules, isLoading: isLoadingModules } = useModule();

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
    },
  });

  // Fetch modules on component mount
  useEffect(() => {
    getModules();
  }, []);

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
        if (
          module.type &&
          Object.values(ModuleType).includes(module.type as ModuleType)
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
  }, [modules]);

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
      });
    }
  }, [initialData, reset]);

  // Handle form submission
  const onFormSubmit = useCallback(
    (data: any) => {
      // Clean up data to include only non-empty module IDs
      const cleanData = { ...data };

      // Convert empty strings to null for optional fields
      Object.values(ModuleType).forEach((type) => {
        const field = moduleTypeToField[type];
        if (cleanData[field] === "") {
          cleanData[field] = null;
        }
      });

      onSubmit(cleanData);
    },
    [onSubmit, moduleTypeToField]
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onFormSubmit)}
      sx={{ mt: 1, px: 2 }}
    >
      {/* Basic information section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Tên là bắt buộc" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tên template"
                  placeholder="Nhập tên template"
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
              rules={{ required: "Mô tả là bắt buộc" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Mô tả"
                  placeholder="Nhập mô tả chi tiết về template"
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
        </Grid>
      </Box>

      {/* Module configuration section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Cấu hình Module
        </Typography>

        <Grid container spacing={3}>
          {/* First row - Entry and Exit */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="entry_module"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  disabled={isSubmitting || isLoadingModules}
                >
                  <InputLabel id="entry-module-label">
                    {moduleLabels[ModuleType.ENTRY]}
                  </InputLabel>
                  <Select
                    {...field}
                    labelId="entry-module-label"
                    label={moduleLabels[ModuleType.ENTRY]}
                    sx={{
                      height: 56,
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                  >
                    <MenuItem value="">Không chọn</MenuItem>
                    {moduleOptions[ModuleType.ENTRY].map((module) => (
                      <MenuItem key={module.id} value={module.id}>
                        {module.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="exit_module"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  disabled={isSubmitting || isLoadingModules}
                >
                  <InputLabel id="exit-module-label">
                    {moduleLabels[ModuleType.EXIT]}
                  </InputLabel>
                  <Select
                    {...field}
                    labelId="exit-module-label"
                    label={moduleLabels[ModuleType.EXIT]}
                    sx={{
                      height: 56,
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                  >
                    <MenuItem value="">Không chọn</MenuItem>
                    {moduleOptions[ModuleType.EXIT].map((module) => (
                      <MenuItem key={module.id} value={module.id}>
                        {module.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          {/* Second row - DCA/Cutloss and Stop Loss */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="dca_cutloss_module"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  disabled={isSubmitting || isLoadingModules}
                >
                  <InputLabel id="dca-cutloss-module-label">
                    {moduleLabels[ModuleType.DCA_CUTLOSS]}
                  </InputLabel>
                  <Select
                    {...field}
                    labelId="dca-cutloss-module-label"
                    label={moduleLabels[ModuleType.DCA_CUTLOSS]}
                    sx={{
                      height: 56,
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                  >
                    <MenuItem value="">Không chọn</MenuItem>
                    {moduleOptions[ModuleType.DCA_CUTLOSS].map((module) => (
                      <MenuItem key={module.id} value={module.id}>
                        {module.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="stop_loss_module"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  disabled={isSubmitting || isLoadingModules}
                >
                  <InputLabel id="stop-loss-module-label">
                    {moduleLabels[ModuleType.STOP_LOSS]}
                  </InputLabel>
                  <Select
                    {...field}
                    labelId="stop-loss-module-label"
                    label={moduleLabels[ModuleType.STOP_LOSS]}
                    sx={{
                      height: 56,
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                  >
                    <MenuItem value="">Không chọn</MenuItem>
                    {moduleOptions[ModuleType.STOP_LOSS].map((module) => (
                      <MenuItem key={module.id} value={module.id}>
                        {module.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          {/* Third row - Entry Hedge and After Hedge */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="entry_hedge_module"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  disabled={isSubmitting || isLoadingModules}
                >
                  <InputLabel id="entry-hedge-module-label">
                    {moduleLabels[ModuleType.ENTRY_HEDGE]}
                  </InputLabel>
                  <Select
                    {...field}
                    labelId="entry-hedge-module-label"
                    label={moduleLabels[ModuleType.ENTRY_HEDGE]}
                    sx={{
                      height: 56,
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                  >
                    <MenuItem value="">Không chọn</MenuItem>
                    {moduleOptions[ModuleType.ENTRY_HEDGE].map((module) => (
                      <MenuItem key={module.id} value={module.id}>
                        {module.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="after_hedge_module"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  disabled={isSubmitting || isLoadingModules}
                >
                  <InputLabel id="after-hedge-module-label">
                    {moduleLabels[ModuleType.AFTER_HEDGE]}
                  </InputLabel>
                  <Select
                    {...field}
                    labelId="after-hedge-module-label"
                    label={moduleLabels[ModuleType.AFTER_HEDGE]}
                    sx={{
                      height: 56,
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                  >
                    <MenuItem value="">Không chọn</MenuItem>
                    {moduleOptions[ModuleType.AFTER_HEDGE].map((module) => (
                      <MenuItem key={module.id} value={module.id}>
                        {module.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Buttons section */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 4 }}
      >
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={isSubmitting}
          size="large"
          sx={{ px: 4, py: 1.5, minWidth: 120 }}
        >
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          size="large"
          sx={{ px: 4, py: 1.5, minWidth: 120, bgcolor: "black" }}
        >
          {isSubmitting ? "Đang lưu..." : isEditMode ? "Cập nhật" : "Tạo mới"}
        </Button>
      </Box>
    </Box>
  );
};

export default memo(BotTemplateForm, areEqual);
