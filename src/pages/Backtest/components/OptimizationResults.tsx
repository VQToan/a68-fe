import React, { useCallback, useMemo, memo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useBotOptimization } from "@/hooks/useBotOptimization";
import { useBacktest } from "@/hooks/useBacktest";
import { useBotTemplate } from "@/hooks/useBotTemplate";
import { useNotification } from "@/context/NotificationContext";
import type { OptimizedParameter } from "@/types/botOptimization.type";
import type { BacktestProcessCreate } from "@/types/backtest.type";
import { areEqual } from "@/utils/common";

interface OptimizationResultsProps {
  open: boolean;
  onClose: () => void;
}

const OptimizationResults: React.FC<OptimizationResultsProps> = ({
  open,
  onClose,
}) => {
  // Get hooks
  const { optimizationResults, clearResults } = useBotOptimization();
  const { createProcess } = useBacktest();
  const { templates } = useBotTemplate();
  const { showNotification } = useNotification();

  // Find the bot template for the optimized results
  const botTemplate = useMemo(() => {
    if (!optimizationResults) return null;
    return templates.find(
      (template) => template._id === optimizationResults.bot_template_id
    );
  }, [optimizationResults, templates]);

  // Close dialog handler
  const handleClose = useCallback(() => {
    onClose();
    clearResults();
  }, [onClose, clearResults]);

  // Create new backtest with optimized parameters
  const handleCreateBacktest = useCallback(async () => {
    if (!optimizationResults || !botTemplate) return;

    try {
      // Get current parameters from the bot template
      const currentParams = { ...botTemplate?.parameters || {} };
      
      // Apply optimized parameters
      optimizationResults.optimized_parameters.forEach((param) => {
        currentParams[param.name] = param.optimized_value;
      });

      // Create new backtest process
      const newBacktest: BacktestProcessCreate = {
        name: `${botTemplate.name} (Optimized)`,
        description: `Optimized version based on LLM analysis. ${optimizationResults.overall_explanation.substring(0, 100)}...`,
        bot_template_id: botTemplate._id,
        parameters: currentParams,
      };

      await createProcess(newBacktest);
      showNotification("Backtest mới đã được tạo với các tham số được tối ưu hóa", "success");
      handleClose();
    } catch (error) {
      console.error("Failed to create new backtest:", error);
      showNotification("Không thể tạo backtest mới", "error");
    }
  }, [optimizationResults, botTemplate, createProcess, showNotification, handleClose]);

  // Format parameter values for display
  const formatValue = useCallback((value: any) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "boolean") return value ? "True" : "False";
    if (typeof value === "number") return value.toString();
    return value;
  }, []);

  // Calculate improvement percentage 
  const calculateImprovement = useCallback((current: any, optimized: any) => {
    if (
      typeof current === "number" &&
      typeof optimized === "number" &&
      current !== 0
    ) {
      const percentChange = ((optimized - current) / Math.abs(current)) * 100;
      const isImprovement = 
        (current < 0 && optimized > current) || // If current is negative, any increase is improvement
        (current > 0 && optimized > current);   // If current is positive, any increase is improvement
        
      return {
        value: Math.abs(percentChange).toFixed(2),
        isImprovement,
      };
    }
    return null;
  }, []);

  if (!optimizationResults) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: "70vh" } }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div">
          Kết quả tối ưu hóa Bot
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {botTemplate?.name || ""}
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Giải thích tổng quan về tối ưu hóa
          </Typography>
          <Paper
            variant="outlined"
            sx={{ p: 2, bgcolor: "rgba(0, 0, 0, 0.02)" }}
          >
            <Typography variant="body1" whiteSpace="pre-wrap">
              {optimizationResults.overall_explanation}
            </Typography>
          </Paper>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Tham số được đề xuất tối ưu hóa
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Tham số</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Giá trị hiện tại</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Giá trị tối ưu</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Thay đổi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {optimizationResults.optimized_parameters.map(
                  (param: OptimizedParameter) => {
                    const improvement = calculateImprovement(
                      param.current_value,
                      param.optimized_value
                    );
                    
                    return (
                      <TableRow
                        key={param.name}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {param.name}
                        </TableCell>
                        <TableCell>{formatValue(param.current_value)}</TableCell>
                        <TableCell sx={{ fontWeight: "medium" }}>
                          {formatValue(param.optimized_value)}
                        </TableCell>
                        <TableCell>
                          {improvement ? (
                            <Chip
                              label={`${improvement.value}%`}
                              color={improvement.isImprovement ? "success" : "error"}
                              size="small"
                              variant="outlined"
                            />
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Chi tiết giải thích
          </Typography>
          
          {optimizationResults.optimized_parameters.map((param: OptimizedParameter) => (
            <Accordion key={param.name} variant="outlined" sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{param.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  <strong>Giá trị hiện tại:</strong> {formatValue(param.current_value)}
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Giá trị tối ưu:</strong> {formatValue(param.optimized_value)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                  {param.explanation}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Button onClick={handleClose} variant="outlined">
          Đóng
        </Button>
        <Button
          onClick={handleCreateBacktest}
          variant="contained"
          color="primary"
        >
          Tạo Backtest từ tham số tối ưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(OptimizationResults, areEqual);