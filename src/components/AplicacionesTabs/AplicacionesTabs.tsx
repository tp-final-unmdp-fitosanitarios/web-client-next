import React from 'react';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import styles from './AplicacionesTabs.module.scss';
import ItemList from '../itemList/ItemList';
import { Aplicacion } from '@/domain/models/Aplicacion';
import { useItemsManager } from '@/hooks/useItemsManager';
import { transformToItems } from "@/utilities/transform";
import { EstadoAplicacion } from '@/domain/enum/EstadoAplicacion';
import { Producto } from '@/domain/models/Producto';
import { Locacion } from '@/domain/models/Locacion';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`nav-tabpanel-${index}`}
      aria-labelledby={`nav-tab-${index}`}
      className={styles.tabPanel}
      {...other}
    >
      {value === index && (
        <Box className={styles.tabContent}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `nav-tab-${index}`,
    'aria-controls': `nav-tabpanel-${index}`,
  };
}

interface LinkTabProps {
  label?: string;
  href?: string;
}

function LinkTab(props: LinkTabProps) {
  return (
    <Tab
      component="a"
      onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
      }}
      className={styles.tab}
      {...props}
    />
  );
}

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#e6ebea',
  '& .MuiTabs-indicator': {
    backgroundColor: '#404e5c',
  },
}));

const StyledAppBar = styled(AppBar)({
  backgroundColor: '#e6ebea',
  boxShadow: 'none',
  borderBottom: '2px solid #404e5c',
});

interface AplicacionesTabsProps {
  aplicaciones: Aplicacion[];
  productos: Producto[];
  locaciones: Locacion[];
}

export default function AplicacionesTabs({ aplicaciones, productos, locaciones }: AplicacionesTabsProps) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const {
    items: aplicacionesToDisplay,
    selectedIds,
  } = useItemsManager<Aplicacion>(aplicaciones);

  const parsedAplicaciones = aplicacionesToDisplay
    .filter((item) =>
      (value === 0 && item.status === EstadoAplicacion.Pendiente) ||
      (value === 1 && item.status === EstadoAplicacion.EnCurso)
    )
    .map((item) => ({
      id: item.id.toString(),
      estado: item.status,
      cultivo: locaciones?.find((l) => l.id === item.location_id)?.name || 'Sin cultivo',
      fecha: new Date(item.created_at).toLocaleDateString()
    }));

  const items = transformToItems(parsedAplicaciones, "id", ["cultivo", "fecha"]).map((item) => {
    return {
        ...item,
        display: `Cultivo: ${item.cultivo} - Fecha: ${item.fecha}`, 
    };
});

const campos = ["display"];

  return (
    <Box className={styles.container}>
      <StyledAppBar position="static">
        <StyledTabs
          value={value}
          onChange={handleChange}
          aria-label="aplicaciones tabs"
          variant="fullWidth"
          className={styles.tabs}
          TabIndicatorProps={{
            style: {
              backgroundColor: '#aebc86',  /*Terminar el manejo del color*/
            },
          }}
        >
          <LinkTab label="Pendientes" href="/aplicaciones/pendientes" {...a11yProps(0)} />
          <LinkTab label="En curso" href="/aplicaciones/encurso" {...a11yProps(1)} />
          <LinkTab label="A confirmar" href="/aplicaciones/confirmar" {...a11yProps(2)} />
        </StyledTabs>
      </StyledAppBar>
      <TabPanel value={value} index={1}>
        {items.length > 0 ? (
          <ItemList
            items={items}
            displayKeys={campos}
            selectedIds={selectedIds}
            selectItems={false}
            deleteItems={false}
            selectSingleItem={false} // Puedes cambiarlo a true si solo quieres permitir seleccionar una máquina a la vez para eliminar
          />
        ) : (
          <div style={{textAlign: "center"}}>No hay aplicaciones en curso</div>
        )}
      </TabPanel>
      <TabPanel value={value} index={0}>
      {items.length > 0 ? (
          <ItemList
            items={items}
            displayKeys={campos}
            selectedIds={selectedIds}
            selectItems={false}
            deleteItems={false}
            selectSingleItem={false} // Puedes cambiarlo a true si solo quieres permitir seleccionar una máquina a la vez para eliminar
          />
        ) : (
          <div style={{textAlign: "center"}}>No hay aplicaciones pendientes</div>
        )}
      </TabPanel>
      <TabPanel value={value} index={2}>
      {items.length > 0 ? (
          <ItemList
            items={items}
            displayKeys={campos}
            selectedIds={selectedIds}
            selectItems={false}
            deleteItems={false}
            selectSingleItem={false} // Puedes cambiarlo a true si solo quieres permitir seleccionar una máquina a la vez para eliminar
          />
        ) : (
          <div style={{textAlign: "center"}}>No hay aplicaciones a confirmar</div>
        )}
      </TabPanel>
    </Box>
  );
} 