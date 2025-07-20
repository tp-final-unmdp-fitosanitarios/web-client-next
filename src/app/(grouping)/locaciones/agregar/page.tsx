/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Auth/AuthProvider";
import { useLoading } from "@/hooks/useLoading";
import MenuBar from "@/components/menuBar/MenuBar";
import Footer from "@/components/Footer/Footer";
import styles from "./agregar-locacion.module.scss";
import { Locacion } from "@/domain/models/Locacion";
import { ResponseItems } from "@/domain/models/ResponseItems";

const locationTypes = {
    ZONE: "Zona",
    WAREHOUSE: "Depósito",
    FIELD: "Campo",
    CROP: "Cultivo",
    LOT: "Lote"
};

export default function AgregarLocacion() {
    const router = useRouter();
    const { getApiService } = useAuth();
    const { withLoading } = useLoading();
    const apiService = getApiService();

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        area: "",
        type: "ZONE",
        parent_location_id: "",
        end_of_sowing: "",
        variety: "",
        crop_number: ""
    });

    const [parentLocations, setParentLocations] = useState<Locacion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchParentLocations = async (type: string) => {
        setLoading(true);
        try {
            let parentType = "";
            switch (type) {
                case "WAREHOUSE":
                    parentType = "ZONE";
                    break;
                case "FIELD":
                    parentType = "ZONE";
                    break;
                case "LOT":
                    parentType = "FIELD";
                    break;
                case "CROP":
                    parentType = "LOT";
                    break;
                default:
                    setParentLocations([]);
                    setLoading(false);
                    return;
            }

            const response = await withLoading(
                apiService.get<ResponseItems<Locacion>>(`/locations?type=${parentType}&size=100`),
                "Cargando ubicaciones padre..."
            );
      
            if (response.success) {
                setParentLocations(response.data.content);
            } else {
                setError(response.error || "Error al obtener las ubicaciones padre");
            }
        } catch (error) {
            setError("Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParentLocations(formData.type);
    }, [formData.type]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset parent_location_id when type changes
            ...(name === "type" && { parent_location_id: "" })
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.name || !formData.type) {
            setError("Por favor complete todos los campos requeridos");
            return;
        }

        // Validate parent location based on type
        if (formData.type !== "ZONE" && !formData.parent_location_id) {
            setError("Por favor seleccione una ubicación padre");
            return;
        }

        // Transform formData: replace empty strings with null
        const payload = Object.fromEntries(
            Object.entries(formData).map(([key, value]) => [key, value === "" ? null : value])
        );

        try {
            const response = await withLoading(
                apiService.create("/locations", payload),
                "Creando locación..."
            );

            if (response.success) {
                router.push("/locaciones");
            } else {
                setError(response.error || "Error al crear la locación");
            }
        } catch (error) {
            console.log("Error", error)
            setError("Error al conectar con el servidor");
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <MenuBar showMenu={true} path="" />
                <div className={styles.loadingContainer}>Cargando...</div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className={styles.contentWrap}>
                <MenuBar showMenu={true} path="" />
                <div className={styles.mainContent}>
                    <h1 className={styles.title}>Agregar Nueva Locación</h1>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Nombre *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="type">Tipo *</label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                required
                            >
                                {Object.entries(locationTypes).map(([key, value]) => (
                                    <option key={key} value={key}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {(formData.type === "WAREHOUSE" || formData.type === "FIELD" || formData.type === "LOT" || formData.type === "CROP") && (
                            <div className={styles.formGroup}>
                                <label htmlFor="parent_location_id">Ubicación Padre *</label>
                                <select
                                    id="parent_location_id"
                                    name="parent_location_id"
                                    value={formData.parent_location_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione a que ubicacion pertenece</option>
                                    {parentLocations?.map(location => (
                                        <option key={location.id} value={location.id}>
                                            {location.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label htmlFor="address">Dirección</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                        </div>

                        {(formData.type === "FIELD" || formData.type === "CROP") && (
                            <div className={styles.formGroup}>
                                <label htmlFor="area">Área (hectáreas)</label>
                                <input
                                    type="number"
                                    id="area"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                        )}

                        {formData.type === "CROP" && (
                            <>
                                <div className={styles.formGroup}>
                                    <label htmlFor="end_of_sowing">Fin de siembra *</label>
                                    <input
                                        type="date"
                                        id="end_of_sowing"
                                        name="end_of_sowing"
                                        value={formData.end_of_sowing}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="variety">Variedad *</label>
                                    <input
                                        type="text"
                                        id="variety"
                                        name="variety"
                                        value={formData.variety}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="crop_number">Número de cultivo *</label>
                                    <input
                                        type="text"
                                        id="crop_number"
                                        name="crop_number"
                                        value={formData.crop_number}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </>
                        )}

                        {error && <div className={styles.error}>{error}</div>}

                        <div className={styles.buttonContainer}>
                            <button
                                type="button"
                                className="button button-secondary"
                                onClick={() => router.push("/locaciones")}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="button button-primary">
                                Crear
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
} 