// src/components/common/ModernTable.tsx
import React, { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { colors, typography, spacing, borderRadius, shadows, animations } from '../../config/designSystem';

// Generic column definition interface
interface TableColumn<T> {
  id: keyof T | string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => ReactNode;
  sortable?: boolean;
}

// Generic table props interface
export interface ModernTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
  stickyHeader?: boolean;
  maxHeight?: string;
  headerColor?: string;
  headerTextColor?: string;
  rowHeight?: string;
  showRowNumbers?: boolean;
  className?: string;
}

// Default empty message component
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: spacing[12],
      color: colors.text.secondary,
    }}
  >
    <Typography variant="body1" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
      {message}
    </Typography>
  </Box>
);

// Loading state component
const LoadingState: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      py: spacing[12],
    }}
  >
    <CircularProgress size={40} />
  </Box>
);

// Generic modern table component
function ModernTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  stickyHeader = false,
  maxHeight,
  headerColor = colors.primary[500],
  headerTextColor = colors.text.inverse,
  rowHeight = '72px',
  showRowNumbers = false,
  className,
}: ModernTableProps<T>) {
  // Calculate total columns including row numbers if enabled
  const totalColumns = columns.length + (showRowNumbers ? 1 : 0);

  return (
    <TableContainer
      component={Paper}
      className={className}
      sx={{
        borderRadius: borderRadius['2xl'],
        boxShadow: shadows.lg,
        border: `1px solid ${colors.neutral[200]}`,
        overflow: 'hidden',
        maxHeight,
      }}
    >
      <Table
        stickyHeader={stickyHeader}
        sx={{
          '& .MuiTableCell-root': {
            fontSize: typography.fontSize.base,
            fontFamily: typography.fontFamily.primary,
            borderBottom: `1px solid ${colors.neutral[200]}`,
          },
          '& .MuiTableCell-head': {
            fontSize: typography.fontSize.lg,
            fontFamily: typography.fontFamily.display,
            fontWeight: typography.fontWeight.semibold,
            backgroundColor: headerColor,
            color: headerTextColor,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          },
          '& .MuiTableRow-root:hover': {
            backgroundColor: colors.primary[25],
            cursor: onRowClick ? 'pointer' : 'default',
          },
        }}
      >
        <TableHead>
          <TableRow sx={{ height: '64px' }}>
            {showRowNumbers && (
              <TableCell sx={{ width: '60px', textAlign: 'center' }}>
                #
              </TableCell>
            )}
            {columns.map((column) => (
              <TableCell
                key={String(column.id)}
                sx={{
                  width: column.width,
                  textAlign: column.align || 'left',
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={totalColumns} sx={{ border: 'none', p: 0 }}>
                <LoadingState />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalColumns} sx={{ border: 'none', p: 0 }}>
                <EmptyState message={emptyMessage} />
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={index}
                onClick={() => onRowClick?.(row, index)}
                sx={{
                  height: rowHeight,
                  transition: animations.transitions.fast,
                  '&:hover': {
                    backgroundColor: colors.primary[25],
                    transform: 'translateY(-1px)',
                    boxShadow: shadows.sm,
                  },
                }}
              >
                {showRowNumbers && (
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.text.secondary,
                      }}
                    >
                      {index + 1}
                    </Typography>
                  </TableCell>
                )}
                {columns.map((column) => {
                  const value = row[column.id];
                  return (
                    <TableCell
                      key={String(column.id)}
                      sx={{
                        textAlign: column.align || 'left',
                      }}
                    >
                      {column.render ? column.render(value, row, index) : value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ModernTable;
export type { TableColumn };
