"use client";
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
import { useAuth } from '../Auth/AuthProvider';
import { useUser } from '@/hooks/useUser';
import { Roles } from '@/domain/enum/Roles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ApplicationDetailModal from './ApplicationDetailModal';
import { useRouter } from 'next/navigation';
import { useLoaderStore } from '@/contexts/loaderStore';

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

const StyledTabs = styled(Tabs)(() => ({
  backgroundColor: '#e6ebea',

  fontFamily: 'Roboto, sans-serif',
  fontWeight: 700,
  '& .MuiTabs-indicator': {
    backgroundColor: '#404e5c',
  },
  '& .MuiTab-root': {
    textTransform: 'capitalize',
    fontWeight: 700,
    fontFamily: 'Roboto, sans-serif',
  },
}));

const StyledAppBar = styled(AppBar)({
  backgroundColor: '#e6ebea',
  boxShadow: 'none',
  borderBottom: '0px',
});

interface AplicacionesTabsProps {
  aplicaciones: Aplicacion[];
  productos: Producto[];
  locaciones: Locacion[];
}

export default function AplicacionesTabs({ aplicaciones, productos, locaciones }: AplicacionesTabsProps) {
  const router = useRouter();
  const [value, setValue] = React.useState(0);
  const { user, isLoading } = useUser();
  const { showLoader } = useLoaderStore();

  // Estado para el modal de detalles
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedAppId, setSelectedAppId] = React.useState<string | null>(null);

  const handleOpenModal = (id: string) => {
    setSelectedAppId(id);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAppId(null);
  };

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
      (value === 1 && item.status === EstadoAplicacion.EnCurso) ||
      (value === 2 && item.status === EstadoAplicacion.Finalizada && item.type==="INSTANT")
    )
    .map((item) => ({
      id: item.id.toString(),
      estado: item.status,
      cultivo: locaciones?.find((l) => l.id === item.location_id)?.name || 'Sin cultivo',
      fecha: new Date(item.application_date).toLocaleDateString()
    }));

  const items = transformToItems(parsedAplicaciones, "id", ["cultivo", "fecha"]).map((item) => {
    return {
        ...item,
        cultivo: item.cultivo,
        fecha: item.fecha,
    };
  });

  const campos = ["cultivo", "fecha"];

  const startApplication = (id: string) => {
    if (isLoading || !user) {
      console.warn('Usuario no disponible aún');
      return;
    }
    
    const roles = user.roles;
    console.log(user);
    if(roles?.includes(Roles.Encargado))
      router.push(`aplicaciones/modificar?id=${id}`);
    else
      router.push(`aplicaciones/iniciar?id=${id}`);
  }

  const finishApplication = (id: string) => {
    showLoader('Cargando aplicación...');
    router.push(`aplicaciones/finalizar?id=${id}`);
  }

  const confirmApplication = (id: string) => {
      showLoader('Cargando aplicación...');
    router.push(`aplicaciones/confirmar?id=${id}`);
  }


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
      <TabPanel value={value} index={0}>
      {items.length > 0 ? (
          <ItemList
            items={items}
            displayKeys={campos}
            selectedIds={selectedIds}
            selectItems={false}
            deleteItems={false}
            selectSingleItem={true}
            onSelectSingleItem={startApplication}
            actions={(item) => (
              <VisibilityIcon
                style={{ cursor: 'pointer', color: '#404e5c' }}
                onClick={e => {
                  e.stopPropagation();
                  handleOpenModal(item.id);
                }}
              />
            )}
          />
        ) : (
          <div style={{textAlign: "center"}}>No hay aplicaciones pendientes</div>
        )}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {items.length > 0 ? (
          <ItemList
            items={items}
            displayKeys={campos}
            selectedIds={selectedIds}
            selectItems={false}
            deleteItems={false}
            selectSingleItem={true}
            onSelectSingleItem={finishApplication}
            actions={(item) => (
              <VisibilityIcon
                style={{ cursor: 'pointer', color: '#404e5c' }}
                onClick={e => {
                  e.stopPropagation();
                  handleOpenModal(item.id);
                }}
              />
            )}
          />
        ) : (
          <div style={{textAlign: "center"}}>No hay aplicaciones en curso</div>
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
            selectSingleItem={user?.roles?.includes("ENGINEER") ? true : false}
            onSelectSingleItem={confirmApplication}
            actions={(item) => (
              <VisibilityIcon
                style={{ cursor: 'pointer', color: '#404e5c' }}
                onClick={e => {
                  e.stopPropagation();
                  handleOpenModal(item.id);
                }}
              />
            )}
          />
        ) : (
          <div style={{textAlign: "center"}}>No hay aplicaciones a confirmar</div>
        )}
      </TabPanel>
      {/* Modal de detalles de aplicación */}
      <ApplicationDetailModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        aplicacion={aplicacionesToDisplay.find(app => app.id.toString() === selectedAppId) || null}
        productos={productos}
      />
    </Box>
  );
} 