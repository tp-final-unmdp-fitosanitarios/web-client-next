"use client"
import MenuBar from '@/components/menuBar/MenuBar';
import React, { useEffect, useState } from 'react';
import styles from "./crearAplicacion.module.scss"
import { Box, Step, StepLabel, Stepper, TextField, MenuItem, Typography, Paper } from '@mui/material';
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
import AddRecipeItemModal from '@/components/AddRecipeItemModal/AddRecipeItemModalt';
import { transformToItems } from '@/utilities/transform';
import { useItemsManager } from '@/hooks/useItemsManager';
import { Stock } from '@/domain/models/Stock';
import ResumenOpCrearAplicacion from '@/components/resumenOpCrearAplicacion/ResumenOpCrearAplicacion';
import GenericModal from '@/components/modal/GenericModal';
import { useRouter } from 'next/navigation';
import { useLoading } from '@/hooks/useLoading';
import dayjs from 'dayjs';
import { Roles } from '@/domain/enum/Roles';
import { User } from '@/domain/models/User';

type RecipeItemAAgregar = RecipeItem & {
    id: string;
    prodName: string;
};

type ProductoExistente = Producto & {
    lot_number: string;
    cantidadEnStock: number;
}

const CrearAplicacionPage: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [locations, setLocations] = useState<Locacion[]>([]);
    const [applicators, setApplicators] = useState<User[]>([]);
    const [selectedApplicator, setSelectedApplicator] = useState<string>("");
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
    const [hectareas, setHectareas] = useState<number>(0);
    const [campo, setCampo] = useState<string>("");
    const [cultivo, setCultivo] = useState<string>("");
    const [expirationDate, setExpirationDate] = useState<Dayjs | null>(dayjs());
    const [productosAAgregar, setProductosAAgregar] = useState<RecipeItemAAgregar[]>([]);
    const [productosExistentes, setProductosExistentes] = useState<ProductoExistente[]>([]);
    const [addRecipeItemModal, setAddRecipeModalOpen] = useState<boolean>(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const router = useRouter();
    const { getApiService, isReady, user } = useAuth();
    const apiService = getApiService();
    const { withLoading } = useLoading();
    const title = 'Crear Aplicación'

    const fetchLocations = async (): Promise<Locacion[]> => {
        try {
            const response = await apiService.get<Locacion[]>("locations?type=ZONE&type=FIELD&type=CROP&type=WAREHOUSE");
            return response.data;
        }
        catch (e: unknown) {
            if (e instanceof Error) console.log(e.message);
            return [];
        }
    }

    const fetchApplicators = async (): Promise<User[]> => {
        try {
            const response = await apiService.get<{ users: User[] }>("users/applicators");
            const aplicadores = response.data.users || [];
            setApplicators(aplicadores);
            return aplicadores;
        }
        catch (e: unknown) {
            if (e instanceof Error) console.log(e.message);
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
        catch (e: unknown) {
            if (e instanceof Error) console.log(e.message);
            return [];
        }
    }

    useEffect(() => {
        if (!isReady) return;
        const fetchData = async () => {
            const locs = await fetchLocations();
            await fetchApplicators();
            setLocations(locs);
        };
        fetchData();
    }, [isReady])

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
        if (hectareas > 0 && cultivo !== "" && expirationDate !== null && selectedWarehouse !== "") {
            setActiveStep(1);
            const locId = locations.find(c => c.id === selectedWarehouse)?.id;
            if (locId)
                fetchProductos(locId);
            else
                alert("Error al encontrar la locacion");
        }
        else {
            alert("Complete bien los campos");
        }
    };

    const handleAddProducto = (producto: ProductoExistente, amount: number, doseType: string) => {
        if (!amount || !producto || !doseType) return;

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
                    dose_type: doseType,
                    lot_number: producto.lot_number
                }]);
        }
    };

    const {
        selectedIds,
        toggleSelectItem,
    } = useItemsManager(productosAAgregar);

    const quitarItem = (id: string) => {
        setProductosAAgregar((prev) => prev.filter((item) => item.product_id !== id));
    };

    const items = transformToItems(productosAAgregar, "id", ["prodName", "amount", "unit", "dose_type"]).map((item) => {
        if (item.dose_type === "SURFACE")
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
        if (!locId) {
            alert("Error al encontrar la locacion");
            return;
        }

        const createAplicationReq = {
            location_id: locId,
            stock_location_id: selectedWarehouse,
            surface: hectareas,
            recipe: recipeReq,
            applicator_id: selectedApplicator ? selectedApplicator : null,
            application_date: expirationDate?.toISOString()
        }

        try {
            const endpoint = user?.roles.includes(Roles.Aplicador) ? "applications/instant" : "applications";
            const response = await withLoading(
                apiService.create(endpoint, createAplicationReq),
                "Creando aplicación..."
            );

            if (response.success) {
                setConfirmationModalOpen(true);
                setAddRecipeModalOpen(false);
                setProductosAAgregar([]);
                setCampo("");
                setExpirationDate(null);
                setHectareas(0);
            } else {
                console.error("Error al crear la aplicacion:", response.error);
            }
        } catch (error) {
            console.error("Error al crear la aplicacion:", error);
        }
        setActiveStep(0);
    };

    const handleCloseConfirmationModal = () => {
        setConfirmationModalOpen(false);
        router.push("/aplicaciones");
    }

    const filterCrop = (l: Locacion) => {
        if (l.type !== 'CROP') return false;

        const parentLoc = locations.find((loc) => loc.id === campo);
        if (!parentLoc) return false;

        return l.parent_location.parent_location.id === parentLoc.id //El padre del lote debe ser el campo
    }

    return (
        <div className="page-container">
            <div className="content-wrap">
                <MenuBar showMenu={false} showArrow={true} path='/aplicaciones' />
                <h1 className={styles.title}>{title}</h1>

                <Box sx={{ width: '100%', mb: 4 }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {['Ubicación', 'Productos', 'Confirmación'].map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                {activeStep === 0 && (
                    <Box sx={{ maxWidth: '600px', mx: 'auto', p: 3 }}>
                        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                            <form onSubmit={handleFormSubmit} className={styles.form}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    name="hectareas"
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
                                    disabled={campo === ""}
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
                                            {l.name} - {l.parent_location.name}
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
                                            {applicator.first_name + " " + applicator.last_name}
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
                                    disabled={!hectareas || selectedWarehouse === "" || cultivo === ""}
                                >
                                    Continuar
                                </button>
                            </form>
                        </Paper>
                    </Box>
                )}

                {activeStep === 1 && (
                    <div>
                        <Box sx={{ maxWidth: '800px', mx: 'auto', p: 3 }}>
                            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                                <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
                                    {productosAAgregar.length === 0 ? (
                                        'No se ingresaron productos aún.'
                                    ) : productosAAgregar.length === 1 ? (
                                        'Se ingresó 1 producto.'
                                    ) : (
                                        <>Se ingresaron <strong>{productosAAgregar.length}</strong> productos.</>
                                    )}
                                </Typography>

                                <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
                                    Lugar de aplicación: <strong>{locations.find(l => l.id === cultivo)?.name || 'N/A'}</strong>
                                </Typography>

                                <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
                                    Hectáreas: <strong>{hectareas}</strong>
                                </Typography>

                                <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
                                    Fecha de aplicación: <strong>{expirationDate?.format('DD/MM/YYYY')}</strong>
                                </Typography>

                                {productosExistentes.length > 0 ? (
                                    <>
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
                                ) : (
                                    <Typography variant="body1" sx={{ mb: 3, color: '#666', textAlign: 'center' }}>
                                        No hay stock disponible en el campo seleccionado
                                    </Typography>
                                )}
                            </Paper>
                        </Box>
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
                    </div>
                )}

                {activeStep === 2 && (
                    <ResumenOpCrearAplicacion
                        handleFinish={handleFinish}
                        products={productosAAgregar}
                        open={true}
                        setModalClose={() => setActiveStep(1)}
                        locacion={locations.find((l) => l.id === cultivo)?.name || ''}
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
                    title="Aplicacion creada"
                    modalText="Se creo la aplicacion correctamente"
                    buttonTitle="Cerrar"
                    showSecondButton={false}
                />
            </div>
            <Footer />
        </div>
    );
};

export default CrearAplicacionPage;
