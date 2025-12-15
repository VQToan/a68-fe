import { useState } from "react";
import { Box, Menu, MenuItem, IconButton, Tooltip } from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  TrendingUp as OpenLongIcon,
  TrendingDown as OpenShortIcon,
  Close as CloseIcon,
  Remove as PartialCloseIcon,
  Flag as TPSLIcon,
} from "@mui/icons-material";
import type { PositionSummary } from "@/types/trading.types";
import { useTranslation } from "react-i18next";

interface PositionActionButtonsProps {
  position: PositionSummary;
  onOpenPosition: (
    symbol: string,
    side: "BUY" | "SELL",
    positionSide: "BOTH" | "LONG" | "SHORT"
  ) => void;
  onClosePosition: (
    symbol: string,
    positionSide: "LONG" | "SHORT" | "BOTH"
  ) => void;
  onPartialClosePosition: (position: PositionSummary) => void;
  onTPSL?: (position: PositionSummary) => void;
}

const PositionActionButtons = ({
  position,
  onOpenPosition,
  onClosePosition,
  onPartialClosePosition,
  onTPSL,
}: PositionActionButtonsProps) => {
  const { t } = useTranslation();
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
    onClosePosition(
      position.symbol,
      position.position_side as "LONG" | "SHORT" | "BOTH"
    );
    handleClose();
  };

  const handlePartialClose = () => {
    onPartialClosePosition(position);
    handleClose();
  };

  const handleTPSL = () => {
    if (onTPSL) {
      onTPSL(position);
    }
    handleClose();
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {/* Quick Close Button */}
      <Tooltip title={t("tradingAccount.detail.positions.tooltips.close")}>
        <IconButton size="small" color="error" onClick={handleClosePosition}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* More Actions Menu */}
      <Tooltip
        title={t("tradingAccount.detail.positions.tooltips.moreActions")}
      >
        <IconButton
          size="small"
          onClick={handleClick}
          aria-controls={open ? "position-actions-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
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
          "aria-labelledby": "position-actions-button",
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleOpenLong}>
          <OpenLongIcon sx={{ mr: 1 }} color="success" />
          {t("tradingAccount.detail.positions.actions.openLong", {
            symbol: position.symbol,
          })}
        </MenuItem>
        <MenuItem onClick={handleOpenShort}>
          <OpenShortIcon sx={{ mr: 1 }} color="error" />
          {t("tradingAccount.detail.positions.actions.openShort", {
            symbol: position.symbol,
          })}
        </MenuItem>
        <MenuItem onClick={handlePartialClose}>
          <PartialCloseIcon sx={{ mr: 1 }} color="warning" />
          {t("tradingAccount.detail.positions.actions.closePartial")}
        </MenuItem>
        <MenuItem onClick={handleClosePosition}>
          <CloseIcon sx={{ mr: 1 }} color="error" />
          {t("tradingAccount.detail.positions.actions.closeAll")}
        </MenuItem>
        {onTPSL && (
          <MenuItem onClick={handleTPSL}>
            <TPSLIcon sx={{ mr: 1 }} color="info" />
            {t("tradingAccount.detail.positions.actions.tpsl")}
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default PositionActionButtons;
