import { memo } from "react";
import {
  Box,
  Paper,
  Skeleton,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import StickyTable from "@components/StickyTable";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  hasActions?: boolean;
  showPagination?: boolean;
  height?: string | number;
}

/**
 * Skeleton component for table loading states.
 * Displays a realistic table skeleton with animated placeholders.
 */
const TableSkeleton = ({
  columns,
  rows = 5,
  hasActions = false,
  showPagination = false,
  height = "60vh",
}: TableSkeletonProps) => {
  // Generate column widths based on column count
  const getColumnWidth = (index: number): string => {
    // First column usually has more content
    if (index === 0) return "150px";
    // Last column for actions is smaller
    if (hasActions && index === columns - 1) return "100px";
    // Default width
    return "120px";
  };

  return (
    <Paper sx={{ overflow: "hidden", borderRadius: 2 }}>
      <StickyTable
        height={height}
        minWidth={columns * 100}
        head={
          <TableHead>
            <TableRow>
              {Array.from({ length: columns }).map((_, index) => (
                <TableCell key={`header-${index}`}>
                  <Skeleton
                    variant="text"
                    width={getColumnWidth(index)}
                    height={24}
                    animation="wave"
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        }
        body={
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={`row-${rowIndex}`}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                    {hasActions && colIndex === columns - 1 ? (
                      // Actions column with icon skeletons
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Skeleton
                          variant="circular"
                          width={28}
                          height={28}
                          animation="wave"
                        />
                        <Skeleton
                          variant="circular"
                          width={28}
                          height={28}
                          animation="wave"
                        />
                        <Skeleton
                          variant="circular"
                          width={28}
                          height={28}
                          animation="wave"
                        />
                      </Box>
                    ) : colIndex === 2 || colIndex === 3 ? (
                      // Chip-like skeleton for status columns
                      <Skeleton
                        variant="rounded"
                        width={70}
                        height={24}
                        animation="wave"
                      />
                    ) : (
                      // Regular text skeleton
                      <Skeleton
                        variant="text"
                        width={`${60 + Math.random() * 30}%`}
                        height={20}
                        animation="wave"
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        }
      />
      {showPagination && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            p: 2,
            gap: 2,
          }}
        >
          <Skeleton variant="text" width={120} height={20} animation="wave" />
          <Skeleton variant="rounded" width={80} height={32} animation="wave" />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Skeleton
              variant="circular"
              width={32}
              height={32}
              animation="wave"
            />
            <Skeleton
              variant="circular"
              width={32}
              height={32}
              animation="wave"
            />
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default memo(TableSkeleton);
