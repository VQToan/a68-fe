import React, { memo } from "react";
import {
  Box,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
} from "@mui/material";
import StickyTable from "@components/StickyTable";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import type { BotTemplate } from "../../types/botTemplate.types";
import { areEqual, formatDate } from "@/utils/common";
import { useTranslation } from "react-i18next";

interface BotTemplateListProps {
  templates: BotTemplate[];
  isLoading: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string, name: string) => void;
  onView?: (id: string) => void;
  onDuplicate?: (template: BotTemplate) => void;
}

const BotTemplateList: React.FC<BotTemplateListProps> = ({
  templates,
  isLoading,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
}) => {
  const { t } = useTranslation();
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
          {t("botTemplate.list.empty")}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      <StickyTable
        height="60vh"
        minWidth={800}
        head={
          <TableHead>
            <TableRow>
              <TableCell>{t("botTemplate.list.headers.name")}</TableCell>
              <TableCell>{t("botTemplate.list.headers.description")}</TableCell>
              <TableCell>{t("botTemplate.list.headers.isFuture")}</TableCell>
              <TableCell>{t("botTemplate.list.headers.createdAt")}</TableCell>
              <TableCell>{t("botTemplate.list.headers.actions")}</TableCell>
            </TableRow>
          </TableHead>
        }
        body={
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
                <TableCell>
                  <Chip 
                    label={template.is_future ? t('common.futures') : t('common.spot')}
                    size="small" 
                    color={template.is_future ? "warning" : "info"}
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell>{formatDate(template.created_at)}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {onView && (
                      <Tooltip title={t("botTemplate.list.tooltips.view")}>
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
                      <Tooltip title={t("botTemplate.list.tooltips.edit")}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onEdit(template._id)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {onDuplicate && (
                      <Tooltip title={t("common.duplicate")}>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => onDuplicate(template)}
                        >
                          <FileCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {onDelete && (
                      <Tooltip title={t("botTemplate.list.tooltips.delete")}>
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
        }
      />
    </Paper>
  );
};

export default memo(BotTemplateList, areEqual);
