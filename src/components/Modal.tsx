import { memo, type ReactNode, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  IconButton,
  Divider,
  type DialogProps,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { areEqual } from '@/utils/common';

interface ModalProps extends Omit<DialogProps, 'title'> {
  open: boolean;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: DialogProps['maxWidth'];
  fullWidth?: boolean;
  fullScreen?: boolean;
  disableCloseButton?: boolean;
  onClose: () => void;
  contentSx?: Record<string, any>;
  scroll?: DialogProps['scroll'];
}

const Modal = ({
  open,
  title,
  children,
  footer,
  maxWidth = 'sm',
  fullWidth = true,
  fullScreen: fullScreenProp,
  disableCloseButton = false,
  onClose,
  contentSx,
  scroll = 'paper',
  ...other
}: ModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fullScreen = fullScreenProp || isMobile;
  
  const contentRef = useRef<HTMLElement>(null);
  
  // Focus on content when modal opens (for accessibility)
  useEffect(() => {
    if (open) {
      const { current: contentElement } = contentRef;
      if (contentElement !== null) {
        contentElement.focus();
      }
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      fullScreen={fullScreen}
      scroll={scroll}
      aria-labelledby="modal-dialog-title"
      aria-describedby="modal-dialog-content"
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 1,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: fullScreen ? '100%' : '90vh', // Ensure proper height constraints
        }
      }}
      {...other}
    >
      {/* Header */}
      <DialogTitle 
        id="modal-dialog-title"
        sx={{ 
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        {!disableCloseButton && (
          <IconButton 
            onClick={onClose} 
            size="small" 
            aria-label="close"
            sx={{ 
              p: 0.5,
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      {/* Content with scroll capability */}
      <DialogContent 
        id="modal-dialog-content"
        ref={contentRef}
        dividers={scroll === 'paper'}
        sx={{ 
          p: 2, 
          overflowY: 'auto',
          flexGrow: 1,
          ...contentSx
        }}
        tabIndex={-1}
      >
        {children}
      </DialogContent>

      {/* Footer with action buttons */}
      {footer && (
        <>
          {scroll === 'body' && <Divider />}
          <DialogActions 
            sx={{ 
              p: 2,
              justifyContent: 'flex-end',
              gap: 1
            }}
          >
            {footer}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default memo(Modal, areEqual);