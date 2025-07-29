"use client";
import { Box, MenuItem, Pagination, TextField, Typography } from "@mui/material";

interface PaginationControlsProps {
  page: number; // 0-indexed
  pageSize: number;
  totalPages: number;
  totalElements: number;
  pageElements: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  onPageSizeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PaginationControls({
  page,
  pageSize,
  totalPages,
  totalElements,
  pageElements,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, marginTop: 2,gap:"10px" }}>
      <Pagination
        count={totalPages}
        page={page + 1}
        onChange={onPageChange}
        color="primary"
        size="large"
      />
      <Box sx={{ mt: 1 }}>
        <TextField
          select
          label="Elementos por página"
          value={pageSize}
          onChange={onPageSizeChange}
          sx={{ width: 180 }}
          size="small"
        >
          {[5, 10, 20, 50].map((size) => (
            <MenuItem key={size} value={size}>{size}</MenuItem>
          ))}
        </TextField>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Mostrando {pageElements} de {totalElements} elementos
      </Typography>
    </Box>
  );
}
