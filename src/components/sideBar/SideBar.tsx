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
import Link from 'next/link';
import styles from "./sideBar.module.scss";
import { useAuth } from '../Auth/AuthProvider';

const icons = [
  <HomeIcon />,
  <ShoppingCartIcon />,
  <LocalOfferIcon />,
  <InventoryIcon />,
  <BarChartIcon />,
];

export default function SideBar () {
  const [open, setOpen] = React.useState(false);
  const { logout } = useAuth(); 

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box className={styles.drawerContainer} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {['Home','Productos', 'Aplicaciones','Stock', 'Estadísticas'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <Link href={`/${text.toLowerCase()}`} className={styles.link}>
              <ListItemButton className={styles.listItemButton}>
                <ListItemIcon className={styles.icon}>
                  {icons[index]}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </Link>
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
      <Drawer  variant="temporary" open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
}
