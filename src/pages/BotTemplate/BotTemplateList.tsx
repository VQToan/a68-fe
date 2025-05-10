import React, { memo } from "react";
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
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { BotTemplate } from "../../types/botTemplate.types";
import { areEqual, formatDate } from "@/utils/common";

interface BotTemplateListProps {
  templates: BotTemplate[];
  isLoading: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string, name: string) => void;
  onView?: (id: string) => void;
}

const BotTemplateList: React.FC<BotTemplateListProps> = ({
  templates,
  isLoading,
  onEdit,
  onDelete,
  onView,
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (templates.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          Không có bot template nào được tìm thấy.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="bot templates table">
        <TableHead>
          <TableRow>
            <TableCell>Tên</TableCell>
            <TableCell>Mô tả</TableCell>
            <TableCell>Ngày tạo</TableCell>
            <TableCell>Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {templates.map((template) => (
            <TableRow
              key={template._id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              hover
            >
              <TableCell component="th" scope="row">
                {template.name}
              </TableCell>
              <TableCell>
                <Tooltip title={template.description} arrow>
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {template.description}
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell>{formatDate(template.created_at)}</TableCell>
              <TableCell>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {onView && (
                    <Tooltip title="Xem chi tiết">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => onView(template._id)}
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
                        onClick={() => onEdit(template._id)}
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
                        onClick={() => onDelete(template._id, template.name)}
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

export default memo(BotTemplateList, areEqual);
