import { useState, useEffect, memo } from "react";
import {
  TextField,
  MenuItem,
  Box,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  type SelectChangeEvent,
  Chip,
  InputAdornment,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import type { 
  TradingAccountCreate, 
  TradingAccountUpdate, 
  TradingAccount, 
  TradingExchangeType 
} from "@/types/trading.types";
import { areEqual } from "@/utils/common";

interface TradingAccountFormProps {
  initialData?: Partial<TradingAccount> & { 
    _id?: string;
    api_key_masked?: string;
  };
  onSubmit: (data: TradingAccountCreate | TradingAccountUpdate) => void;
  isSubmitting: boolean;
  isEditMode: boolean;
  isViewMode?: boolean;
  formId: string;
}

const exchangeOptions: { value: TradingExchangeType; label: string }[] = [
  { value: "binance", label: "Binance" },
  { value: "bybit", label: "Bybit" },
  { value: "okx", label: "OKX" },
  { value: "bitget", label: "Bitget" },
];

const TradingAccountForm = ({
  initialData,
  onSubmit,
  isSubmitting,
  isEditMode,
  isViewMode = false,
  formId,
}: TradingAccountFormProps) => {
  // Form state
  const [formData, setFormData] = useState({
    account_name: initialData?.account_name || "",
    exchange: (initialData?.exchange || "") as TradingExchangeType,
    api_key: "",
    secret_key: "",
    chat_ids: initialData?.chat_ids || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newChatId, setNewChatId] = useState("");

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        account_name: initialData.account_name || "",
        exchange: (initialData.exchange || "") as TradingExchangeType,
        api_key: "", // Don't prefill API key for security
        secret_key: "", // Don't prefill secret key for security
        chat_ids: initialData.chat_ids || [],
      });
    }
  }, [initialData]);

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.account_name.trim()) {
      newErrors.account_name = "Tên tài khoản là bắt buộc";
    }

    if (!formData.exchange) {
      newErrors.exchange = "Sàn giao dịch là bắt buộc";
    }

    if (!isEditMode || formData.api_key) {
      if (!formData.api_key.trim()) {
        newErrors.api_key = "API Key là bắt buộc";
      }
    }

    if (!isEditMode || formData.secret_key) {
      if (!formData.secret_key.trim()) {
        newErrors.secret_key = "Secret Key là bắt buộc";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (isViewMode) return;

    if (!validateForm()) {
      return;
    }

    // Submit form data
    if (isEditMode) {
      // For update, only send changed fields
      const updateData: TradingAccountUpdate = {
        account_name: formData.account_name,
        chat_ids: formData.chat_ids,
      };

      // Only include API keys if they were provided
      if (formData.api_key) {
        updateData.api_key = formData.api_key;
      }
      if (formData.secret_key) {
        updateData.secret_key = formData.secret_key;
      }

      onSubmit(updateData);
    } else {
      onSubmit({
        account_name: formData.account_name,
        exchange: formData.exchange,
        api_key: formData.api_key,
        secret_key: formData.secret_key,
        chat_ids: formData.chat_ids,
      } as TradingAccountCreate);
    }
  };

  // Handle input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle select changes
  const handleSelectChange = (event: SelectChangeEvent<TradingExchangeType>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user makes selection
    if (errors[name as string]) {
      setErrors(prev => ({
        ...prev,
        [name as string]: "",
      }));
    }
  };

  // Handle adding chat ID
  const handleAddChatId = () => {
    if (newChatId.trim() && !formData.chat_ids.includes(newChatId.trim())) {
      setFormData(prev => ({
        ...prev,
        chat_ids: [...prev.chat_ids, newChatId.trim()],
      }));
      setNewChatId("");
    }
  };

  // Handle removing chat ID
  const handleRemoveChatId = (index: number) => {
    setFormData(prev => ({
      ...prev,
      chat_ids: prev.chat_ids.filter((_, i) => i !== index),
    }));
  };

  const isReadOnly = isViewMode || isSubmitting;

  return (
    <Box component="form" id={formId} onSubmit={handleSubmit}>
      <Grid container spacing={3} style={{ padding: 16 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Tên tài khoản"
            name="account_name"
            value={formData.account_name}
            onChange={handleInputChange}
            error={!!errors.account_name}
            helperText={errors.account_name}
            disabled={isReadOnly}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth error={!!errors.exchange}>
            <InputLabel>Sàn giao dịch</InputLabel>
            <Select
              label="Sàn giao dịch"
              name="exchange"
              value={formData.exchange}
              onChange={handleSelectChange}
              disabled={isReadOnly || isEditMode} // Disable in edit mode
              required
            >
              <MenuItem value="">
                <em>Chọn sàn giao dịch</em>
              </MenuItem>
              {exchangeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors.exchange && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                {errors.exchange}
              </Typography>
            )}
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Thông tin API
          </Typography>
        </Grid>

        {isEditMode && initialData?.api_key_masked && (
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="API Key hiện tại"
              value={initialData.api_key_masked}
              disabled
              helperText="Để trống nếu không muốn thay đổi API Key"
            />
          </Grid>
        )}

        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label={isEditMode ? "API Key mới (để trống nếu không đổi)" : "API Key"}
            name="api_key"
            type="password"
            value={formData.api_key}
            onChange={handleInputChange}
            error={!!errors.api_key}
            helperText={errors.api_key || (isEditMode ? "Để trống nếu không muốn thay đổi" : "")}
            disabled={isReadOnly}
            required={!isEditMode}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label={isEditMode ? "Secret Key mới (để trống nếu không đổi)" : "Secret Key"}
            name="secret_key"
            type="password"
            value={formData.secret_key}
            onChange={handleInputChange}
            error={!!errors.secret_key}
            helperText={errors.secret_key || (isEditMode ? "Để trống nếu không muốn thay đổi" : "")}
            disabled={isReadOnly}
            required={!isEditMode}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Cài đặt thông báo
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box>
            <Typography variant="body2" gutterBottom>
              Telegram Chat IDs
            </Typography>
            
            {/* Display existing chat IDs */}
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.chat_ids.map((chatId, index) => (
                <Chip
                  key={index}
                  label={chatId}
                  onDelete={isReadOnly ? undefined : () => handleRemoveChatId(index)}
                  deleteIcon={<DeleteIcon />}
                  size="small"
                />
              ))}
              {formData.chat_ids.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Chưa có chat ID nào
                </Typography>
              )}
            </Box>

            {/* Add new chat ID */}
            {!isReadOnly && (
              <TextField
                fullWidth
                label="Thêm Chat ID"
                value={newChatId}
                onChange={(e) => setNewChatId(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChatId();
                  }
                }}
                helperText="Nhập Telegram Chat ID để nhận thông báo"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleAddChatId}
                        disabled={!newChatId.trim()}
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default memo(TradingAccountForm, areEqual);
