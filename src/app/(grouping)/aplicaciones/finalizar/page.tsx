"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MenuBar from "@/components/menuBar/MenuBar";
import ItemList from "@/components/itemList/ItemList";
import { EstadoAplicacion } from "@/domain/enum/EstadoAplicacion";
import { Unidad } from "@/domain/enum/Unidad";
import styles from "./finalizarAplicaciones-view.module.scss";
import Footer from "@/components/Footer/Footer";
import { Aplicacion } from "@/domain/models/Aplicacion";
import { ResponseItems } from "@/domain/models/ResponseItems";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Maquina } from "@/domain/models/Maquina";
import GenericModal from "@/components/modal/GenericModal";
import { useRouter } from 'next/navigation';
import { Box, Step, StepLabel, Stepper, TextField, MenuItem, Button, Paper, Typography, Modal } from '@mui/material';
import { RecipeItem } from "@/domain/models/RecipeItem";
import AddRecipeItemModal from "@/components/AddRecipeItemModal/AddRecipeItemModalt";
import { transformToItems } from "@/utilities/transform";
import { useItemsManager } from "@/hooks/useItemsManager";
import { Stock } from "@/domain/models/Stock";
import { Producto } from "@/domain/models/Producto";
import { useLoading } from "@/hooks/useLoading";
import Image from "next/image";
import VisibilityIcon from '@mui/icons-material/Visibility';
import ClearIcon from '@mui/icons-material/Clear';

type RecipeItemAAgregar = RecipeItem & {
    id: string;
    prodName: string;
};

type ProductoExistente = Producto & {
    lot_number: string;
    cantidadEnStock: number;
}

export default function FinalizarAplicacion() {
    const searchParams = useSearchParams();
    const applicationId = searchParams.get("id");
    const { getApiService, isReady } = useAuth();
    const apiService = getApiService();
    const router = useRouter();
    const { withLoading } = useLoading();

    // State hooks
    const [aplicacion, setAplicacion] = useState<Aplicacion | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [selectedMaquina, setSelectedMaquina] = useState<Maquina | null>(null);
    const [maquinas, setMaquinas] = useState<Maquina[]>([]);
    const [addRecipeItemModal, setAddRecipeModalOpen] = useState<boolean>(false);
    const [productosAAgregar, setProductosAAgregar] = useState<RecipeItemAAgregar[]>([]);
    const [productosExistentes, setProductosExistentes] = useState<ProductoExistente[]>([]);
    const [productosDetalles, setProductosDetalles] = useState<{[key: string]: string}>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileBase64, setFileBase64] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Custom hooks
    const {
        selectedIds,
        deletedItems,
        isModalOpen,
        toggleSelectItem,
        quitarItems,
        closeModal,
    } = useItemsManager(productosAAgregar);

    const fetchProductos = async (locId: string) => {
        try {
            const stockRes = await apiService.get<ResponseItems<Stock>>(`stock?location=${locId}`);
            const stock = stockRes.data.content;
            const prods = stock.map((s) => ({
                ...s.product,
                lot_number: s.lot_number,
                cantidadEnStock: s.amount
            }));
            setProductosExistentes(prods);
        }
        catch (e: any) {
            console.log(e.message);
            return [];
        }
    }

    const fetchApplication = async () => {
        try {
            const response = await apiService.get<Aplicacion>(`applications/${applicationId}`);
            console.log(response);
            const app = response.data
            const loc = app.location.parent_location;
            fetchProductos(loc.id);
            setAplicacion(app);
        } catch (e: any) {
            console.error("Error en la solicitud:", e.message);
        }
    }

    const fetchMaquinas = async () => {
        try {
            const response = await apiService.get<ResponseItems<Maquina>>("machines");
            setMaquinas(response.data.content);
        } catch (e: any) {
            console.error("Error al obtener las máquinas:", e.message);
            setMaquinas([]);
        }
    };

    const handleSelectMaquina = (maquina: Maquina) => {
        if(maquina){
            setSelectedMaquina(maquina);
        }
    }

    const handleFinalizarAplicacion = async () => {
        console.log("Finishing application");
        let recipeItems: RecipeItem[] = [];
        if(productosAAgregar.length === 0)
            aplicacion?.recipe.recipe_items.forEach(ri => recipeItems.push(ri));
        else
            productosAAgregar.map((p) => {
                const prod = aplicacion?.recipe.recipe_items.find((prod)=>prod.product_id===p.product_id);
                if(prod && prod.dose_type===p.dose_type)
                    recipeItems.push({
                        product_id: p.product_id,
                        amount: p.amount+prod.amount,
                        unit: p.unit,
                        dose_type: p.dose_type,
                        lot_number: p.lot_number
                    })
                else
                    recipeItems.push({
                        product_id: p.product_id,
                        amount: p.amount,
                        unit: p.unit,
                        dose_type: p.dose_type,
                        lot_number: p.lot_number
                    })
            });
        const recipeReq = {
            type: "ENGINEER_RECIPE",
            recipe_items: recipeItems
        }
        const attachment = {
            attachment: fileBase64,
            mime_type: selectedFile?.type
        }
    
        const finishAplicationReq = {
            actual_application: recipeReq,
            attachment: attachment,
            machine_id: selectedMaquina?.id
        }

        console.log(finishAplicationReq);
        try {
            const response = await withLoading(
                apiService.create(`applications/${aplicacion?.id}/finish`, finishAplicationReq),
                "Creando aplicación..."
            );
            if (response.success) {
                setConfirmationModalOpen(true);
                setAddRecipeModalOpen(false);
                setProductosAAgregar([]);
            } else {
                console.error("Error al crear la aplicacion:", response.error);
            }
        } catch (error) {
            console.error("Error al crear la aplicacion:", error);
        }
        setActiveStep(0);
    }

    const fetchData = async () => {
        // Simula un fetch con mock
        fetchMaquinas();
        await fetchApplication();
        //if(aplicacion?.location){
        //    const loc = aplicacion?.location.parent_location;
          //  fetchProductos(loc.id);
        //}
        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, [applicationId]);

    useEffect(() => {
        if (aplicacion) {
            fetchProductosDetalles();
        }
    }, [aplicacion]);

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [selectedFile]);

    if (loading) 
        return <div>Cargando...</div>;
    if (!aplicacion) return <div>No se encontró la aplicación.</div>;

    const cultivo = aplicacion.location.name;
    const fecha = new Date(aplicacion.created_at).toLocaleDateString();

    const fetchProductosDetalles = async () => {
        try {
            const productosIds = aplicacion?.recipe?.recipe_items?.map(item => item.product_id) || [];
            const detalles = await Promise.all(
                productosIds.map(async (id) => {
                    const response = await apiService.get<Producto>(`products/${id}`);
                    return { id, name: response.data.name };
                })
            );
            const detallesMap = detalles.reduce((acc, curr) => {
                acc[curr.id] = curr.name;
                return acc;
            }, {} as {[key: string]: string});
            setProductosDetalles(detallesMap);
        } catch (error) {
            console.error("Error al obtener detalles de productos:", error);
        }
    };

    const productos = aplicacion.recipe?.recipe_items?.map((item) => ({
        id: item.product_id,
        title: productosDetalles[item.product_id] || item.product_id,
        description: `${item.unit.toLowerCase()} x ${item.amount}${item.unit} - ${item.dose_type === "SURFACE" ? item.amount + "/Ha" : item.amount}`
    })) || [];

    const items = productos.map(p => ({
        id: p.id.toString(),
        title: p.title,
        description: p.description
    }));

    function handleCloseConfirmationModal(): void {
        setConfirmationModalOpen(false);
        router.push("/aplicaciones");
    }

    const customInputSx = {
        '& .MuiInputBase-root': {
            borderRadius: '10px',
            backgroundColor: '#e6ebea',
            paddingX: 1,
            fontWeight: 'bold',
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#404e5c',
            borderWidth: '2px',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#404e5c',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#404e5c',
        },
        '& .MuiInputLabel-root': {
            fontWeight: 'bold',
            color: '#404e5c',
        },
        '&.Mui-focused .MuiInputLabel-root': {
            color: '#404e5c',
        },
    };

    const handleAddProducto = (producto: ProductoExistente, amount: number, dose_type: string) => {
        if (!amount ) return;
        if(!producto) return;
        if(!dose_type) return;


       // const formattedExpirationDate = new Date(expirationDate.$y, expirationDate.$M, expirationDate.$D).toISOString();

        const existingProductIndex = productosAAgregar.findIndex((p) => p.product_id === producto.id);

        if (existingProductIndex !== -1) {
            console.warn("Ya se agrego el producto", producto.name);
            return;
        } else {
            setProductosAAgregar(
                [...productosAAgregar,
                {
                    product_id: producto.id,
                    id: producto.id, //Esto se hace para poder usar el useItemManager
                    prodName: producto.name,
                    amount: amount,
                    unit: producto.unit,
                    dose_type: dose_type,
                    lot_number: producto.lot_number
                }]);
        }
    };

    const quitarItem = (id: string) => {
        setProductosAAgregar((prev) => prev.filter((item) => item.product_id !== id));
    };

    const productosAdicionales = transformToItems(productosAAgregar, "id", ["prodName", "amount", "unit", "dose_type"]).map((item) => {
        if(item.dose_type==="SURFACE")
            return {
                ...item,
                display: `${item.prodName}: ${item.amount} ${item.unit} POR HECTAREA`
            };
        else
        return {
            ...item,
            display: `${item.prodName}: ${item.amount} ${item.unit} EN TOTAL`
        };
    });

    const campos = ["display"];

    const handleVerArchivo = () => {
        if (!previewUrl) {
            alert("Aún no has cargado un archivo.");
            return;
        }
        if (selectedFile?.type.startsWith("image/")) {
            setIsPreviewOpen(true);
        } else {
            window.open(previewUrl, "_blank");
        }
    };

    const handleFileSelect = (file: File | null) => {
        if (file) {
            // Check file size (10MB = 10 * 1024 * 1024 bytes)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                alert("El archivo es demasiado grande. El tamaño máximo permitido es 10MB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
                const base64WithoutPrefix = base64String.split(',')[1];
                setFileBase64(base64WithoutPrefix);
            };
            reader.readAsDataURL(file);
        } else {
            setFileBase64(null);
        }
        setSelectedFile(file);
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setFileBase64(null);
    };

    return (
        <div className="page-container">
            <div className="content-wrap">
                <MenuBar showMenu={false} showArrow={true} path="/aplicaciones"/>
                <div className={styles.finalizarHeader}>Finalizar Aplicación</div>

                {/* STEPPER */}
                <Box sx={{ width: '100%', mb: 4 }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {['Datos', 'Máquina', 'Archivo', 'Productos'].map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                {/* PASO 1: Datos */}
                {activeStep === 0 && (
                    <div className={styles.container}>
                        <div className={styles.finalizarInfo}>
                            <div>Cultivo: {cultivo}</div>
                            <div>Fecha: {fecha}</div>
                        </div>
                        <h3 className={styles.productTitle}>Productos aplicados</h3>
                        <ItemList
                            items={items}
                            displayKeys={["title", "description"]}
                            selectItems={false}
                            deleteItems={false}
                            selectSingleItem={false}
                        />
                        <div className={styles.buttonContainer}>
                            <button 
                                className={`button button-primary ${styles.button}`}  
                                onClick={() => setActiveStep(1)}
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {/* PASO 2: Selección de Máquina */}
                {activeStep === 1 && (
                    <div className={styles.container}>
                        <h3 className={styles.productTitle}>Seleccione la máquina utilizada</h3>
                        <TextField
                            fullWidth
                            select
                            value={selectedMaquina?.id || ""}
                            onChange={(e) => {
                                const maquina = maquinas.find(m => m.id === e.target.value);
                                if (maquina) handleSelectMaquina(maquina);
                            }}
                            label="Seleccione una máquina"
                            variant="outlined"
                            sx={{
                                mb: 2,
                                ...customInputSx
                            }}
                        >
                            {maquinas.map((m) => (
                                <MenuItem key={m.id} value={m.id}>
                                    {m.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            label="Patente"
                            value={selectedMaquina?.internal_plate || ''}
                            InputProps={{ readOnly: true }}
                            sx={{
                                mt: 2,
                                ...customInputSx
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Modelo"
                            value={selectedMaquina?.model || ''}
                            InputProps={{ readOnly: true }}
                            sx={{
                                mt: 2,
                                ...customInputSx
                            }}
                        />

                        <div className={styles.buttonContainer}>
                            <button
                                className={`button button-secondary ${styles.button}`}
                                onClick={() => setActiveStep(0)}
                            >
                                Volver
                            </button>
                            <button
                                className={`button button-primary ${styles.button}`}
                                onClick={() => setActiveStep(2)}
                                disabled={!selectedMaquina}
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {/* PASO 3: Archivo */}
                {activeStep === 2 && (
                    <div className={styles.container}>
                        <h3 className={styles.productTitle}>Cargar archivo de la aplicación</h3>
                        <div className={styles.fileInputContainer}>
                            <label htmlFor="archivoFile" className={styles.label}>
                                Cargar Archivo
                            </label>
                            <div className={styles.fileInputWrapper}>
                                <input
                                    id="archivoFile"
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={e => handleFileSelect(e.target.files?.[0] ?? null)}
                                    style={{ display: "none" }}
                                />
                                <label
                                    htmlFor="archivoFile"
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
                                <VisibilityIcon className={styles.fileIcon} onClick={handleVerArchivo} />
                                <ClearIcon className={styles.fileIcon} onClick={handleClearFile} />
                            </div>
                        )}

                        <div className={styles.buttonContainer}>
                            <button
                                className={`button button-secondary ${styles.button}`}
                                onClick={() => setActiveStep(1)}
                            >
                                Volver
                            </button>
                            <button
                                className={`button button-primary ${styles.button}`}
                                onClick={() => setActiveStep(3)}
                                disabled={!selectedFile}
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {/* PASO 4: Productos */}
                {activeStep === 3 && (
                    <Box sx={{ maxWidth: '800px', mx: 'auto', p: 3 }}>
                        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                            <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
                                Ingresó {productosAAgregar.length} productos
                            </Typography>

                            {productosAAgregar.length > 0 ? (
                                <ItemList
                                    items={productosAdicionales}
                                    displayKeys={campos}
                                    onSelect={toggleSelectItem}
                                    selectedIds={selectedIds}
                                    selectItems={false}
                                    deleteItems={true}
                                    onDelete={quitarItem}
                                    selectSingleItem={false}
                                />
                            ) : (
                                <Typography variant="body1" sx={{ mb: 3, color: '#666', textAlign: 'center' }}>
                                    Ingrese productos adicionales a la aplicacion
                                </Typography>
                            )}

                            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setAddRecipeModalOpen(true)}
                                    sx={{
                                        flex: 1,
                                        py: 1.5,
                                        borderColor: '#404e5c',
                                        color: '#404e5c',
                                        '&:hover': {
                                            borderColor: '#404e5c',
                                            backgroundColor: 'rgba(64, 78, 92, 0.04)',
                                        },
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Agregar Producto
                                </Button>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setActiveStep(2)}
                                    sx={{
                                        flex: 1,
                                        py: 1.5,
                                        borderColor: '#404e5c',
                                        color: '#404e5c',
                                        '&:hover': {
                                            borderColor: '#404e5c',
                                            backgroundColor: 'rgba(64, 78, 92, 0.04)',
                                        },
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Volver
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleFinalizarAplicacion}
                                    type="button"
                                    sx={{
                                        flex: 1,
                                        py: 1.5,
                                        backgroundColor: '#4CAF50',
                                        '&:hover': {
                                            backgroundColor: '#45a049',
                                        },
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Confirmar
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                )}

                {addRecipeItemModal && (
                    <AddRecipeItemModal
                        handleAddProducto={handleAddProducto}
                        products={productosExistentes}
                        open={addRecipeItemModal}
                        setModalClose={() => setAddRecipeModalOpen(false)}
                    />
                )}

                <GenericModal
                    isOpen={confirmationModalOpen}
                    onClose={handleCloseConfirmationModal}
                    title="Aplicación Finalizada"
                    modalText="La aplicación ha sido finalizada exitosamente"
                    buttonTitle="Cerrar"
                    showSecondButton={false}
                />

                {/* Modal imagen archivo */}
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
                                    alt={`Archivo — ${selectedFile.name}`}
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
}
