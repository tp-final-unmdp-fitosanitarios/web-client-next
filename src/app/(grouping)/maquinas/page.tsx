"use client";
import { useItemsManager } from "@/hooks/useItemsManager";
import ItemList from "@/components/itemList/ItemList";
import Link from "next/link";
import styles from "./maquinas-view.module.scss";
import MenuBar from "@/components/menuBar/MenuBar";
import { transformToItems } from "@/utilities/transform";
import GenericModal from "@/components/modal/GenericModal";
import { useEffect, useState } from "react";
import { ResponseItems } from "@/domain/models/ResponseItems";
import { Maquina } from "@/domain/models/Maquina";
import { useAuth } from "@/components/Auth/AuthProvider";
import Footer from "@/components/Footer/Footer";
import { useLoading } from "@/hooks/useLoading";
import { Pagination, TextField, MenuItem, Box, Typography } from "@mui/material";
const buttons = [{ label: "Agregar", path: "/maquinas/agregar" }];

export default function MaquinasView() {
  const { getApiService } = useAuth();
  const { withLoading } = useLoading();
  const apiService = getApiService();

  const [maquinasFromServer, setMaquinasFromServer] = useState<Maquina[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(0); // Página actual (0-indexed)
  const [pageSize, setPageSize] = useState(10); // Tamaño de página
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageElements, setPageElements] = useState(0);

  useEffect(() => {
    const fetchMaquinas = async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('size', pageSize.toString());
        const response = await withLoading(
          apiService.get<ResponseItems<Maquina>>(`machines?${queryParams.toString()}`),
          "Cargando máquinas..."
        );
        if (response.success) {
          setMaquinasFromServer(response.data.content);
          setTotalPages(response.data.total_pages || 0);
          setTotalElements(response.data.total_elements || 0);
          setPageElements(response.data.number_of_elements || 0);
        } else {
          setError(response.error || "Error al obtener las máquinas");
        }
      } catch (err) {
        setError("Error al conectar con el servidor" + err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaquinas();
  }, [page, pageSize]);

  // Handler para cambio de página
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1); // MUI Pagination es 1-indexed
  };
  // Handler para cambio de tamaño de página
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const {
    items: maquinas,
    selectedIds,
    deletedItems,
    isModalOpen,
    toggleSelectItem,
    quitarItems,
    closeModal,
  } = useItemsManager<Maquina>(maquinasFromServer);

  const items = transformToItems(maquinas, "id", ["name", "internal_plate"]);
  const campos = ["name", "internalPlate"];

  const handleQuitarItems = async () => {
    try {
      const deleteResults = await Promise.all(
        selectedIds.map(async (id) => {
          const response = await apiService.delete('machines',id); // Asegúrate de usar el endpoint correcto para eliminar por ID
          return response.success;
        })
      );

      const allDeleted = deleteResults.every((success) => success);

      if (allDeleted) {
        quitarItems(); // Esto actualiza las máquinas visibles y muestra la modal
      } else {
        alert("Algunas máquinas no pudieron ser eliminadas.");
      }
    } catch (err) {
     console.warn("Error al conectar con el servidor",err);
    }
  };

  const modalText =
    deletedItems.length > 0
      ? `Se han eliminado las siguientes máquinas:\n${deletedItems.map((m) => m.name).join("\n")}`
      : "";

  if (loading) {
    return (
      <div className="page-container">
        <MenuBar showMenu={false} showArrow={true} />
        <div>Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <MenuBar showMenu={false} path="home" />
        <div>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrap">
      <MenuBar showMenu={false} showArrow={true} path="home"/>
      <h1 className={styles.title}>Máquinas</h1>

      {items.length > 0 ? (
        <>
          <ItemList
            items={items}
            displayKeys={campos}
            onSelect={toggleSelectItem}
            selectedIds={selectedIds}
            selectItems={true}
            deleteItems={false}
            selectSingleItem={false} // Puedes cambiarlo a true si solo quieres permitir seleccionar una máquina a la vez para eliminar
          />
          {/* Paginación */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, marginTop: 2 }}>
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
            <Box sx={{ mt: 1 }}>
              <TextField
                select
                label="Elementos por página"
                value={pageSize}
                onChange={handlePageSizeChange}
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
        </>
      ) : (
        <p style={{textAlign: "center"}}>No hay máquinas disponibles</p>
      )}

      <div className={styles.buttonContainer}>
        {selectedIds.length > 0 && (
          <button
            className={`button button-secondary ${styles.buttonHome}`}
            onClick={handleQuitarItems}
          >
            Quitar
          </button>
        )}
        {buttons.map((button, index) => (
          <Link key={index} href={button.path}>
            <button className={`button button-primary ${styles.buttonHome}`}>
              {button.label}
            </button>
          </Link>
        ))}
      </div>
      </div>
      <Footer />
      <GenericModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Máquinas Eliminadas"
        modalText={modalText}
        buttonTitle="Cerrar"
        showSecondButton={false}
      />
    </div>
  );
}