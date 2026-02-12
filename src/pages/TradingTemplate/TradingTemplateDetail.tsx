import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Divider,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Replay as ReplayIcon,
} from "@mui/icons-material";
import { formatDate } from "@/utils/common";
import { useTranslation } from "react-i18next";
import {
  useUpdateTradingTemplateMutation,
  useTradingTemplateByIdQuery,
  useRerunBacktestMutation,
} from "@/hooks/queries";
import type { RiskLevel, TradingStyle } from "@/types/tradingTemplate.type";
import { useNotification } from "@/context/NotificationContext";
import Modal from "@/components/Modal";

interface TradingTemplateDetailProps {
  templateId: string | null;
  open: boolean;
  onClose: () => void;
}

const TradingTemplateDetail: React.FC<TradingTemplateDetailProps> = ({
  templateId,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const updateMutation = useUpdateTradingTemplateMutation();
  const rerunBacktestMutation = useRerunBacktestMutation();

  // Supported languages
  const SUPPORTED_LANGUAGES = [
    { code: "en", label: "English" },
    { code: "vi", label: "Tiếng Việt" },
    { code: "zh", label: "中文" },
    { code: "hi", label: "हिन्दी" },
    { code: "ru", label: "Русский" },
    { code: "ar", label: "العربية" },
    { code: "ms", label: "Bahasa Melayu" },
    { code: "id", label: "Bahasa Indonesia" },
    { code: "th", label: "ไทย" },
    { code: "ko", label: "한국어" },
  ];

  const [activeLanguageTab, setActiveLanguageTab] = useState(0);

  const { data: template, isLoading } = useTradingTemplateByIdQuery(
    templateId || undefined,
  );

  const [formData, setFormData] = useState({
    name: "",
    description: {} as Record<string, string>,
    is_active: false,
    risk_level: "" as RiskLevel | "",
    trading_style: "" as TradingStyle | "",
  });

  const [parametersExpanded, setParametersExpanded] = useState(false);

  useEffect(() => {
    if (template) {
      // Initialize description object for all languages
      const descriptions: Record<string, string> = {};
      SUPPORTED_LANGUAGES.forEach((lang) => {
        descriptions[lang.code] = template.description?.[lang.code] || "";
      });

      setFormData({
        name: template.name,
        description: descriptions,
        is_active: template.is_active,
        risk_level: (template as any).risk_level || "",
        trading_style: (template as any).trading_style || "",
      });
    }
  }, [template]);

  // Helper to render module value
  const renderModule = (name?: string, id?: string) => {
    if (name) return name;
    if (id) return id; // Fallback to ID if name is missing
    return "-";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name: string) => (e: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    if (!template) return;
    try {
      // Filter out empty strings for optional fields
      const updateData: any = {
        name: formData.name,
        description: formData.description,
        is_active: formData.is_active,
      };

      if (formData.risk_level) {
        updateData.risk_level = formData.risk_level;
      }

      if (formData.trading_style) {
        updateData.trading_style = formData.trading_style;
      }

      await updateMutation.mutateAsync({
        id: template._id,
        data: updateData,
      });
      showNotification(
        t("tradingTemplate.notifications.updateSuccess", "Template updated"),
        "success",
      );
      onClose();
    } catch (error) {
      showNotification(
        t(
          "tradingTemplate.notifications.updateFailed",
          "Failed to update template",
        ),
        "error",
      );
      console.error(error);
    }
  };

  const handleRerunBacktest = async (period: "7d" | "30d" | "90d") => {
    if (!template) return;
    try {
      await rerunBacktestMutation.mutateAsync({
        id: template._id,
        period,
      });
      showNotification(
        t(
          "tradingTemplate.notifications.rerunBacktestSuccess",
          `Backtest rerun started for ${period}`,
        ),
        "success",
      );
    } catch (error) {
      showNotification(
        t(
          "tradingTemplate.notifications.rerunBacktestFailed",
          "Failed to rerun backtest",
        ),
        "error",
      );
      console.error(error);
    }
  };

  const renderFooter = () => (
    <>
      <Button onClick={onClose} variant="outlined" color="inherit">
        {t("common.close", "Close")}
      </Button>
      <Button
        onClick={handleSave}
        variant="contained"
        startIcon={<SaveIcon />}
        disabled={updateMutation.isPending || isLoading}
      >
        {updateMutation.isPending
          ? t("common.saving", "Saving...")
          : t("common.save", "Save")}
      </Button>
    </>
  );

  if (isLoading || !template) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title={t("tradingTemplate.detail.title", "Template Details")}
        maxWidth="md"
      >
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      </Modal>
    );
  }

  // Access bot_modules safely
  const { bot_modules } = template;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("tradingTemplate.detail.title", "Template Details")}
      maxWidth="md"
      footer={renderFooter()}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t("tradingTemplate.detail.name", "Name")}
              </Typography>
              <TextField
                fullWidth
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t("tradingTemplate.detail.createdAt", "Created At")}
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ mt: 0.5 }}>
                {formatDate(template.created_at)}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {t("tradingTemplate.detail.description", "Description")}
              </Typography>
              <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Tabs
                  value={activeLanguageTab}
                  onChange={(_, newValue) => setActiveLanguageTab(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <Tab key={lang.code} label={lang.label} />
                  ))}
                </Tabs>
              </Box>
              {SUPPORTED_LANGUAGES.map((lang, index) => (
                <Box
                  key={lang.code}
                  role="tabpanel"
                  hidden={activeLanguageTab !== index}
                  sx={{
                    display: activeLanguageTab === index ? "block" : "none",
                  }}
                >
                  {activeLanguageTab === index && (
                    <TextField
                      fullWidth
                      name={`description_${lang.code}`}
                      value={formData.description[lang.code] || ""}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          description: {
                            ...prev.description,
                            [lang.code]: e.target.value,
                          },
                        }));
                      }}
                      multiline
                      rows={4}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>
              ))}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <InputLabel id="risk-level-label">
                  {t("tradingTemplate.fields.riskLevel", "Risk Level")}
                </InputLabel>
                <Select
                  labelId="risk-level-label"
                  value={formData.risk_level}
                  label={t("tradingTemplate.fields.riskLevel", "Risk Level")}
                  onChange={handleSelectChange("risk_level")}
                >
                  <MenuItem value="low">
                    {t("tradingTemplate.riskLevels.low", "Low Risk")}
                  </MenuItem>
                  <MenuItem value="medium">
                    {t("tradingTemplate.riskLevels.medium", "Medium Risk")}
                  </MenuItem>
                  <MenuItem value="high">
                    {t("tradingTemplate.riskLevels.high", "High Risk")}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <InputLabel id="trading-style-label">
                  {t("tradingTemplate.fields.tradingStyle", "Trading Style")}
                </InputLabel>
                <Select
                  labelId="trading-style-label"
                  value={formData.trading_style}
                  label={t(
                    "tradingTemplate.fields.tradingStyle",
                    "Trading Style",
                  )}
                  onChange={handleSelectChange("trading_style")}
                >
                  <MenuItem value="scalping">
                    {t("tradingTemplate.tradingStyles.scalping", "Scalping")}
                  </MenuItem>
                  <MenuItem value="day_trade">
                    {t("tradingTemplate.tradingStyles.day_trade", "Day Trade")}
                  </MenuItem>
                  <MenuItem value="swing">
                    {t("tradingTemplate.tradingStyles.swing", "Swing")}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t("tradingTemplate.detail.type", "Type")}
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={
                    template.is_future
                      ? t("common.futures", "Futures")
                      : t("common.spot", "Spot")
                  }
                  color={template.is_future ? "warning" : "info"}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t("tradingTemplate.detail.status", "Status")}
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={handleChange}
                      name="is_active"
                      color="success"
                    />
                  }
                  label={
                    formData.is_active
                      ? t("common.active", "Active")
                      : t("common.inactive", "Inactive")
                  }
                />
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            {t("tradingTemplate.detail.backtest", "Backtest")}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t(
                "tradingTemplate.detail.rerunBacktestDescription",
                "Rerun backtest for specific periods to update metrics",
              )}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                startIcon={<ReplayIcon />}
                onClick={() => handleRerunBacktest("7d")}
                disabled={rerunBacktestMutation.isPending}
                size="small"
              >
                {t("tradingTemplate.detail.rerun7d", "Rerun 7 Days")}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ReplayIcon />}
                onClick={() => handleRerunBacktest("30d")}
                disabled={rerunBacktestMutation.isPending}
                size="small"
              >
                {t("tradingTemplate.detail.rerun30d", "Rerun 30 Days")}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ReplayIcon />}
                onClick={() => handleRerunBacktest("90d")}
                disabled={rerunBacktestMutation.isPending}
                size="small"
              >
                {t("tradingTemplate.detail.rerun90d", "Rerun 90 Days")}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            {t("tradingTemplate.detail.modules", "Modules")}
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("tradingTemplate.fields.entryModule", "Entry Module")}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                  {renderModule(
                    bot_modules?.entry?.name,
                    bot_modules?.entry?._id,
                  )}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("tradingTemplate.fields.exitModule", "Exit Module")}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                  {renderModule(
                    bot_modules?.exit?.name,
                    bot_modules?.exit?._id,
                  )}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t(
                    "tradingTemplate.fields.stopLossModule",
                    "Stop Loss Module",
                  )}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                  {renderModule(
                    bot_modules?.stop_loss?.name,
                    bot_modules?.stop_loss?._id,
                  )}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t(
                    "tradingTemplate.fields.dcaCutlossModule",
                    "DCA/Cutloss Module",
                  )}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                  {renderModule(
                    bot_modules?.dca_cutloss?.name,
                    bot_modules?.dca_cutloss?._id,
                  )}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t(
                    "tradingTemplate.fields.entryHedgeModule",
                    "Entry Hedge Module",
                  )}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                  {renderModule(
                    bot_modules?.entry_hedge?.name,
                    bot_modules?.entry_hedge?._id,
                  )}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t(
                    "tradingTemplate.fields.afterHedgeModule",
                    "After Hedge Module",
                  )}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                  {renderModule(
                    bot_modules?.after_hedge?.name,
                    bot_modules?.after_hedge?._id,
                  )}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Parameters Section */}
          {template.parameters &&
            Object.keys(template.parameters).length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />

                <Box>
                  <Button
                    onClick={() => setParametersExpanded(!parametersExpanded)}
                    endIcon={
                      parametersExpanded ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )
                    }
                    sx={{ mb: 1 }}
                  >
                    {t("tradingTemplate.detail.parameters", "Parameters")} (
                    {Object.keys(template.parameters).length})
                  </Button>

                  <Collapse in={parametersExpanded}>
                    <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                      <Grid container spacing={2}>
                        {Object.entries(template.parameters).map(
                          ([key, value]) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={key}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", mb: 0.5 }}
                              >
                                {key}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ wordBreak: "break-word" }}
                              >
                                {typeof value === "object"
                                  ? JSON.stringify(value, null, 2)
                                  : String(value)}
                              </Typography>
                            </Grid>
                          ),
                        )}
                      </Grid>
                    </Paper>
                  </Collapse>
                </Box>
              </>
            )}
        </Box>
      </Box>
    </Modal>
  );
};

export default TradingTemplateDetail;
