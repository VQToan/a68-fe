import { useState } from "react";
import {
  Box,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  TrendingUp as OpenLongIcon,
  TrendingDown as OpenShortIcon,
  Close as CloseIcon,
  Remove as PartialCloseIcon,
} from "@mui/icons-material";
import type { PositionSummary } from "@/types/trading.types";

interface PositionActionButtonsProps {
  position: PositionSummary;
  onOpenPosition: (symbol: string, side: "BUY" | "SELL", positionSide: "LONG" | "SHORT") => void;
  onClosePosition: (symbol: string, positionSide: "LONG" | "SHORT" | "BOTH") => void;
  onPartialClosePosition: (position: PositionSummary) => void;
}

const PositionActionButtons = ({
  position,
  onOpenPosition,
  onClosePosition,
  onPartialClosePosition,
}: PositionActionButtonsProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenLong = () => {
    onOpenPosition(position.symbol, "BUY", "LONG");
    handleClose();
  };

  const handleOpenShort = () => {
    onOpenPosition(position.symbol, "SELL", "SHORT");
    handleClose();
  };

  const handleClosePosition = () => {
    onClosePosition(position.symbol, position.position_side as "LONG" | "SHORT" | "BOTH");
    handleClose();
  };

  const handlePartialClose = () => {
    onPartialClosePosition(position);
    handleClose();
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {/* Quick Close Button */}
      <Tooltip title="Đóng lệnh">
        <IconButton
          size="small"
          color="error"
          onClick={handleClosePosition}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* More Actions Menu */}
      <Tooltip title="Thêm hành động">
        <IconButton
          size="small"
          onClick={handleClick}
          aria-controls={open ? 'position-actions-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        id="position-actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'position-actions-button',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleOpenLong}>
          <OpenLongIcon sx={{ mr: 1 }} color="success" />
          Mở Long {position.symbol}
        </MenuItem>
        <MenuItem onClick={handleOpenShort}>
          <OpenShortIcon sx={{ mr: 1 }} color="error" />
          Mở Short {position.symbol}
        </MenuItem>
        <MenuItem onClick={handlePartialClose}>
          <PartialCloseIcon sx={{ mr: 1 }} color="warning" />
          Đóng một phần
        </MenuItem>
        <MenuItem onClick={handleClosePosition}>
          <CloseIcon sx={{ mr: 1 }} color="error" />
          Đóng toàn bộ lệnh
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PositionActionButtons;
