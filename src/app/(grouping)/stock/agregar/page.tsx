/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import Formulario from '@/components/formulario/formulario';
import MenuBar from '@/components/menuBar/MenuBar';
import { Unidad } from '@/domain/enum/Unidad';
import { Field } from '@/domain/models/Field';
import { Remito } from '@/domain/models/Remito';
import React, { useEffect, useState, useMemo } from 'react';
import styles from "./agregarStock.module.scss"
import { Box, Modal, Step, StepLabel, Stepper } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ClearIcon from '@mui/icons-material/Clear';
import Link from 'next/link';
import ItemList from '@/components/itemList/ItemList';
import { transformToItems } from '@/utilities/transform';
import { Producto } from '@/domain/models/Producto';
import ModalAgregarProducto from "../../../../components/AgregarStock/modalStockAgregarProd/ModalAgregarProducto"
import ResumenOperacion from "../../../../components/AgregarStock//resumenOperacionAgregar/ResumenOperacion"
import { Locacion } from '@/domain/models/Locacion';
import { useItemsManager } from '@/hooks/useItemsManager';
import { useRouter } from 'next/navigation';
import { ResponseItems } from '@/domain/models/ResponseItems';
import { useAuth } from '@/components/Auth/AuthProvider';
import Footer from '@/components/Footer/Footer';
import GenericModal from '@/components/modal/GenericModal';
import Image from 'next/image';
import { Proveedor } from '@/domain/models/Proveedor';

type ProductoAAgregar = {
    id: string;
    name: string;
    size: number;
    amount_of_units: number | null;
    total_amount: number | null;
    unit: string;
    expirationDate: string;
    lotNumber: string;
};

const AgregarStockPage: React.FC = () => {
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [remito, setRemito] = useState<any>(null);
    const [productosExistentes, setProductosExistentes] = useState<Producto[]>([]);
    const [locations, setLocations] = useState<Locacion[]>([]);
    const [providers, setProviders] = useState<Proveedor[]>([]);
    const [productosAAgregar, setProductosAAgregar] = useState<ProductoAAgregar[]>([]);
    const [addProductModalOpen, setAddProductModalOpen] = useState(false);
    const [finishModalOpen, setFinishModalOpen] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [activeStep, setActiveStep] = useState(0);

    const { getApiService, isReady } = useAuth();
    const apiService = getApiService();
    const title = 'Agregar Stock'

    const handleAddProductOpenModal = () => setAddProductModalOpen(true);
    const handleAddProductCloseModal = () => setAddProductModalOpen(false);
    const handleFinishCloseModal = () => setFinishModalOpen(false);
    const handleFinishOpenModal = () => {
        //Valido los campos del form
        if (!remito)
            return
        if (productosAAgregar.length != remito.cantProductos) //CantProductos es de tipo any, si comparo tambien tipos, explota
            return

        setFinishModalOpen(true);
    }

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [selectedFile]);

    const handleVerRemito = () => {
        if (!previewUrl) {

            alert("Aún no has cargado un remito.");
            return;
        }
        if (selectedFile?.type.startsWith("image/")) {

            setIsPreviewOpen(true);
        } else {

            window.open(previewUrl, "_blank");
        }
    };

    const handleFileSelect = (file: File | null) => {
        setSelectedFile(file);
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleAddProducto = (producto: string, lotNumber: string, expirationDate: any, amount_of_units: number | null, total_amount: number | null) => {
        if (!amount_of_units && !total_amount) return;

        const prod = productosExistentes.find((p) => p.name === producto);
        if (!prod || !prod.id) return;

        if (productosAAgregar.length >= remito.cantProductos) {
            console.warn("No se pueden agregar más productos.");
            return;
        }

        const formattedExpirationDate = new Date(expirationDate.$y, expirationDate.$M, expirationDate.$D).toISOString();

        const existingProductIndex = productosAAgregar.findIndex((p) => p.id === prod.id);
        if (existingProductIndex !== -1) {
            console.warn("Ya se agrego el producto", prod.name);
            return;
        } else {
            setProductosAAgregar(
                [...productosAAgregar,
                {
                    id: prod.id,
                    name: producto,
                    size: prod.amount,
                    unit: prod.unit,
                    total_amount: total_amount,
                    amount_of_units: amount_of_units,
                    expirationDate: formattedExpirationDate,
                    lotNumber
                }]);
        }
    };

    const fetchProductos = async () => {
        try {
            const response = await apiService.get<ResponseItems<Producto>>("/products");
            const productos = response.data.content;
            return productos;
        }
        catch (e: any) {
            console.log(e.message);
            return [];
        }

    }

    const fetchLocations = async (): Promise<Locacion[]> => {
        try {
            const response = await apiService.get<Locacion[]>("/locations?type=WAREHOUSE,FIELD");
            const locaciones = response.data;
            console.log("locaciones", locaciones);

            return locaciones;
        }
        catch (e: any) {
            console.log(e.message);
            return []; //Aca puede caer por falta de conexion o forbbiden. Chequear como lo manejamos
        }
    }

    const fetchProviders = async () => {
      try {
          const response = await apiService.get<ResponseItems<Proveedor>>("/providers");
          const providers = response.data.content;
          console.log("providers", providers);

          return providers;
      }
      catch (e: any) {
          console.log(e.message);
          return []; //Aca puede caer por falta de conexion o forbbiden. Chequear como lo manejamos
      }
  }

    useEffect(() => {
        if (!isReady) return;
        const fetchData = async () => {
            const [prods, locs, provs] = await Promise.all([fetchProductos(), fetchLocations(), fetchProviders()]);
            setProductosExistentes(prods);
            setLocations(locs);
            setProviders(provs);
        };
        fetchData();
    }, [isReady])

    const handleFormSubmit = (inputData: Record<string, string>) => {
        setRemito({
            campo: String(inputData.campo),
            cantProductos: inputData.cantProductos,
            archivo: selectedFile?.name,
            fecha: new Date(),
            provider: String(inputData.provider)
        });
        setActiveStep(1);
    };

    const isFormValid = (formData: Record<string, string>) => {
        return formData.nroRemito && 
               formData.campo && 
               formData.cantProductos &&
               formData.provider &&
               selectedFile !== null;
    };

    const handleCancel = () => {
        setAddProductModalOpen(false);
        setFinishModalOpen(false);
        setProductosAAgregar([]);
        router.push("/stock");
    }

    const handleFinish = () => {
        const loc = locations?.find((l) => l.name === remito.campo)?.id;
        const prov = providers?.find((p) => p.name === remito.provider)?.id;
        
        if (!loc) throw new Error("No se encontro la ubicación");
        if (!prov) throw new Error("No se encontro el proveedor");

        const addStockRequest = {
            company_id: 1,
            products: productosAAgregar.map((p) => {
                const prod = productosExistentes.find((prod) => prod.id === p.id);
                const prodReq = {
                    product_id: p.id,
                    unit: p.unit,
                    lot_number: p.lotNumber,
                    expiration_date: p.expirationDate
                }

                if (p.amount_of_units)
                    return { ...prodReq, amount_of_units: p.amount_of_units, total_amount: null };

                if (p.total_amount)
                    return { ...prodReq, total_amount: p.total_amount, amount_of_units: null };

            }),
            attachment: remito.archivo,
            location_id: loc,
            provider_id: prov
        }
        console.log(loc);
        console.log(addStockRequest);
        apiService.create("/delivery", addStockRequest).then((response: any) => {
            if (response.success) {
                setConfirmationModalOpen(true);
                setAddProductModalOpen(false);
                setFinishModalOpen(false);
                setProductosAAgregar([]);
            } else {
                console.error("Error al agregar stock:", response.error);
            }
        })
        setActiveStep(0);
    }

    const fields = useMemo<Field[]>(() => [
        { name: "nroRemito", label: "Numero de Remito", type: "text" },
        { name: "campo", label: "Ubicación", type: "select", options: locations ? Array.from(new Set(locations.map((l) => l.name))).sort() : [] },
        { name: "provider", label: "Proveedor", type: "select", options: Array.isArray(providers) ? Array.from(new Set(providers.map((p) => p.name))).sort() : [] },
        { name: "cantProductos", label: "Cantidad de Productos", type: "number" },
    ], [locations, providers]);

    const items = transformToItems(productosAAgregar, "id", ["name", "size", "unit", "amount_of_units", "total_amount"]).map((item) => {
        if (item.amount_of_units !== "null") {
            return {
                ...item,
                display: `${item.name} ${item.size} ${item.unit} x ${item.amount_of_units}U`,
            };
        } else if (item.total_amount !== "null") {
            return {
                ...item,
                display: `${item.name} ${item.total_amount} ${item.unit}`,
            };
        }
        return item;
    });

    const campos = ["display"];

    const buttons = [
        { label: "Cancelar", path: "/stock" },
        { label: "Mover", path: "/stock/mover" },
        { label: "Retirar", path: "/stock/retirar" },
        { label: "Ver Movimientos", path: "/stock/movimientos" },
        { label: "Proveedores", path: "/stock/proveedores" },
    ];

    const {
        selectedIds,
        deletedItems,
        isModalOpen,
        toggleSelectItem,
        quitarItems,
        closeModal,
    } = useItemsManager(productosAAgregar);

    const quitarItem = (id: string) => {
        setProductosAAgregar((prev) => prev.filter((item) => item.id !== id));
    };

    const handleCloseConfirmationModal = () => {
        setConfirmationModalOpen(false);
        router.push("/stock");
    }


    return (
    <div className="page-container">
    <div className="content-wrap">
        <MenuBar showMenu={false} showArrow={true} path='/stock' />
        <h1 className={styles.title}>Agregar Stock</h1>

        {/* STEPPER */}
        <Box sx={{ width: '100%', mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
            {['Remito', 'Agregar Productos', 'Confirmación'].map((label) => (
            <Step key={label}>
                <StepLabel>{label}</StepLabel>
            </Step>
            ))}
        </Stepper>
        </Box>

    {/* PASO 1: Formulario */}
    {activeStep === 0 && (
      <div className={styles.formAndItemListContainer}>
        <div className={styles.formContainer}>
          <h3>Nuevo Remito</h3>
          <Formulario
            fields={fields}
            onSubmit={handleFormSubmit}
            buttonName="Continuar"
            equalButtonWidth={true}
            isSubmitDisabled={(formData) => !isFormValid(formData)}
          >
            <div className={styles["input-group"]}>
              <div className={styles.fileInputContainer}>
                <label htmlFor="remitoFile" className={styles.label}>
                  Cargar Remito
                </label>
                <div className={styles.fileInputWrapper}>
                  <input
                    id="remitoFile"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={e => handleFileSelect(e.target.files?.[0] ?? null)}
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="remitoFile"
                    className={`${styles.button} ${selectedFile ? styles.buttonChange : styles.buttonSelect}`}
                    style={{ cursor: "pointer" }}
                  >
                    {selectedFile ? "Cambiar" : "Seleccionar"}
                  </label>
                </div>
              </div>
              {selectedFile && (
                <div className={styles.filePreviewContainer}>
                  <span className={styles.fileName}>{selectedFile.name}</span>
                  <VisibilityIcon className={styles.fileIcon} onClick={handleVerRemito} />
                  <ClearIcon className={styles.fileIcon} onClick={handleClearFile} />
                </div>
              )}
            </div>
          </Formulario>

          <div className={styles.buttonContainer}>
            <Link href="/stock">
              <button className={`button button-secondary ${styles.buttonHome} ${styles.buttonCancel}`}>
                Cancelar
              </button>
            </Link>
          </div>
        </div>
      </div>
    )}

    {/* PASO 2: Agregar productos */}
    {activeStep === 1 && (
      <div className={styles.itemListContainer}>
        <h3>Agregar Stock</h3>
        <p>Ingresó {productosAAgregar.length}/{remito?.cantProductos} productos</p>

        {productosAAgregar.length > 0 ? (
          <ItemList
            items={items}
            displayKeys={campos}
            onSelect={toggleSelectItem}
            selectedIds={selectedIds}
            selectItems={false}
            deleteItems={true}
            onDelete={quitarItem}
            selectSingleItem={false}
          />
        ) : (
          <p>Ingrese productos para agregar stock</p>
        )}
        <button
          type="submit"
          className={`${styles.button} ${styles.buttonPrimary}`}
          onClick={() => setAddProductModalOpen(true)}
          disabled={!remito}
        >
          Agregar Producto
        </button>

        <div className={styles.buttonContainer}>
          <button
            className={`button button-secondary`}
            onClick={() => setActiveStep(0)}
          >
            Volver
          </button>
          <button
            className={`button button-primary ${styles.buttonHome} ${styles.buttonFinish} `}
            onClick={() => setActiveStep(2)}
            disabled={productosAAgregar.length < Number(remito.cantProductos)}
          >
            Confirmar
          </button>
        </div>
      </div>
    )}

    {/* PASO 3: Confirmación */}
    {activeStep === 2 && (
      <ResumenOperacion
        handleFinish={handleFinish}
        products={productosAAgregar}
        open={true}
        setModalClose={() => setActiveStep(1)}
        locacion={remito.campo}
        remito={remito.archivo}
      />
    )}

    {/* MODALES */}
    {addProductModalOpen && (
      <ModalAgregarProducto
        handleAddProducto={handleAddProducto}
        products={productosExistentes}
        open={addProductModalOpen}
        setModalClose={() => setAddProductModalOpen(false)}
        cantActual={productosAAgregar.length}
        limite={remito?.cantProductos}
      />
    )}

    <GenericModal
      isOpen={confirmationModalOpen}
      onClose={handleCloseConfirmationModal}
      title="Producto añadido"
      modalText="Se agregó stock correctamente"
      buttonTitle="Cerrar"
      showSecondButton={false}
    />

    {/* Modal imagen remito */}
    <Modal open={isPreviewOpen} onClose={() => setIsPreviewOpen(false)}>
      <Box
        sx={{
          position: 'absolute' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 2,
          width: '80vw',
          height: '80vh',
          overflow: 'hidden',
        }}
      >
        {previewUrl && selectedFile?.type.startsWith('image/') && (
          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <Image
              src={previewUrl}
              alt={`Remito — ${selectedFile.name}`}
              fill
              style={{ objectFit: 'contain' }}
              unoptimized
            />
          </Box>
        )}
      </Box>
    </Modal>

  
        </div>
        <Footer />
    </div>
    
    );
};

export default AgregarStockPage;