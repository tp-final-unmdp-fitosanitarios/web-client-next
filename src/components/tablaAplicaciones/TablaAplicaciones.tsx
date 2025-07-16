// import * as React from 'react';
// import { alpha } from '@mui/material/styles';
// import Box from '@mui/material/Box';
// import Table from '@mui/material/Table';
// import TableBody from '@mui/material/TableBody';
// import TableCell from '@mui/material/TableCell';
// import TableContainer from '@mui/material/TableContainer';
// import TableHead from '@mui/material/TableHead';
// import TablePagination from '@mui/material/TablePagination';
// import TableRow from '@mui/material/TableRow';
// import Toolbar from '@mui/material/Toolbar';
// import Typography from '@mui/material/Typography';
// import Paper from '@mui/material/Paper';
// import Checkbox from '@mui/material/Checkbox';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Switch from '@mui/material/Switch';
// import { Locacion } from '@/domain/models/Locacion';
// import { Producto } from '@/domain/models/Producto';
// import { EstadoAplicacion } from '@/domain/enum/EstadoAplicacion';
// import { Aplicacion } from '@/domain/models/Aplicacion';
// import { Unidad } from '@/domain/enum/Unidad';

// interface Data {
//     id: string,
//     campo: Locacion;
//     producto: Producto;
//     unidad: Unidad | string;
//     cantidad: number;
//     estado: EstadoAplicacion;
//     fecha: Date;
// }

// function createData(
//     id: string,
//     campo: Locacion,
//     producto: Producto,
//     unidad: Unidad | string,
//     cantidad: number,
//     estado: EstadoAplicacion,
//     fecha: Date
// ): Data {
//   return {
//     id,
//     campo,
//     producto,
//     unidad,
//     cantidad,
//     estado,
//     fecha
//   };
// }

// interface HeadCell {
//   disablePadding: boolean;
//   id: keyof Data;
//   label: string;
// }

// const headCells: readonly HeadCell[] = [
//   {
//     id: 'campo',
//     disablePadding: true,
//     label: 'Locacion',
//   },
//   {
//     id: "producto",
//     disablePadding: false,
//     label: 'Producto',
//   },
//   {
//     id: 'cantidad',
//     disablePadding: false,
//     label: 'Cantidad',
//   },
//   {
//     id: 'unidad',
//     disablePadding: false,
//     label: 'Unidad',
//   },
//   {
//     id: 'fecha',
//     disablePadding: false,
//     label: 'Fecha',
//   },
//   {
//     id: 'estado',
//     disablePadding: false,
//     label: 'Estado',
//   }
// ];


// function EnhancedTableHead() {

//   return (
//     <TableHead>
//       <TableRow>
//         <TableCell />
//         {headCells.map((headCell) => (
//           <TableCell key={headCell.id} align={'center'} padding={headCell.disablePadding ? 'none' : 'normal'}>
//               {headCell.label}
//           </TableCell>
//         ))}
//       </TableRow>
//     </TableHead>
//   );
// }

// interface EnhancedTableToolbarProps {
//   numSelected: number;
//   pestaña: string;
// }
// function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
//   const { numSelected, pestaña } = props;
//   return (
//     <Toolbar
//       sx={[{pl: { sm: 2 }, pr: { xs: 1, sm: 1 }},
//         numSelected > 0 && {
//           bgcolor: (theme) =>
//             alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
//         },
//       ]}
//     >
//       {numSelected > 0 ? (
//         <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
//           {numSelected} selected
//         </Typography>
//       ) : (
//         <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
//           {pestaña==="pendientes"? "Aplicaciones pendientes" : "Aplicaciones en curso"}
//         </Typography>
//       )}
//     </Toolbar>
//   );
// }

// interface tableProps {
//     aplicaciones: Aplicacion[],
//     pestañaActual: string
// }
// export default function TablaAplicaciones({aplicaciones, pestañaActual}: tableProps) {

//   const [selected, setSelected] = React.useState<readonly number[]>([]);
//   const [page, setPage] = React.useState(0);
//   const [dense, setDense] = React.useState(false);
//   const [rowsPerPage, setRowsPerPage] = React.useState(5);
  
//   const rows = aplicaciones.map(el => createData(el.id, el.campo, el.producto, el.unidad, el.cantidad, el.estado, el.fecha));

//   const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
//     const selectedIndex = selected.indexOf(id);
//     let newSelected: readonly number[] = [];

//     if (selectedIndex === -1) {
//       newSelected = newSelected.concat(selected, id);
//     } else if (selectedIndex === 0) {
//       newSelected = newSelected.concat(selected.slice(1));
//     } else if (selectedIndex === selected.length - 1) {
//       newSelected = newSelected.concat(selected.slice(0, -1));
//     } else if (selectedIndex > 0) {
//       newSelected = newSelected.concat(
//         selected.slice(0, selectedIndex),
//         selected.slice(selectedIndex + 1),
//       );
//     }
//     setSelected(newSelected);
//   };

//   const handleChangePage = (event: unknown, newPage: number) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setDense(event.target.checked);
//   };

//   // Avoid a layout jump when reaching the last page with empty rows.
//   const emptyRows =
//     page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

//   const visibleRows = [...rows].slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

//   return (
//     <Box sx={{ width: '100%' }}>
//       <Paper sx={{ width: '100%', mb: 2 }}>
//         <EnhancedTableToolbar numSelected={selected.length} pestaña={pestañaActual}/>
//         <TableContainer>
//           <Table
//             sx={{ minWidth: 750 }}
//             aria-labelledby="tableTitle"
//             size={dense ? 'small' : 'medium'}
//           >
//             <EnhancedTableHead />
//             <TableBody>
//               {visibleRows.map((row, index) => {
//                 const isItemSelected = selected.includes(row.id);
//                 const labelId = `enhanced-table-checkbox-${index}`;

//                 return (
//                   <TableRow
//                     hover
//                     onClick={(event) => handleClick(event, row.id)}
//                     role="checkbox"
//                     aria-checked={isItemSelected}
//                     tabIndex={-1}
//                     key={row.id}
//                     selected={isItemSelected}
//                     sx={{ cursor: 'pointer' }}
//                   >
//                     <TableCell padding="checkbox">
//                       <Checkbox
//                         color="primary"
//                         checked={isItemSelected}
//                         inputProps={{
//                           'aria-labelledby': labelId,
//                         }}
//                       />
//                     </TableCell>
//                     <TableCell
//                       component="th"
//                       id={labelId}
//                       scope="row"
//                       padding="none"
//                       align='center'
//                     >
//                       {row.campo.direccion}
//                     </TableCell>
//                     <TableCell align='center'>{row.producto.nombre}</TableCell>
//                     <TableCell align='center'>{row.cantidad}</TableCell>
//                     <TableCell align='center'>{row.unidad}</TableCell>
//                     <TableCell align='center'>{row.fecha.toLocaleDateString()}</TableCell>
//                     <TableCell align='center'>{row.estado.toString()}</TableCell>
//                   </TableRow>
//                 );
//               })}
//               {emptyRows > 0 && (
//                 <TableRow
//                   style={{
//                     height: (dense ? 33 : 53) * emptyRows,
//                   }}
//                 >
//                   <TableCell colSpan={6} />
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//         <TablePagination
//           rowsPerPageOptions={[5, 10, 25]}
//           component="div"
//           count={rows.length}
//           rowsPerPage={rowsPerPage}
//           page={page}
//           onPageChange={handleChangePage}
//           onRowsPerPageChange={handleChangeRowsPerPage}
//         />
//       </Paper>
//       <FormControlLabel
//         control={<Switch checked={dense} onChange={handleChangeDense} />}
//         label="Comprimir Tabla"
//       />
//     </Box>
//   );
// }