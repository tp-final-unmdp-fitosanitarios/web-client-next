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
import Footer from "@/components/Footer/Footer";

interface CreateProductPayload {
  name: string;
  unit: string;
  amount: number;
  brand: string;
  created_at: string;
  agrochemical_id: string;
  provider_ids: string[];
}


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
    agrochemical_id: "",
    created_at: new Date().toISOString(),
    providers: [],
    agrochemical: {
      id: "",
      active_principle: "",
      description: "",
      company_id: "",
      category: "HERBICIDE",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  });

  const [agroquimicos, setAgroquimicos] = useState<Agroquimico[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  useEffect(() => {
    if (!isReady) return;

    const fetchData = async () => {
      try {
        const agroResponse = await apiService.get<ResponseItems<Agroquimico>>("/agrochemicals");
        const provResponse = await apiService.get<ResponseItems<Proveedor>>("/providers");
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
  }, []);

  const handleFormSubmit = (inputData: Record<string, string | number>) => {
    const agroquimicoSeleccionado = agroquimicos.find(
      (a) => a.active_principle === inputData.agroquimico
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
   

    const payload: CreateProductPayload = {
      name: String(inputData.nombre),
      unit: inputData.unidad as string,
      amount: Number(inputData.cantidad),
      brand: String(inputData.marca),
      agrochemical_id: agroquimicoSeleccionado.id,
      created_at: new Date().toISOString(),
      provider_ids: [proveedorSeleccionado.id]
    };
  
    createProduct(payload);
  }
    const createProduct = async (payload:CreateProductPayload) => {
      try {
        const response = await apiService.create<Producto>("/products", payload);

        if (response.success) {
          console.log("Producto creado:", response.data);
          setnewProducto(response.data);
          console.log("new producto",newProducto);
          handleOpenModal();
          router.push("/productos");
        } else {
          console.error("Error al crear el producto:", response.error);
        }
      } catch (error: any) {
        console.error("Error en la solicitud:", error.message);
      }
    };

    const handleCancel = () => {
      router.push("/productos");
    };
    const fields: Field[] = [
      {
        name: "nombre",
        label: "Nombre",
        type: "text",
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
        options: agroquimicos.map((a) => a.active_principle),
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
        <div className="content-wrap">
        <MenuBar showMenu={true} path="/productos" />
        <h1 className={styles.title}>{title}</h1>

        <Formulario
          fields={fields}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          buttonName="Continuar"
        />
        </div>
        <Footer />
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

