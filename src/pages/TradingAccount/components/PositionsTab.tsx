import { memo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Fab,
} from "@mui/material";
import StickyTable from "@components/StickyTable";
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import type { 
  PositionSummary, 
  OpenPositionRequest, 
  ClosePositionRequest, 
  ClosePartialPositionRequest 
} from "@/types/trading.types";
import { areEqual } from "@/utils/common";
import PositionActionButtons from "./PositionActionButtons";
import OpenPositionDialog from "./OpenPositionDialog";
import ClosePositionDialog from "./ClosePositionDialog";
import ClosePartialPositionDialog from "./ClosePartialPositionDialog";

interface PositionsTabProps {
  positions: PositionSummary[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenPosition: (data: OpenPositionRequest) => Promise<void>;
  onClosePosition: (data: ClosePositionRequest) => Promise<void>;
  onClosePartialPosition: (data: ClosePartialPositionRequest) => Promise<void>;
}

const PositionsTab = ({
  positions,
  isLoading,
  onRefresh,
  onOpenPosition,
  onClosePosition,
  onClosePartialPosition,
}: PositionsTabProps) => {
  // Dialog states
  const [openPositionDialog, setOpenPositionDialog] = useState(false);
  const [closePositionDialog, setClosePositionDialog] = useState(false);
  const [closePartialDialog, setClosePartialDialog] = useState(false);
  
  // Selected position for actions
  const [selectedPosition, setSelectedPosition] = useState<PositionSummary | null>(null);
  
  // Form states for opening new position
  const [newPositionData, setNewPositionData] = useState<{
    symbol: string;
    side: "BUY" | "SELL";
    positionSide: "LONG" | "SHORT";
  }>({
    symbol: "",
    side: "BUY",
    positionSide: "LONG",
  });

  // Handle opening new position dialog
  const handleOpenNewPosition = () => {
    setNewPositionData({
      symbol: "",
      side: "BUY",
      positionSide: "LONG",
    });
    setOpenPositionDialog(true);
  };

  // Handle opening position with pre-filled data
  const handleOpenPositionWithSymbol = (symbol: string, side: "BUY" | "SELL", positionSide: "LONG" | "SHORT") => {
    setNewPositionData({
      symbol,
      side,
      positionSide,
    });
    setOpenPositionDialog(true);
  };

  // Handle closing position
  const handleClosePosition = (symbol: string, positionSide: "LONG" | "SHORT" | "BOTH") => {
    const position = positions.find(p => p.symbol === symbol && p.position_side === positionSide);
    if (position) {
      setSelectedPosition(position);
      setClosePositionDialog(true);
    }
  };

  // Handle partial close position
  const handlePartialClosePosition = (position: PositionSummary) => {
    setSelectedPosition(position);
    setClosePartialDialog(true);
  };

  // Handle dialog submissions
  const handleOpenPositionSubmit = async (data: OpenPositionRequest) => {
    await onOpenPosition(data);
    setOpenPositionDialog(false);
  };

  const handleClosePositionSubmit = async (data: ClosePositionRequest) => {
    await onClosePosition(data);
    setClosePositionDialog(false);
    setSelectedPosition(null);
  };

  const handleClosePartialPositionSubmit = async (data: ClosePartialPositionRequest) => {
    await onClosePartialPosition(data);
    setClosePartialDialog(false);
    setSelectedPosition(null);
  };

  // Handle dialog close
  const handleDialogClose = (dialogType: 'open' | 'close' | 'partial') => {
    switch (dialogType) {
      case 'open':
        setOpenPositionDialog(false);
        break;
      case 'close':
        setClosePositionDialog(false);
        setSelectedPosition(null);
        break;
      case 'partial':
        setClosePartialDialog(false);
        setSelectedPosition(null);
        break;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h6">
          Lệnh đang mở ({positions.length})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={isLoading}
          size="small"
        >
          {isLoading ? "Đang tải..." : "Làm mới"}
        </Button>
      </Box>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : positions.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
            Không có lệnh nào đang mở
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenNewPosition}
          >
            Mở lệnh mới
          </Button>
        </Box>
      ) : (
        <>
          <StickyTable
            height="60vh"
            minWidth={1000}
            head={
              <TableHead>
                <TableRow>
                  <TableCell>Mã lệnh</TableCell>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Giá vào</TableCell>
                  <TableCell>Giá hiện tại</TableCell>
                  <TableCell>Liquid</TableCell>
                  <TableCell>PnL</TableCell>
                  <TableCell>Thời gian</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
            }
            body={
              <TableBody>
                {positions.map((position: PositionSummary, index: number) => (
                  <TableRow key={`${position.order_id}-${index}`} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {position.order_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {position.symbol}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${position.side} ${position.position_side}`}
                        color={position.side === "BUY" ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {position.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        ${position.entry_price.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        ${position.mark_price.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        ${position.liquidation_price.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography 
                          variant="body2" 
                          color={position.unrealized_pnl >= 0 ? "success.main" : "error.main"}
                        >
                          ${position.unrealized_pnl.toFixed(2)}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color={position.pnl_percentage >= 0 ? "success.main" : "error.main"}
                        >
                          ({position.pnl_percentage.toFixed(2)}%)
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(position.timestamp).toLocaleString('vi-VN')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <PositionActionButtons
                        position={position}
                        onOpenPosition={handleOpenPositionWithSymbol}
                        onClosePosition={handleClosePosition}
                        onPartialClosePosition={handlePartialClosePosition}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            }
          />

          {/* Floating Action Button for New Position */}
          <Fab
            color="primary"
            aria-label="add"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={handleOpenNewPosition}
          >
            <AddIcon />
          </Fab>
        </>
      )}

      {/* Dialogs */}
      <OpenPositionDialog
        open={openPositionDialog}
        onClose={() => handleDialogClose('open')}
        onSubmit={handleOpenPositionSubmit}
        initialSymbol={newPositionData.symbol}
        initialSide={newPositionData.side}
        initialPositionSide={newPositionData.positionSide}
      />

      <ClosePositionDialog
        open={closePositionDialog}
        onClose={() => handleDialogClose('close')}
        onSubmit={handleClosePositionSubmit}
        position={selectedPosition}
      />

      <ClosePartialPositionDialog
        open={closePartialDialog}
        onClose={() => handleDialogClose('partial')}
        onSubmit={handleClosePartialPositionSubmit}
        position={selectedPosition}
      />
    </Box>
  );
};

export default memo(PositionsTab, areEqual);
