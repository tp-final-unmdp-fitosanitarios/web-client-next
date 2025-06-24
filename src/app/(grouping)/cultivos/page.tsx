'use client';

import { useEffect, useState } from 'react';
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
  useTheme,
  useMediaQuery,
  TablePagination,
} from '@mui/material';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useLoading } from '@/hooks/useLoading';
import MenuBar from '@/components/menuBar/MenuBar';
import Footer from '@/components/Footer/Footer';
import styles from './cultivos.module.scss';

interface Crop {
  end_of_sowing: string;
  crop_number: string;
  lot_name: string;
  field_name: string;
  variety: string;
  surface: string;
  crop_name: string;
}

export default function CultivosPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(20);
  const { getApiService } = useAuth();
  const { withLoading } = useLoading();
  const apiService = getApiService();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await withLoading(
          apiService.get<{ crops: Crop[] }>('/locations/crop-dashboard'),
          "Cargando cultivos..."
        );
        if (response.success) {
          setCrops(response.data.crops);
        }
      } catch (error) {
        console.error('Error fetching crops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="page-container">
      <div className="content-wrap">
        <MenuBar showMenu={true} showArrow={true} path="home" />
        <div className={styles.titleContainer}>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            className={styles.title}
          >
            Cultivos
          </Typography>
        </div>
        {isMobile && (
          <span className={styles['scroll-message']}>
            Desliza horizontalmente para ver más columnas
          </span>
        )}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} className={styles.tableContainer}>
            <Table className={styles.table}>
              <TableHead className={styles.tableHead}>
                <TableRow>
                  <TableCell>Nombre del Cultivo</TableCell>
                  <TableCell>Número de Cultivo</TableCell>
                  <TableCell>Fin de Siembra</TableCell>
                  <TableCell>Nombre del Lote</TableCell>
                  <TableCell>Nombre del Campo</TableCell>
                  <TableCell>Variedad</TableCell>
                  <TableCell>Superficie</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {crops
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((crop, index) => (
                    <TableRow key={index} className={styles.tableRow}>
                      <TableCell className={styles.tableCell}>{crop.crop_name}</TableCell>
                      <TableCell className={styles.tableCell}>{crop.crop_number}</TableCell>
                      <TableCell className={styles.tableCell}>{crop.end_of_sowing}</TableCell>
                      <TableCell className={styles.tableCell}>{crop.lot_name}</TableCell>
                      <TableCell className={styles.tableCell}>{crop.field_name}</TableCell>
                      <TableCell className={styles.tableCell}>{crop.variety}</TableCell>
                      <TableCell className={styles.tableCell}>{crop.surface}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={crops.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[20]}
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </TableContainer>
        )}
      </div>
      <Footer />
    </div>
  );
} 