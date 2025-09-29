import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { PositionSummary } from '@/types/trading.types';
import * as tradingAccountService from '@services/tradingAccount.service';
import { areEqual } from '@/utils/common';
import { useTranslation } from 'react-i18next';

interface StopTradingConfirmDialogProps {
  open: boolean;
  processName?: string;
  accountId?: string | null;
  symbol?: string | null;
  onClose: () => void;
  onStop: (clearPositions: boolean) => Promise<void> | void;
}

const formatNumber = (value?: number | null, maximumFractionDigits: number = 4) => {
  if (value === undefined || value === null || Number.isNaN(value)) return '-';
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits,
  }).format(value);
};

const StopTradingConfirmDialog: React.FC<StopTradingConfirmDialogProps> = ({
  open,
  processName,
  accountId,
  symbol,
  onClose,
  onStop,
}) => {
  const [positions, setPositions] = useState<PositionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) {
      setPositions([]);
      setError(null);
      setIsLoading(false);
      setIsSubmitting(false);
      return;
    }

    if (!accountId) {
      setPositions([]);
      setError(null);
      return;
    }

    const fetchPositions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await tradingAccountService.getPositions(accountId, symbol ?? undefined);
        setPositions(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        const fallbackMessage = t('trading.stopDialog.errors.loadPositions');
        const message = fetchError instanceof Error ? fetchError.message : fallbackMessage;
        setError(message);
        setPositions([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPositions();
  }, [open, accountId, symbol, t]);

  const handleStop = useCallback(async (clearPositions: boolean) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onStop(clearPositions);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, onStop]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 1.5,
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h6">{t('trading.stopDialog.title')}</Typography>
          {processName && (
            <Typography variant="caption" color="text.secondary">
              {processName}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ p: 0.5 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, px: 3, pb: 1 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body1" fontWeight={500} gutterBottom>
              {t('trading.stopDialog.description')}
            </Typography>
            {symbol && (
              <Typography variant="body2" color="text.secondary">
                {t('trading.stopDialog.symbol', { symbol })}
              </Typography>
            )}
          </Box>

          {accountId ? (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('trading.stopDialog.sections.runningPositions')}
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {error}
                </Alert>
              )}

              {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                  <CircularProgress size={24} />
                </Box>
              ) : positions.length > 0 ? (
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    maxHeight: 240,
                    overflowY: 'auto',
                  }}
                >
                  {positions.map((position, index) => (
                    <React.Fragment key={`${position.order_id}-${index}`}>
                      <Box px={2} py={1.5}>
                        <Typography variant="body2" fontWeight={600}>
                          {t('trading.stopDialog.positionLabel', {
                            symbol: position.symbol,
                            side: position.side,
                          })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('trading.stopDialog.positionDetails', {
                            quantity: formatNumber(position.quantity),
                            entry: formatNumber(position.entry_price),
                            pnl: formatNumber(position.unrealized_pnl, 2),
                          })}
                        </Typography>
                        {position.position_side && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {t('trading.stopDialog.positionSide', {
                              side: position.position_side,
                            })}
                          </Typography>
                        )}
                      </Box>
                      {index < positions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('trading.stopDialog.emptyPositions')}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('trading.stopDialog.noAccount')}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={() => handleStop(false)}
          variant="contained"
          color="warning"
          disabled={isSubmitting}
        >
          {t('trading.stopDialog.actions.stop')}
        </Button>
        <Button
          onClick={() => handleStop(true)}
          variant="contained"
          color="error"
          disabled={isSubmitting}
        >
          {t('trading.stopDialog.actions.stopAndClose')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(StopTradingConfirmDialog, areEqual);
