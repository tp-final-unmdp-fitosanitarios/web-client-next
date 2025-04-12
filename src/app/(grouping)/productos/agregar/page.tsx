/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Formulario from "@/components/formulario/formulario";
import GenericModal from "@/components/modal/GenericModal";
import MenuBar from "@/components/menuBar/MenuBar";
import { Unidad } from "@/domain/enum/Unidad";
import { Field } from "@/domain/models/Field";
import { Producto } from "@/domain/models/Producto";
import { Agroquimico } from "@/domain/models/Agroquimico";
import { Proveedor } from "@/domain/models/Proveedor";
import { useAuth } from "@/components/Auth/AuthProvider";
import styles from "./agregarProductos.module.scss";
import { ResponseItems } from "@/domain/models/ResponseItems";

export default function AgregarProductos() {
  const title = "Agregar Producto";
  const router = useRouter();
  const { getApiService, isReady } = useAuth();
  const apiService = getApiService();

  const [modalOpen, setModalOpen] = useState(false);
  const [newProducto, setnewProducto] = useState<Producto>({
    id: "",
    name: "",
    unit: Unidad.Litros,
    amount: 0,
    brand: "",
    agrochemicalId: "",
    createdAt: new Date().toISOString(),
    providers: [],
    agrochemical: {
      id: "",
      activePrinciple: "",
      description: "",
      companyId: "",
      category: "HERBICIDE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });

  const [agroquimicos, setAgroquimicos] = useState<Agroquimico[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  useEffect(() => {
    if (!isReady) return;

    const fetchData = async () => {
      try {
        const agroResponse = await apiService.get<ResponseItems<Agroquimico>>("/agrochemicals");
        const provResponse = await apiService.get<ResponseItems<Proveedor>>("/providers"); //Falla esta peticion ( hay que cargar los datos en el backend)
        if (agroResponse.success && provResponse.success) {
          console.log("Agroquímico recibido ", agroResponse.data.content);
          setAgroquimicos(agroResponse.data.content);
          setProveedores(provResponse.data.content);
        } else {
          console.error("Error al obtener agroquímicos o proveedores");
        }
      } catch (error: any) {
        console.error("Error en la solicitud:", error.message);
      }
    };

    fetchData();
  }, [isReady]);

  const handleOpenModal = useCallback(() => setModalOpen(true), []);
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    router.push("/productos");
  }, [router]);

  const handleFormSubmit = (inputData: Record<string, string | number>) => {
    const agroquimicoSeleccionado = agroquimicos.find(
      (a) => a.activePrinciple === inputData.agroquimico
    );

    const proveedorSeleccionado = proveedores.find(
      (p) => p.name === inputData.proveedor
    );

    if (!agroquimicoSeleccionado) {
      console.error("Agroquímico no encontrado");
      return;
    }

    if (!proveedorSeleccionado) {
      console.error("Proveedor no encontrado");
      return;
    }

    const nuevoProducto: Producto = {
      id: "", 
      name: String(inputData.nombre),
      unit: inputData.unidad as Unidad,
      amount: Number(inputData.cantidad),
      brand: String(inputData.marca),
      createdAt: new Date().toISOString(), 
      agrochemicalId: agroquimicoSeleccionado.id,
      agrochemical: {
        id: agroquimicoSeleccionado.id,
        activePrinciple: agroquimicoSeleccionado.activePrinciple,
        description: agroquimicoSeleccionado.description,
        companyId: agroquimicoSeleccionado.companyId,
        category: inputData.categoria as "HERBICIDE" | "INSECTICIDE" | "FUNGICIDE",
        createdAt: agroquimicoSeleccionado.createdAt,
        updatedAt: agroquimicoSeleccionado.updatedAt,
      },
      providers: [
        {
          id: proveedorSeleccionado.id,
          name: proveedorSeleccionado.name,
          description: proveedorSeleccionado.description,
          companyId: proveedorSeleccionado.companyId,
          products: [],
        },
      ],
    };

    setnewProducto(nuevoProducto);
    createProduct(nuevoProducto);
  };

  const createProduct = async (data: Producto) => {
    try {
      const response = await apiService.create<Producto>("/products", data);

      if (response.success) {
        console.log("Producto creado:", response.data);
        setnewProducto(response.data);
        handleOpenModal();
      } else {
        console.error("Error al crear el producto:", response.error);
      }
    } catch (error: any) {
      console.error("Error en la solicitud:", error.message);
    }
  };

  const handleCancel = () => {
    console.log("Cancel");
  };

  const fields: Field[] = [
    {
      name: "nombre",
      label: "Nombre",
      type: "select",
      options: ["Producto A", "Producto B", "Producto C"],
    },
    { name: "cantidad", label: "Cantidad", type: "number" },
    {
      name: "unidad",
      label: "Unidad",
      type: "select",
      options: Object.values(Unidad),
    },
    { name: "marca", label: "Marca", type: "text" },
    {
      name: "agroquimico",
      label: "Agroquímico",
      type: "select",
      options: agroquimicos.map((a) => a.activePrinciple),
    },
    {
      name: "categoria",
      label: "Categoría",
      type: "select",
      options: ["HERBICIDE", "INSECTICIDE", "FUNGICIDE"],
    },
    {
      name: "proveedor",
      label: "Proveedor",
      type: "select",
      options: proveedores.map((p) => p.name),
    },
  ];

  return (
    <div className="page-container">
      <MenuBar showMenu={true} path="/productos" />
      <h1 className={styles.title}>{title}</h1>

      <Formulario
        fields={fields}
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
        buttonName="Continuar"
      />

      <GenericModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title="Producto añadido"
        modalText={`Se añadió el producto: ${newProducto.name}`}
        buttonTitle="Cerrar"
        showSecondButton={false}
      />
    </div>
  );
}
