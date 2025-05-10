import React, { memo } from 'react';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { IModuleBot } from "@services/moduleBots.service";
import { areEqual, formatDate } from "@utils/common";

interface ModuleBotListProps {
  modules: IModuleBot[];
  isLoading: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string, name: string) => void;
  onView?: (id: string) => void;
}

const ModuleBotList: React.FC<ModuleBotListProps> = ({ 
  modules, 
  isLoading,
  onEdit,
  onDelete,
  onView
}) => {
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
          Không tìm thấy module nào. Hãy thêm module mới.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Tên</strong></TableCell>
            <TableCell><strong>Name in Source</strong></TableCell>
            <TableCell><strong>Loại</strong></TableCell>
            <TableCell><strong>Mô tả</strong></TableCell>
            <TableCell><strong>Ngày tạo</strong></TableCell>
            <TableCell><strong>Thao tác</strong></TableCell>
          </TableRow>
        </TableHead>
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
                  label={module.type || "entry"} 
                  size="small" 
                  color="secondary" 
                  variant="outlined" 
                />
              </TableCell>
              <TableCell>{module.description}</TableCell>
              <TableCell>{formatDate(module.created_at)}</TableCell>
              <TableCell>
                <Box>
                  {onView && (
                    <Tooltip title="Xem chi tiết">
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
                    <Tooltip title="Sửa">
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
                    <Tooltip title="Xóa">
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
      </Table>
    </TableContainer>
  );
};

export default memo(ModuleBotList,areEqual);