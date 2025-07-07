/* eslint-disable react/jsx-key */
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import InventoryIcon from '@mui/icons-material/Inventory';
import BarChartIcon from '@mui/icons-material/BarChart';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import NavigationLink from '@/components/NavigationLink/NavigationLink';
import styles from "./sideBar.module.scss";
import { useAuth } from '../Auth/AuthProvider';
import { useUser } from '@/hooks/useUser';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';

const userDataIcons = [
  <PersonIcon />,
  <WorkIcon />,
  <EmailIcon />
]

const icons = [
  <HomeIcon />,
  <ShoppingCartIcon />,
  <LocalOfferIcon />,
  <InventoryIcon />,
  <BarChartIcon />,
];

export default function SideBar() {
  const [open, setOpen] = React.useState(false);
  const { logout } = useAuth();
  const { user, isLoading } = useUser();
  
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  // Si está cargando o no hay usuario, mostrar datos por defecto
  const userData = {
    name: user ? `${user.first_name} ${user.last_name}` : 'Cargando...',
    role: user?.roles?.[0] || 'Sin rol asignado',
    email: user?.email || 'Sin email'
  }

  const DrawerList = (
    <Box className={styles.drawerContainer} role="presentation" onClick={toggleDrawer(false)}>
    <p className={styles.userData}>Datos de usuario</p>
      <List>
        {[userData.name, userData.role, userData.email].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton className={`${styles.listItemButton} ${styles.userDataItem}`}>
              <ListItemIcon className={styles.icon}>
                {userDataIcons[index]}
              </ListItemIcon>
              <ListItemText className={styles.userName} primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <NavigationLink href="/perfil" className={styles.link}>
            <ListItemButton className={styles.listItemButton}>
              <ListItemIcon className={styles.icon}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Mi Perfil" />
            </ListItemButton>
          </NavigationLink>
        </ListItem>
      </List>

      <Divider />
      <p className={styles.userData}>Navegacion </p>
      <List>
        {['Home', 'Productos', 'Aplicaciones', 'Stock', 'Estadísticas'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <NavigationLink href={`/${text.toLowerCase()}`} className={styles.link}>
              <ListItemButton className={styles.listItemButton}>
                <ListItemIcon className={styles.icon}>
                  {icons[index]}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </NavigationLink>
          </ListItem>
        ))}
      </List>
      <Divider />
      <div className={styles.logoutSection}>
        <button className={styles.logoutButton} onClick={logout}>
          <LogoutIcon sx={{ marginRight: '8px' }} />
          Cerrar sesión
        </button>
      </div>
    </Box>
  );

  return (
    <div>
      <IconButton onClick={toggleDrawer(true)} className={styles.menuButton}>
        <MenuIcon />
      </IconButton>
      <Drawer variant="temporary" open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
}
