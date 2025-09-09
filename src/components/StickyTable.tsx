import { memo, type ReactNode } from 'react';
import { TableContainer, Table, type SxProps, type Theme } from '@mui/material';
import { areEqual } from '@/utils/common';

interface StickyTableProps {
  head: ReactNode; // <TableHead>...</TableHead>
  body: ReactNode; // <TableBody>...</TableBody>
  height?: number | string; // max height of scroll area
  minWidth?: number | string; // min width to trigger horizontal scroll
  containerSx?: SxProps<Theme>;
  tableSx?: SxProps<Theme>;
}

const StickyTable = ({
  head,
  body,
  height = '60vh',
  minWidth = 800,
  containerSx,
  tableSx,
}: StickyTableProps) => {
  return (
    <TableContainer
      sx={{
        maxHeight: height,
        width: '100%',
        overflow: 'auto', // both axes
        // Ensure inner sticky headers look correct on dark theme
        '& .MuiTableCell-stickyHeader': {
          backgroundColor: (theme) => theme.palette.background.paper,
          zIndex: 2,
        },
        ...containerSx,
      }}
    >
      <Table stickyHeader sx={{ minWidth, ...tableSx }}>
        {head}
        {body}
      </Table>
    </TableContainer>
  );
};

export default memo(StickyTable, areEqual);

