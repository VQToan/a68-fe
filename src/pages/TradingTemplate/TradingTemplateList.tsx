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
  Switch,
} from "@mui/material";
import StickyTable from "@components/StickyTable";
import { TableSkeleton } from "@components/skeletons";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { TradingTemplate } from "@/types/tradingTemplate.type";
import { areEqual } from "@/utils/common";
import { useTranslation } from "react-i18next";

interface TradingTemplateListProps {
  templates: TradingTemplate[];
  isLoading: boolean;
  onEdit?: (template: TradingTemplate) => void;
  onDelete?: (id: string, name: string) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
  onView?: (template: TradingTemplate) => void;
}

const TradingTemplateList: React.FC<TradingTemplateListProps> = ({
  templates,
  isLoading,
  onEdit,
  onDelete,
  onToggleActive,
  onView,
}) => {
  const { t, i18n } = useTranslation();

  // Helper to get description in current language or fallback
  const getDescription = (description?: Record<string, string>): string => {
    if (!description || typeof description !== "object") return "-";

    // Try current language
    const currentLang = i18n.language;
    if (description[currentLang]) return description[currentLang];

    // Try English as fallback
    if (description.en) return description.en;

    // Try Vietnamese as second fallback
    if (description.vi) return description.vi;

    // Return first available description
    const firstDesc = Object.values(description).find((desc) => desc);
    return firstDesc || "-";
  };

  if (isLoading) {
    return <TableSkeleton columns={5} rows={5} hasActions />;
  }

  if (templates.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          {t("tradingTemplate.list.empty", "No trading templates found")}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ overflow: "hidden" }}>
      <StickyTable
        height="60vh"
        minWidth={800}
        head={
          <TableHead>
            <TableRow>
              <TableCell>
                {t("tradingTemplate.list.headers.name", "Name")}
              </TableCell>
              <TableCell>
                {t("tradingTemplate.list.headers.description", "Description")}
              </TableCell>
              <TableCell>
                {t("tradingTemplate.list.headers.isActive", "Active")}
              </TableCell>
              <TableCell>
                {t("tradingTemplate.list.headers.actions", "Actions")}
              </TableCell>
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
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    fontWeight: "medium",
                    cursor: onView ? "pointer" : "default",
                    "&:hover": {
                      textDecoration: onView ? "underline" : "none",
                    },
                  }}
                  onClick={() => onView && onView(template)}
                >
                  {template.name}
                </TableCell>
                <TableCell>
                  <Tooltip title={getDescription(template.description)} arrow>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 300,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getDescription(template.description)}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {onToggleActive && (
                    <Switch
                      size="small"
                      checked={template.is_active}
                      onChange={(e) =>
                        onToggleActive(template._id, e.target.checked)
                      }
                      color="success"
                      sx={{ ml: 1 }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {onEdit && (
                      <Tooltip title={t("common.edit", "Edit")}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onEdit(template)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {onDelete && (
                      <Tooltip title={t("common.delete", "Delete")}>
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

export default memo(TradingTemplateList, areEqual);
