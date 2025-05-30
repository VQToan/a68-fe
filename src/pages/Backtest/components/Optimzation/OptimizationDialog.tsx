import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Checkbox,
  Chip,
  Alert,
  Tooltip,
  IconButton,
  type SelectChangeEvent,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useBotOptimization } from "@/hooks/useBotOptimization";
import { useBotTemplate } from "@/hooks/useBotTemplate";
import { useBacktest } from "@/hooks/useBacktest";
import type { BotOptimizationRequest, LLMModel } from "@/types/botOptimization.type";
import { areEqual } from "@/utils/common";
import { debounce } from "@/utils/debounceUtils";

interface OptimizationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (params: {
    botTemplateId: string;
    backtestProcessIds: string[];
    llmProvider: string;
    model: string;
  }) => void;
}

// LLM Provider options
const LLM_PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "gemini", label: "Google Gemini" },
];

const OptimizationDialog: React.FC<OptimizationDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  // Get bot templates
  const { templates, getTemplates, isLoading: templatesLoading } = useBotTemplate();
  
  // Get backtest processes by template
  const { processesByTemplate, getProcessesByTemplateId } = useBacktest();
  
  // Get optimization hook
  const { 
    optimizeBot, 
    isLoading, 
    error, 
    availableModels, 
    isLoadingModels, 
    fetchAvailableModels,
    clearModels,
    defaultPrompt,
    isLoadingDefaultPrompt,
    fetchDefaultPrompt
  } = useBotOptimization();

  // Local state for form
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("openai");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [apiKeyValidated, setApiKeyValidated] = useState<boolean>(false);
  const [selectedBacktests, setSelectedBacktests] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [useCustomPrompt, setUseCustomPrompt] = useState<boolean>(false);

  // Filter only completed backtest processes from template-specific data
  const completedBacktests = useMemo(() => {
    if (!processesByTemplate) return [];
    return processesByTemplate.filter(
      (process) => process.status === "completed" && (process?.num_results || 0) > 0
    );
  }, [processesByTemplate]);

  // Tạo hàm debounced để fetch models
  const debouncedFetchModels = useMemo(
    () => 
      debounce(async (provider: string, key: string) => {
        if (provider && key && key.length >= 20) {
          try {
            await fetchAvailableModels(provider, key);
            setApiKeyValidated(true);
          } catch (error) {
            console.error("Error fetching models:", error);
            setApiKeyValidated(false);
          }
        }
      }, 800),
    [fetchAvailableModels]
  );

  // Handle template selection change
  const handleTemplateChange = useCallback((event: SelectChangeEvent) => {
    const templateId = event.target.value as string;
    setSelectedTemplate(templateId);
    setSelectedBacktests([]); // Reset selected backtests when template changes
    
    // Fetch backtests for the selected template
    if (templateId) {
      getProcessesByTemplateId(templateId, "completed");
    }
  }, [getProcessesByTemplateId]);

  // Handle provider selection change
  const handleProviderChange = useCallback((event: SelectChangeEvent) => {
    const newProvider = event.target.value as string;
    setSelectedProvider(newProvider);
    setSelectedModel(""); // Reset model when provider changes
    clearModels(); // Clear available models
    setApiKeyValidated(false); // Reset API key validation
    
    // If API key is already entered, fetch models for the new provider
    if (apiKey && apiKey.length >= 20) {
      debouncedFetchModels(newProvider, apiKey);
    }
  }, [apiKey, clearModels, debouncedFetchModels]);

  // Handle API key change
  const handleApiKeyChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = event.target.value;
    setApiKey(newApiKey);
    
    // Reset model selection and validation if API key changes significantly
    if (newApiKey.length < 20 || !selectedProvider) {
      setSelectedModel("");
      setApiKeyValidated(false);
      return;
    }
    
    // Fetch models when provider and API key are both valid
    if (selectedProvider) {
      debouncedFetchModels(selectedProvider, newApiKey);
    }
  }, [selectedProvider, debouncedFetchModels]);

  // Handle model selection change
  const handleModelChange = useCallback((event: SelectChangeEvent) => {
    setSelectedModel(event.target.value as string);
  }, []);

  // Handle backtest selection change
  const handleBacktestToggle = useCallback((backtestId: string) => () => {
    setSelectedBacktests((prev) => {
      if (prev.includes(backtestId)) {
        return prev.filter((id) => id !== backtestId);
      } else {
        return [...prev, backtestId];
      }
    });
  }, []);

  // Handle custom prompt toggle
  const handleCustomPromptToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setUseCustomPrompt(event.target.checked);
    
    // Reset custom prompt if toggled off
    if (!event.target.checked) {
      setCustomPrompt("");
    }
  }, []);

  // Handle custom prompt change
  const handleCustomPromptChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrompt(event.target.value);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!selectedTemplate || !selectedProvider || !selectedModel || !apiKey || selectedBacktests.length === 0) {
      return;
    }

    const requestData: BotOptimizationRequest = {
      bot_template_id: selectedTemplate,
      backtest_process_ids: selectedBacktests,
      llm_provider: selectedProvider as 'openai' | 'anthropic' | 'gemini',
      model: selectedModel,
      api_key: apiKey,
      custom_prompt: useCustomPrompt ? customPrompt : undefined, // Include custom prompt if used
    };

    try {
      await optimizeBot(requestData).unwrap();
      // Pass optimization parameters to the parent component
      onSuccess({
        botTemplateId: selectedTemplate,
        backtestProcessIds: selectedBacktests,
        llmProvider: selectedProvider,
        model: selectedModel,
      });
      onClose();
    } catch (err) {
      console.error("Optimization failed:", err);
    }
  }, [
    selectedTemplate,
    selectedProvider,
    selectedModel,
    apiKey,
    selectedBacktests,
    optimizeBot,
    onSuccess,
    onClose,
    customPrompt,
    useCustomPrompt, // Add useCustomPrompt to dependencies
  ]);

  // Validation
  const isFormValid = useMemo(() => {
    return (
      selectedTemplate !== "" && 
      selectedProvider !== "" && 
      selectedModel !== "" && 
      apiKey.trim() !== "" && 
      apiKeyValidated &&
      selectedBacktests.length > 0
    );
  }, [selectedTemplate, selectedProvider, selectedModel, apiKey, apiKeyValidated, selectedBacktests]);

  // Fetch templates if not loaded
  useEffect(() => {
    if (open && templates.length === 0) {
      getTemplates();
    }
  }, [open]);

  // Load default prompt when custom prompt is toggled on
  useEffect(() => {
    if (useCustomPrompt && !customPrompt && !isLoadingDefaultPrompt && !defaultPrompt) {
      fetchDefaultPrompt();
    }
  }, [useCustomPrompt, customPrompt, isLoadingDefaultPrompt, defaultPrompt, fetchDefaultPrompt]);

  // Set custom prompt to default prompt when it's loaded
  useEffect(() => {
    if (useCustomPrompt && defaultPrompt && !customPrompt) {
      setCustomPrompt(defaultPrompt);
    }
  }, [useCustomPrompt, defaultPrompt, customPrompt]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedModel("");
      clearModels();
      setApiKeyValidated(false);
      setCustomPrompt("");
      setUseCustomPrompt(false);
    }
  }, [open, clearModels]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ 
        sx: { minHeight: "65vh" } 
      }}
    >
      <DialogTitle>
        Tối ưu hóa Bot với LLM
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" paragraph>
            Sử dụng trí tuệ nhân tạo để phân tích kết quả backtest và đề xuất các tham số tối ưu cho bot của bạn.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              1. Chọn Bot Template
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Bot Template</InputLabel>
              <Select
                value={selectedTemplate}
                onChange={handleTemplateChange}
                label="Bot Template"
                disabled={templatesLoading}
              >
                {templates.map((template) => (
                  <MenuItem key={template._id} value={template._id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              2. Chọn Backtest để phân tích
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                maxHeight: 200, 
                overflow: "auto", 
                p: 1, 
                bgcolor: (theme) => theme.palette.background.default 
              }}
            >
              {completedBacktests.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                  Không có backtest nào đã hoàn thành để phân tích
                </Typography>
              ) : (
                <List dense disablePadding>
                  {completedBacktests.map((backtest) => (
                    <React.Fragment key={backtest._id}>
                      <ListItem
                        onClick={handleBacktestToggle(backtest._id)}
                        dense
                      >
                        <Checkbox
                          edge="start"
                          checked={selectedBacktests.includes(backtest._id)}
                          tabIndex={-1}
                          disableRipple
                        />
                        <ListItemText
                          primary={backtest.name}
                          secondary={`Symbol: ${backtest.parameters?.SYMBOL} - ${new Date(backtest.created_at).toLocaleDateString()}`}
                        />
                        <Chip 
                          label={`${backtest.num_results} kết quả`} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              3. Chọn LLM Provider
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Provider</InputLabel>
              <Select
                value={selectedProvider}
                onChange={handleProviderChange}
                label="Provider"
              >
                {LLM_PROVIDERS.map((provider) => (
                  <MenuItem key={provider.value} value={provider.value}>
                    {provider.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="API Key"
              type="password"
              fullWidth
              value={apiKey}
              onChange={handleApiKeyChange}
              variant="outlined"
              helperText="API key sẽ không được lưu trữ trên server"
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: isLoadingModels ? (
                  <CircularProgress size={20} />
                ) : apiKeyValidated ? (
                  <Chip 
                    label="Hợp lệ" 
                    color="success" 
                    size="small" 
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                ) : null
              }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Model</InputLabel>
              <Select
                value={selectedModel}
                onChange={handleModelChange}
                label="Model"
                disabled={!apiKeyValidated || availableModels.length === 0}
              >
                {availableModels.map((model: LLMModel) => (
                  <MenuItem key={model.id} value={model.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography>{model.name}</Typography>
                      {model.is_recommended && (
                        <Chip 
                          label="Khuyến nghị" 
                          color="primary" 
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                      <Tooltip title={model.description} placement="right">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {selectedModel && availableModels.length > 0 ? 
                  `Context length: ${availableModels.find(m => m.id === selectedModel)?.context_length.toLocaleString()} tokens` : 
                  "Nhập API key hợp lệ để xem danh sách models"}
              </Typography>
            </FormControl>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              4. Tùy chỉnh Prompt (Tùy chọn)
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={useCustomPrompt}
                  onChange={handleCustomPromptToggle}
                  color="primary"
                />
              }
              label="Sử dụng prompt tùy chỉnh"
              sx={{ mb: 2 }}
            />
            {useCustomPrompt && (
              <TextField
                label="Custom Prompt"
                fullWidth
                value={customPrompt}
                onChange={handleCustomPromptChange}
                variant="outlined"
                multiline
                rows={6}
                helperText="Nhập prompt tùy chỉnh cho LLM. Ví dụ: 'Tóm tắt kết quả backtest và đề xuất cải thiện'."
                sx={{ mb: 2 }}
              />
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={isLoading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!isFormValid || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? "Đang phân tích..." : "Phân tích và tối ưu hóa"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(OptimizationDialog, areEqual);