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
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import type { IModuleBot, ModuleBotType } from "@services/moduleBots.service";
import { areEqual } from "@/utils/common";

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
};

const ModuleBotForm: React.FC<ModuleBotFormProps> = ({
  initialData = {},
  onSubmit,
  mode = "create",
  formId = "module-bot-form",
}) => {
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
            Mô tả:
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
          required: "Mô tả không được để trống",
        }}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Mô tả"
            required={mode !== "view"}
            error={!!errors.description}
            helperText={
              errors.description?.message ||
              (mode !== "view" ? "Hỗ trợ định dạng Markdown" : "")
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
              required: "Tên không được để trống",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Tên"
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
              required: "Name in source không được để trống",
              pattern: {
                value: /^[a-z0-9_]+$/,
                message:
                  "Name in source chỉ được chứa chữ thường, số và dấu gạch dưới",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Name in Source"
                required={mode !== "view"}
                error={!!errors.name_in_source}
                helperText={
                  errors.name_in_source?.message ||
                  (mode !== "view"
                    ? "Chỉ sử dụng chữ thường, số và dấu gạch dưới, ví dụ: greeting_bot"
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
              required: "Loại Module Bot không được để trống",
            }}
            render={({ field }) => (
              <FormControl
                fullWidth
                error={!!errors.type}
                sx={{ mb: 2 }}
                disabled={mode === "view"}
              >
                <InputLabel id="module-bot-type-label">
                  Loại Module Bot
                </InputLabel>
                <Select
                  {...field}
                  labelId="module-bot-type-label"
                  label="Loại Module Bot"
                  required={mode !== "view"}
                  readOnly={mode === "view"}
                >
                  <MenuItem value="entry">Entry</MenuItem>
                  <MenuItem value="exit">Exit</MenuItem>
                  <MenuItem value="dca_cutloss">DCA/Cutloss</MenuItem>
                  <MenuItem value="entry_hedge">Entry Hedge</MenuItem>
                  <MenuItem value="after_hedge">After Hedge</MenuItem>
                  <MenuItem value="stop_loss">Stop Loss</MenuItem>
                </Select>
                {errors.type && (
                  <FormHelperText>{errors.type.message}</FormHelperText>
                )}
              </FormControl>
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
