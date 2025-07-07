"use client"
import Formulario from '@/components/formulario/formulario';
import MenuBar from '@/components/menuBar/MenuBar';
import { Field } from '@/domain/models/Field';
import React, { useEffect, useState, useMemo } from 'react';
import styles from "./modificarAplicacion.module.scss"
import { Box, Step, StepLabel, Stepper, TextField, MenuItem, Button, Typography, Paper } from '@mui/material';
import { useAuth } from '@/components/Auth/AuthProvider';
import { Locacion } from '@/domain/models/Locacion';
import Footer from '@/components/Footer/Footer';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import ItemList from '@/components/itemList/ItemList';
import { Producto } from '@/domain/models/Producto';
import { ResponseItems } from '@/domain/models/ResponseItems';
import { RecipeItem } from '@/domain/models/RecipeItem';
import { Unidad } from '@/domain/enum/Unidad';
import AddRecipeItemModal from '@/components/AddRecipeItemModal/AddRecipeItemModalt';
import { transformToItems } from '@/utilities/transform';
import { useItemsManager } from '@/hooks/useItemsManager';
import { Stock } from '@/domain/models/Stock';
import ResumenOpCrearAplicacion from '@/components/resumenOpCrearAplicacion/ResumenOpCrearAplicacion';
import GenericModal from '@/components/modal/GenericModal';
import ModalConfirmacionEliminacion from '@/components/ModalConfimacionEliminacion/ModalConfirmacionEliminacion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLoading } from '@/hooks/useLoading';
import dayjs from 'dayjs';
import { Roles } from '@/domain/enum/Roles';
import { User } from '@/domain/models/User';
import { Aplicacion } from '@/domain/models/Aplicacion';
import { useUser } from '@/hooks/useUser';

type RecipeItemAAgregar = RecipeItem & {
    id: string;
    prodName: string;
};

type ProductoExistente = Producto & {
    lot_number: string;
    cantidadEnStock: number;
}

const ModificarAplicacionPage: React.FC = () => {
    const searchParams = useSearchParams();
    const applicationId = searchParams.get("id");
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [aplicacion, setAplicacion] = useState<Aplicacion | null>(null);
    const [locations, setLocations] = useState<Locacion[]>([]);
    const [applicators, setApplicators] = useState<User[]>([]);
    const [selectedApplicator, setSelectedApplicator] = useState<string>("");
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
    const [hectareas, setHectareas] = useState<number>(0);
    const [zona, setZona] = useState<string>("");
    const [campo, setCampo] = useState<string>("");
    const [cultivo, setCultivo] = useState<string>("");
    const [expirationDate, setExpirationDate] = useState<Dayjs | null>(dayjs());
    const [productosAAgregar, setProductosAAgregar] = useState<RecipeItemAAgregar[]>([]);
    const [productosExistentes, setProductosExistentes] = useState<ProductoExistente[]>([]);
    const [addRecipeItemModal, setAddRecipeModalOpen] = useState<boolean>(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] = useState(false);
    const [deleteSuccessModalOpen, setDeleteSuccessModalOpen] = useState(false);
    const router = useRouter();
    const {getApiService} = useAuth();
    const { isReady, user } = useUser();
    const apiService = getApiService();
    const { withLoading } = useLoading();
    const title = 'Modificar Aplicación'
    
    const isEngineer = user?.roles[0].includes(Roles.Encargado);

    const fetchApplication = async (): Promise<Aplicacion | null> => {
        if (!applicationId) return null;
        try {
            const response = await apiService.get<Aplicacion>(`applications/${applicationId}`);
            const app = response.data;
            console.log(app);
            setAplicacion(app);
            
            // Cargar datos de la aplicación existente
            setHectareas(app.surface || 0);
            setSelectedWarehouse(app.stock_location_id || "");
            setSelectedApplicator(app.applicator_id || "");
            setExpirationDate(app.application_date ? dayjs(app.application_date) : dayjs());
            
            // Cargar productos existentes
            if (app.recipe?.recipe_items) {
                const productosExistentes = app.recipe.recipe_items.map((item) => ({
                    product_id: item.product_id,
                    id: item.product_id,
                    prodName: item.product_id, // Se actualizará cuando se carguen los detalles
                    amount: item.amount,
                    unit: item.unit,
                    dose_type: item.dose_type,
                    lot_number: item.lot_number || ""
                }));
                setProductosAAgregar(productosExistentes);
            }
            
            // Cargar ubicación
            if (app.location) {
                setCultivo(app.location.id);
                if (app.location.parent_location) {
                    setCampo(app.location.parent_location.parent_location.id);
                    if (app.location.parent_location.parent_location) {
                        setZona(app.location.parent_location.parent_location.parent_location.id);
                    }
                }
            }
            
            return app;
        } catch (e: any) {
            console.error("Error al cargar la aplicación:", e.message);
            return null;
        }
    };

    const fetchLocations = async (): Promise<Locacion[]> => {
        try {
            const response = await apiService.get<Locacion[]>("locations?type=ZONE&type=FIELD&type=CROP&type=WAREHOUSE");
            const locaciones = response.data;
            return locaciones;
        }
        catch (e: any) {
            console.log(e.message);
            return [];
        }
    }

    const fetchApplicators = async (): Promise<User[]> => {
        try {
            const response = await apiService.get<any>("users/applicators");
            const aplicadores = response.data.users || [];
            setApplicators(aplicadores);
            return aplicadores;
        }
        catch (e: any) {
            console.log(e.message);
            setApplicators([]);
            return [];
        }
    }

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

    useEffect(() => {
        if (!isReady || !applicationId) return;
        const fetchData = async () => {
            setLoading(true);
            const app = await fetchApplication();
            const locs = await fetchLocations();
            await fetchApplicators();
            setLocations(locs);
            
            // Cargar productos del almacén seleccionado
            if (app?.stock_location_id) 
                await fetchProductos(app.stock_location_id);
            else
                await fetchProductos(campo);
            setLoading(false);
        };
        fetchData();
    }, [isReady, applicationId]);

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(hectareas > 0 && cultivo !== "" && expirationDate !== null && selectedWarehouse !== ""){
            setActiveStep(1);
            const locId = locations.find(c => c.id === selectedWarehouse)?.id;
            if(locId)
                fetchProductos(locId);
            else
                alert("Error al encontrar la locacion");
        }
        else{
            alert("Complete bien los campos");
        }
    };

    const handleAddProducto = (producto: ProductoExistente, amount: number, doseType: string) => {
        if (!amount ) return;
        if(!producto) return;
        if(!doseType) return;

        const existingProductIndex = productosAAgregar.findIndex((p) => p.product_id === producto.id);

        if (existingProductIndex !== -1) {
            console.warn("Ya se agrego el producto", producto.name);
            return;
        } else {
            setProductosAAgregar(
                [...productosAAgregar,
                {
                    product_id: producto.id,
                    id: producto.id,
                    prodName: producto.name,
                    amount: amount,
                    unit: producto.unit,
                    dose_type: doseType,
                    lot_number: producto.lot_number
                }]);
        }
    };

    const {
        selectedIds,
        deletedItems,
        isModalOpen,
        toggleSelectItem,
        quitarItems,
        closeModal,
    } = useItemsManager(productosAAgregar);

    const quitarItem = (id: string) => {
        setProductosAAgregar((prev) => prev.filter((item) => item.product_id !== id));
    };

    const items = transformToItems(productosAAgregar, "id", ["prodName", "amount", "unit", "dose_type"]).map((item) => {
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

    const isDataValid = () => {
        return campo !== "" &&
               expirationDate !== null &&
               hectareas !== 0 
    };

    const handleFinish = async () => {
        console.log("Finishing application modification");
        const recipeItems = productosAAgregar.map((p) => ({
            product_id: p.product_id,
            amount: p.amount,
            unit: p.unit,
            dose_type: p.dose_type,
            lot_number: p.lot_number
        }));
        const recipeReq = {
            type: "ENGINEER_RECIPE",
            recipe_items: recipeItems
        }
        const locId = locations.find(c => c.id === cultivo)?.id;
        if(!locId)
            alert("Error al encontrar la locacion");

        const updateAplicationReq = {
            location_id: locId,
            stock_location_id: selectedWarehouse,
            surface: hectareas,
            recipe: recipeReq,
            applicator_id: selectedApplicator ? selectedApplicator : null,
            application_date: expirationDate?.toISOString()
        }

        console.log(updateAplicationReq);
        try {
            const response = await withLoading(
                apiService.update(`applications`,applicationId? applicationId : "", updateAplicationReq),
                "Modificando aplicación..."
            );
            if (response.success) {
                setConfirmationModalOpen(true);
                setAddRecipeModalOpen(false);
                setProductosAAgregar([]);
                setCampo("");
                setExpirationDate(null);
                setHectareas(0);
            } else {
                console.error("Error al modificar la aplicacion:", response.error);
            }
        } catch (error) {
            console.error("Error al modificar la aplicacion:", error);
        }
        setActiveStep(0);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        setDeleteConfirmationModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!applicationId) return;
        
        try {
            const response = await withLoading(
                apiService.delete("applications", applicationId),
                "Eliminando aplicación..."
            );
            
            if (response.success) {
                setDeleteConfirmationModalOpen(false);
                setDeleteSuccessModalOpen(true);
            } else {
                console.error("Error al eliminar la aplicación:", response.error);
                alert("Error al eliminar la aplicación");
            }
        } catch (error) {
            console.error("Error al eliminar la aplicación:", error);
            alert("Error al eliminar la aplicación");
        }
    };

    const handleCloseDeleteConfirmationModal = () => {
        setDeleteConfirmationModalOpen(false);
    };

    const handleCloseDeleteSuccessModal = () => {
        setDeleteSuccessModalOpen(false);
        router.push("/aplicaciones");
    };

    const handleCloseConfirmationModal = () => {
        setConfirmationModalOpen(false);
        router.push("/aplicaciones");
    }

    const filterField = (l: Locacion) => {
        if (l.type !== 'FIELD') return false;

        const parentLoc = locations.find((loc) => loc.id === zona);
        if (!parentLoc) return false;

        return l.parent_location.id === parentLoc.id
    }

    const filterCrop = (l: Locacion) => {
        if (l.type !== 'CROP') return false;

        const parentLoc = locations.find((loc) => loc.id === campo);
        if (!parentLoc) return false;

        return l.parent_location.parent_location.id === parentLoc.id
    }

    if (loading) {
        return <div>Cargando aplicación...</div>;
    }

    if (!aplicacion) {
        return <div>No se encontró la aplicación.</div>;
    }

    return (
        <div className="page-container">
            <div className="content-wrap">
                <MenuBar showMenu={false} showArrow={true} path='/aplicaciones' />
                <h1 className={styles.title}>{title}</h1>

                {/* STEPPER */}
                <Box sx={{ width: '100%', mb: 4 }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {['Ubicación', 'Productos', 'Confirmación'].map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                {/* PASO 1: Formulario */}
                {activeStep === 0 && (
                    <Box sx={{ maxWidth: '600px', mx: 'auto', p: 3 }}>
                        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                            <form onSubmit={handleFormSubmit} className={styles.form}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    name="hectareas"
                                    value={hectareas}
                                    onChange={(e) => setHectareas(Number(e.target.value))}
                                    placeholder="Hectáreas"
                                    label="Hectáreas"
                                    variant="outlined"
                                    sx={{
                                        mb: 2,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            backgroundColor: '#e6ebea',
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: '#404e5c',
                                        },
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    select
                                    name="campo"
                                    value={campo}
                                    onChange={(e) => setCampo(e.target.value)}
                                    label="Selecciona un campo"
                                    variant="outlined"
                                    sx={{
                                        mb: 2,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            backgroundColor: '#e6ebea',
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: '#404e5c',
                                        },
                                    }}
                                >
                                    {locations?.filter((l) => l.type === "FIELD").map((l) => (
                                        <MenuItem key={l.id ?? l.name} value={l.id}>
                                            {l.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    fullWidth
                                    select
                                    name="cultivo"
                                    value={cultivo}
                                    onChange={(e) => setCultivo(e.target.value)}
                                    label="Selecciona un cultivo"
                                    variant="outlined"
                                    disabled = {campo===""}
                                    sx={{
                                        mb: 2,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            backgroundColor: '#e6ebea',
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: '#404e5c',
                                        },
                                    }}
                                >
                                    {locations?.filter((l) => filterCrop(l)).map((l) => (
                                        <MenuItem key={l.id ?? l.name} value={l.id}>
                                            {l.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    fullWidth
                                    select
                                    name="warehouse"
                                    value={selectedWarehouse}
                                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                                    label="Selecciona un depósito"
                                    variant="outlined"
                                    sx={{
                                        mb: 2,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            backgroundColor: '#e6ebea',
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: '#404e5c',
                                        },
                                    }}
                                >
                                    {locations?.filter((l) => l.type === "WAREHOUSE" || l.type === "FIELD").map((l) => (
                                        <MenuItem key={l.id ?? l.name} value={l.id}>
                                            {l.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    fullWidth
                                    select
                                    name="applicator"
                                    value={selectedApplicator}
                                    onChange={(e) => setSelectedApplicator(e.target.value)}
                                    label="Selecciona un aplicador"
                                    variant="outlined"
                                    sx={{
                                        mb: 2,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            backgroundColor: '#e6ebea',
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: '#404e5c',
                                        },
                                    }}
                                >
                                    {Array.isArray(applicators) && applicators.map((applicator) => (
                                        <MenuItem key={applicator.id} value={applicator.id}>
                                            {applicator.first_name+" "+applicator.last_name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DesktopDatePicker']}
                                        sx={{ mb: 2, overflow: 'hidden' }} >
                                        <DatePicker
                                            label="Fecha de Aplicacion"
                                            value={expirationDate}
                                            onChange={(newDate) => setExpirationDate(newDate)}
                                            format="DD/MM/YYYY"
                                            minDate={dayjs()}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    sx: {
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '10px',
                                                            backgroundColor: '#e6ebea',
                                                        },
                                                        '& .MuiInputLabel-root': {
                                                            color: '#404e5c',
                                                        },
                                                    }
                                                }
                                            }}
                                            defaultValue={dayjs()}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                                <button 
                                    type="submit" 
                                    className={`button button-primary ${styles.button}`}
                                    disabled = {!hectareas || selectedWarehouse==="" || cultivo===""}
                                >
                                    Continuar
                                </button>
                                {isEngineer ? (
                                <button 
                                    type="submit" 
                                    className={`button ${styles.danger} ${styles.button}`}
                                    onClick={handleDelete}
                                >
                                    Eliminar
                                </button>):(<></>)
                                }
                            </form>
                        </Paper>
                    </Box>
                )}

                {/* PASO 2: Agregar productos */}
                {activeStep === 1 && (
                    <Box sx={{ maxWidth: '800px', mx: 'auto', p: 3 }}>
                        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                            <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
                                Ingresó {productosAAgregar.length} productos
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
                                Fecha de Aplicación: {expirationDate?.format('DD/MM/YYYY')}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
                                Cultivo: {locations.find(l => l.id===cultivo)?.name}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
                                Hectáreas: {hectareas}
                            </Typography>
                            {productosExistentes.length > 0 ?
                            <>
                                {productosAAgregar.length > 0 ?
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
                                : (
                                    <Typography variant="body1" sx={{ mb: 3, color: '#666', textAlign: 'center' }}>
                                        Ingrese productos para agregar
                                    </Typography>
                                )}

                                <div className={styles.buttonContainer}>
                                    <button
                                        onClick={() => setAddRecipeModalOpen(true)}
                                        disabled={!isDataValid()}
                                        className={`button button-secondary ${styles.button}`}
                                    >
                                        Agregar Producto
                                    </button>
                                </div>
                            </>
                            : (
                                <Typography variant="body1" sx={{ mb: 3, color: '#666', textAlign: 'center' }}>
                                    No hay stock disonible en el campo seleccionado
                                </Typography>
                            )}
                            <div className={styles.buttonContainer}>
                                <button
                                    onClick={() => setActiveStep(0)}
                                    className={`button button-secondary ${styles.button}`}
                                >
                                    Volver
                                </button>
                                <button
                                    onClick={() => setActiveStep(2)}
                                    disabled={productosAAgregar.length === 0}
                                    type="button"
                                    className={`button button-primary ${styles.button}`}
                                >
                                    Confirmar
                                </button>
                            </div>
                        </Paper>
                    </Box>
                )}
                
                {/* Paso 3 Confirmacion */}
                {activeStep === 2 && (
                    <ResumenOpCrearAplicacion
                        handleFinish={handleFinish}
                        products={productosAAgregar}
                        open={true}
                        setModalClose={() => setActiveStep(1)}
                        locacion={campo}
                        hectareas={hectareas}
                        fechaVencimiento={expirationDate?.format('DD/MM/YYYY') || ''}
                    />
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
                title="Aplicacion modificada"
                modalText="Se modificó la aplicacion correctamente"
                buttonTitle="Cerrar"
                showSecondButton={false}
             />

            <ModalConfirmacionEliminacion
                isOpen={deleteConfirmationModalOpen}
                onClose={handleCloseDeleteConfirmationModal}
                onConfirm={handleConfirmDelete}
                text="la aplicación"
            />

            <GenericModal
                isOpen={deleteSuccessModalOpen}
                onClose={handleCloseDeleteSuccessModal}
                title="Aplicación Eliminada"
                modalText="La aplicación ha sido eliminada correctamente"
                buttonTitle="Cerrar"
                showSecondButton={false}
            />

            </div>
            <Footer />
        </div>
    );
};

export default ModificarAplicacionPage; 