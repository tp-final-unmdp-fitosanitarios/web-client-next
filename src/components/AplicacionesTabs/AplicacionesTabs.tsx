import React from 'react';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import styles from './AplicacionesTabs.module.scss';

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

export default function AplicacionesTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box className={styles.container}>
      <StyledAppBar position="static">
        <StyledTabs
          value={value}
          onChange={handleChange}
          aria-label="aplicaciones tabs"
          variant="fullWidth"
          className={styles.tabs}
        >
          <LinkTab label="Aplicaciones Activas" href="/aplicaciones/activas" {...a11yProps(0)} />
          <LinkTab label="Historial" href="/aplicaciones/historial" {...a11yProps(1)} />
          <LinkTab label="Estadísticas" href="/aplicaciones/estadisticas" {...a11yProps(2)} />
        </StyledTabs>
      </StyledAppBar>
      <TabPanel value={value} index={0}>
        Contenido de Aplicaciones Activas
      </TabPanel>
      <TabPanel value={value} index={1}>
        Contenido del Historial
      </TabPanel>
      <TabPanel value={value} index={2}>
        Contenido de Estadísticas
      </TabPanel>
    </Box>
  );
} 