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
          <Typography className={styles.tabText}>{children}</Typography>
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
}

export default function AplicacionesTabs({ aplicaciones }: AplicacionesTabsProps) {
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
      (value === 0 && item.status === "PENDING") ||
      (value === 1 && item.status === "IN_PROGRESS")
    )
    .map((item) => ({
      id: item.id.toString(),
      status: item.status,
      campo: item.campo.name,
    producto: item.producto.name,
    cantidad: item.cantidad.toString(),
    unidad: item.unidad,
  }));

  const items = transformToItems(aplicacionesToDisplay, "id", ["campo", "producto", "cantidad", "unidad"]).map((item) => {
    return {
        ...item,
        display: `Campo: ${item.lot_number} - ${item.producto}: ${item.cantidad}${item.unit}`, //Se deberia agregar fecha
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
          <p style={{textAlign: "center"}}>No hay aplicaciones en curso</p>
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
          <p style={{textAlign: "center"}}>No hay aplicaciones pendientes</p>
        )}
      </TabPanel>
    </Box>
  );
} 