"use client";
import React, { useEffect, useMemo, useState } from "react";
import { styled } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import type { TabProps } from "@mui/material/Tab";
import Box from "@mui/material/Box";
import styles from "./AplicacionesTabs.module.scss";
import ItemList from "../itemList/ItemList";
import { Aplicacion } from "@/domain/models/Aplicacion";
import { useItemsManager } from "@/hooks/useItemsManager";
import { transformToItems } from "@/utilities/transform";
import { EstadoAplicacion } from "@/domain/enum/EstadoAplicacion";
import { Producto } from "@/domain/models/Producto";
import { Locacion } from "@/domain/models/Locacion";
import { useUser } from "@/hooks/useUser";
import { Roles } from "@/domain/enum/Roles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ApplicationDetailModal from "./ApplicationDetailModal";
import { useRouter } from "next/navigation";
import { useLoaderStore } from "@/contexts/loaderStore";
import { Pagination, TextField, MenuItem, Box as MUIBox } from "@mui/material";
import { getPendingFinishAppIds } from "@/utilities/offlineQueue";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

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
      {value === index && <Box className={styles.tabContent}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `nav-tab-${index}`,
    "aria-controls": `nav-tabpanel-${index}`,
  };
}

/** LinkTab tipado correctamente; no usamos <a>, dejamos el Tab nativo */
function LinkTab(props: TabProps) {
  return <Tab disableRipple className={styles.tab} {...props} />;
}

const StyledTabs = styled(Tabs)(() => ({
  backgroundColor: "#e6ebea",
  fontFamily: "Roboto, sans-serif",
  fontWeight: 700,
  "& .MuiTabs-indicator": {
    backgroundColor: "#404e5c",
  },
  "& .MuiTab-root": {
    textTransform: "capitalize",
    fontWeight: 700,
    fontFamily: "Roboto, sans-serif",
  },
  // Look de deshabilitado usando tus variables globales
  "& .MuiTab-root.Mui-disabled": {
    opacity: "var(--btn-disabled-opacity)",
    filter: "var(--btn-disabled-filter)",
    cursor: "not-allowed",
    pointerEvents: "none",
  },
}));

const StyledAppBar = styled(AppBar)({
  backgroundColor: "#e6ebea",
  boxShadow: "none",
  borderBottom: "0px",
});

interface AplicacionesTabsProps {
  aplicaciones: Aplicacion[];
  productos: Producto[];
  locaciones: Locacion[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  pageElements: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  onPageSizeChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  changeStatus: (status: string) => void;
}

export default function AplicacionesTabs({
  aplicaciones,
  productos,
  locaciones,
  page,
  pageSize,
  totalPages,
  totalElements,
  pageElements,
  onPageChange,
  onPageSizeChange,
  changeStatus,
}: AplicacionesTabsProps) {
  const router = useRouter();
  const [value, setValue] = useState(0);
  const { user, isLoading } = useUser();
  const { showLoader } = useLoaderStore();
  const [pendingFinishIds, setPendingFinishIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const isOnline = useOnlineStatus();
  const isOfflineLike = !isOnline;

  // Forzar "En curso" si estás offline
  useEffect(() => {
    if (isOfflineLike && value !== 1) {
      setValue(1);
      changeStatus(EstadoAplicacion.EnCurso);
    }
  }, [isOfflineLike]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenModal = (id: string) => {
    setSelectedAppId(id);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAppId(null);
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    // Offline: sólo permitir la pestaña 1 ("En curso")
    if (isOfflineLike && newValue !== 1) return;

    setValue(newValue);
    switch (newValue) {
      case 0:
        changeStatus(EstadoAplicacion.Pendiente);
        break;
      case 1:
        changeStatus(EstadoAplicacion.EnCurso);
        break;
      case 2:
        changeStatus(EstadoAplicacion.Finalizada);
        break;
      default:
        changeStatus(EstadoAplicacion.Pendiente);
    }
  };

  useEffect(() => {
    if (value === 1) {
      (async () => {
        const ids = await getPendingFinishAppIds();
        setPendingFinishIds(Array.isArray(ids) ? ids : []);
        console.log("IDS pendientes de sync:", ids);
      })();
    }
  }, [value]);

  const { items: aplicacionesToDisplay, selectedIds } =
    useItemsManager<Aplicacion>(aplicaciones);

  const isApplicatorUser = useMemo(() => {
    const roles = user?.roles || [];
    return roles.includes(Roles.Aplicador) || roles.includes("APPLICATOR");
  }, [user]);

  const parsedAplicaciones = aplicacionesToDisplay
    .filter((item) => {
      const matchesTab =
        (value === 0 && item.status === EstadoAplicacion.Pendiente) ||
        (value === 1 && item.status === EstadoAplicacion.EnCurso) ||
        (value === 2 &&
          item.status === EstadoAplicacion.Finalizada &&
          item.type === "INSTANT");
      if (!matchesTab) return false;

      if (!isLoading && isApplicatorUser && value === 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentUserId = (user as any)?.external_id || (user as any)?.id;
        return item.applicator_id === currentUserId || !item.applicator_id;
      }
      return true;
    })
    .map((item) => ({
      id: item.id.toString(),
      estado: item.status,
      cultivo:
        locaciones?.find((l) => l.id === item.location_id)?.name || "Sin cultivo",
      fecha: new Date(item.application_date).toLocaleDateString(),
    }));

  const items = transformToItems(parsedAplicaciones, "id", ["cultivo", "fecha"]).map(
    (item) => ({
      ...item,
      cultivo: item.cultivo,
      fecha: item.fecha,
    })
  );

  const itemsEnCurso = useMemo(
    () =>
      transformToItems(
        parsedAplicaciones
          .filter(
            (item) => value === 1 && item.estado === EstadoAplicacion.EnCurso
          )
          .map((item) => ({
            ...item,
            pendienteSync: pendingFinishIds.includes(item.id), // match exacto
          })),
        "id",
        ["cultivo", "fecha", "pendienteSync"]
      ),
    [parsedAplicaciones, pendingFinishIds, value]
  );

  const campos = ["cultivo", "fecha"];

  const startApplication = (id: string) => {
    if (isLoading || !user) {
      console.warn("Usuario no disponible aún");
      return;
    }
    const roles = user.roles;
    if (roles?.includes(Roles.Encargado))
      router.push(`aplicaciones/modificar?id=${id}`);
    else router.push(`aplicaciones/iniciar?id=${id}`);
  };

  const finishApplication = (id: string) => {
    showLoader("Cargando aplicación...");
    router.push(`aplicaciones/finalizar?id=${id}`);
  };

  const confirmApplication = (id: string) => {
    showLoader("Cargando aplicación...");
    router.push(`aplicaciones/confirmar?id=${id}`);
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
          TabIndicatorProps={{
            style: {
              backgroundColor: "#aebc86", // ajustar si querés
            },
          }}
        >
          <LinkTab
            disabled={isOfflineLike} // offline => deshabilitada
            label="Pendientes"
            {...a11yProps(0)}
          />
          <LinkTab
            // siempre habilitada (offline también)
            label="En curso"
            {...a11yProps(1)}
          />
          <LinkTab
            disabled={isOfflineLike} // offline => deshabilitada
            label="A confirmar"
            {...a11yProps(2)}
          />
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
                style={{ cursor: "pointer", color: "#404e5c" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(item.id);
                }}
              />
            )}
          />
        ) : (
          <div style={{ textAlign: "center" }}>No hay aplicaciones pendientes</div>
        )}
      </TabPanel>

      <TabPanel value={value} index={1}>
        {itemsEnCurso.length > 0 ? (
          <ItemList
            items={itemsEnCurso}
            displayKeys={campos}
            selectedIds={selectedIds}
            selectItems={false}
            deleteItems={false}
            selectSingleItem={true}
            onSelectSingleItem={finishApplication}
            actions={(item) => (
              <span style={{ display: "flex", alignItems: "center" }}>
                <VisibilityIcon
                  style={{ cursor: "pointer", color: "#404e5c" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(item.id);
                  }}
                />
                {item.pendienteSync && item.pendienteSync !== "false" && (
                  <span
                    style={{
                      marginTop: 0,
                      marginLeft: 8,
                      color: "#ffd666",
                      fontSize: "0.7em",
                      background: "#fffbe6",
                      borderRadius: 8,
                      padding: "2px 6px",
                      border: "1px solid #ffd666",
                    }}
                    title="Esta aplicación está pendiente de sincronización offline."
                  >
                    ⏳ Sin sincronizar
                  </span>
                )}
              </span>
            )}
          />
        ) : (
          <div style={{ textAlign: "center" }}>No hay aplicaciones en curso</div>
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
                style={{ cursor: "pointer", color: "#404e5c" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(item.id);
                }}
              />
            )}
          />
        ) : (
          <div style={{ textAlign: "center" }}>
            No hay aplicaciones a confirmar
          </div>
        )}
      </TabPanel>

      <ApplicationDetailModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        aplicacion={
          aplicacionesToDisplay.find(
            (app) => app.id.toString() === selectedAppId
          ) || null
        }
        productos={productos}
      />

      <MUIBox
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 2,
          marginTop: 2,
          gap: "10px",
        }}
      >
        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={onPageChange}
          color="primary"
          size="large"
        />
        <MUIBox sx={{ mt: 1 }}>
          <TextField
            select
            label="Elementos por página"
            value={pageSize}
            onChange={onPageSizeChange}
            sx={{ width: 180 }}
            size="small"
          >
            {[5, 10, 20, 50].map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </TextField>
        </MUIBox>
        <span style={{ marginTop: 8, color: "#666" }}>
          Mostrando {pageElements} de {totalElements} elementos
        </span>
      </MUIBox>
    </Box>
  );
}
