import React, { memo, useCallback, useEffect } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Paper,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import type { IModuleBot, ModuleBotType } from "@services/moduleBots.service";
import { areEqual } from "@/utils/common";
import { useTranslation } from "react-i18next";

// Define the form mode types
export type FormMode = "create" | "view" | "edit";

interface ModuleBotFormProps {
  initialData?: Partial<IModuleBot>;
  onSubmit: (data: Omit<IModuleBot, "_id" | "created_at">) => void;
  onCancel?: () => void;
  mode?: FormMode;
  onEdit?: () => void;
  formId?: string;
}

// Form field type
type FormFields = {
  name: string;
  name_in_source: string;
  description: string;
  type: ModuleBotType;
  is_future: boolean;
};

const ModuleBotForm: React.FC<ModuleBotFormProps> = ({
  initialData = {},
  onSubmit,
  mode = "create",
  formId = "module-bot-form",
}) => {
  const { t } = useTranslation();
  // Initialize React Hook Form
  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
  } = useForm<FormFields>({
    defaultValues: {
      name: initialData.name || "",
      name_in_source: initialData.name_in_source || "",
      description: initialData.description || "",
      type: initialData.type || "entry",
      is_future: initialData.is_future || false,
    },
    mode: "onBlur", // Validate on blur
  });

  // Update form values when initialData changes
  useEffect(() => {
    reset({
      name: initialData.name || "",
      name_in_source: initialData.name_in_source || "",
      description: initialData.description || "",
      type: initialData.type || "entry",
      is_future: initialData.is_future || false,
    });
  }, [initialData, reset]);

  // Submit handler
  const onFormSubmit = useCallback(
    (data: FormFields) => {
      onSubmit(data);
    },
    [onSubmit]
  );

  // Render description field based on mode
  const renderDescriptionField = () => {
    if (mode === "view" && initialData.description) {
      return (
        <Box sx={{ height: "100%" }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            {`${t("moduleBot.form.fields.description")}:`}
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: "background.default",
              height: "calc(100% - 30px)", // Subtract the height of the label
              minHeight: "200px",
              overflow: "auto",
            }}
          >
            <ReactMarkdown>{initialData.description}</ReactMarkdown>
          </Paper>
        </Box>
      );
    }

    return (
      <Controller
        name="description"
        control={control}
        rules={{
          required: t("moduleBot.form.validation.descriptionRequired"),
        }}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label={t("moduleBot.form.fields.description")}
            required={mode !== "view"}
            error={!!errors.description}
            helperText={
              errors.description?.message ||
              (mode !== "view" ? t("moduleBot.form.helper.markdown") : "")
            }
            margin="none"
            multiline
            rows={12}
            InputProps={{
              readOnly: mode === "view",
            }}
            sx={{ height: "100%" }}
          />
        )}
      />
    );
  };

  return (
    <Box
      component="form"
      id={formId}
      onSubmit={handleFormSubmit(onFormSubmit)}
      noValidate
      sx={{ width: "100%" }}
    >
      <Grid container spacing={2}>
        {/* Left Column - Basic Info */}
        <Grid size={{ xs: 10, md: 4 }}>
          <Controller
            name="name"
            control={control}
            rules={{
              required: t("moduleBot.form.validation.nameRequired"),
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t("moduleBot.form.fields.name")}
                required={mode !== "view"}
                error={!!errors.name}
                helperText={errors.name?.message}
                margin="none"
                InputProps={{
                  readOnly: mode === "view",
                }}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="name_in_source"
            control={control}
            rules={{
              required: t("moduleBot.form.validation.nameInSourceRequired"),
              pattern: {
                value: /^[a-z0-9_]+$/,
                message: t("moduleBot.form.validation.nameInSourcePattern"),
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t("moduleBot.form.fields.nameInSource")}
                required={mode !== "view"}
                error={!!errors.name_in_source}
                helperText={
                  errors.name_in_source?.message ||
                  (mode !== "view"
                    ? t("moduleBot.form.helper.nameInSource")
                    : "")
                }
                margin="none"
                InputProps={{
                  readOnly: mode === "view",
                }}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="type"
            control={control}
            rules={{
              required: t("moduleBot.form.validation.typeRequired"),
            }}
            render={({ field }) => (
              <FormControl
                fullWidth
                error={!!errors.type}
                sx={{ mb: 2 }}
                disabled={mode === "view"}
              >
                <InputLabel id="module-bot-type-label">
                  {t("moduleBot.form.fields.type")}
                </InputLabel>
                <Select
                  {...field}
                  labelId="module-bot-type-label"
                  label={t("moduleBot.form.fields.type")}
                  required={mode !== "view"}
                  readOnly={mode === "view"}
                >
                  <MenuItem value="entry">{t("moduleBot.types.entry")}</MenuItem>
                  <MenuItem value="exit">{t("moduleBot.types.exit")}</MenuItem>
                  <MenuItem value="dca_cutloss">{t("moduleBot.types.dca_cutloss")}</MenuItem>
                  <MenuItem value="entry_hedge">{t("moduleBot.types.entry_hedge")}</MenuItem>
                  <MenuItem value="after_hedge">{t("moduleBot.types.after_hedge")}</MenuItem>
                  <MenuItem value="stop_loss">{t("moduleBot.types.stop_loss")}</MenuItem>
                </Select>
                {errors.type && (
                  <FormHelperText>{errors.type.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="is_future"
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={value}
                    onChange={onChange}
                    disabled={mode === "view"}
                  />
                }
                label={t("moduleBot.form.fields.isFuture") || "Futures Trading"}
                sx={{ gap: 1 }}
              />
            )}
          />
          
        </Grid>

        {/* Right Column - Description */}
        <Grid
          size={{
            xs: 14,
            md: 8,
          }}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          {renderDescriptionField()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default memo(ModuleBotForm, areEqual);
