import React, { memo } from 'react';
import { 
  Box, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import StickyTable from '@components/StickyTable';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { IModuleBot } from "@services/moduleBots.service";
import { areEqual, formatDate } from "@utils/common";
import { useTranslation } from 'react-i18next';

interface ModuleBotListProps {
  modules: IModuleBot[];
  isLoading: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string, name: string) => void;
  onView?: (id: string) => void;
}

// Helper function to truncate text with ellipsis
const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const ModuleBotList: React.FC<ModuleBotListProps> = ({ 
  modules, 
  isLoading,
  onEdit,
  onDelete,
  onView
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (modules.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body1" color="textSecondary">
          {t('moduleBot.list.empty')}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <StickyTable
        height="60vh"
        minWidth={900}
        head={
          <TableHead>
          <TableRow>
              <TableCell><strong>{t('moduleBot.list.headers.name')}</strong></TableCell>
              <TableCell><strong>{t('moduleBot.list.headers.nameInSource')}</strong></TableCell>
              <TableCell><strong>{t('moduleBot.list.headers.type')}</strong></TableCell>
              <TableCell><strong>{t('moduleBot.list.headers.isFuture')}</strong></TableCell>
              <TableCell><strong>{t('moduleBot.list.headers.description')}</strong></TableCell>
              <TableCell><strong>{t('moduleBot.list.headers.createdAt')}</strong></TableCell>
              <TableCell><strong>{t('moduleBot.list.headers.actions')}</strong></TableCell>
            </TableRow>
          </TableHead>
        }
        body={
          <TableBody>
            {modules.map((module) => (
              <TableRow key={module._id} hover>
                <TableCell>{module.name}</TableCell>
                <TableCell>
                  <Chip 
                    label={module.name_in_source} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={t(`moduleBot.types.${module.type ?? 'entry'}`, {
                      defaultValue: module.type ?? 'entry',
                    })}
                    size="small" 
                    color="secondary" 
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={module.is_future ? t('common.futures') : t('common.spot')}
                    size="small" 
                    color={module.is_future ? "warning" : "info"}
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title={module.description}>
                    <Typography variant="body2">
                      {truncateText(module.description)}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>{formatDate(module.created_at)}</TableCell>
                <TableCell>
                  <Box>
                    {onView && (
                      <Tooltip title={t('moduleBot.list.viewTooltip')}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => onView(module._id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {onEdit && (
                      <Tooltip title={t('moduleBot.list.editTooltip')}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => onEdit(module._id)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {onDelete && (
                      <Tooltip title={t('moduleBot.list.deleteTooltip')}>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => onDelete(module._id, module.name)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        }
      />
    </Paper>
  );
};

export default memo(ModuleBotList,areEqual);
