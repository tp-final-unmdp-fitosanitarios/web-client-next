"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Formulario from "@/components/formulario/formulario";
import GenericModal from "@/components/modal/GenericModal";
import MenuBar from "@/components/menuBar/MenuBar";
import AgrochemicalSelector from "@/components/AgrochemicalSelector/AgrochemicalSelector";
import { Unidad } from "@/domain/enum/Unidad";
import { Field } from "@/domain/models/Field";
import { Producto } from "@/domain/models/Producto";
import { Agroquimico } from "@/domain/models/Agroquimico";
import { useAuth } from "@/components/Auth/AuthProvider";
import styles from "./editProductos.module.scss";
import { ResponseItems } from "@/domain/models/ResponseItems";
import Footer from "@/components/Footer/Footer";

interface EditProductPayload {
  name: string;
  unit: string;
  amount: number;
  brand: string;
  agrochemicals: {
    agrochemical_id: string;
    percentage: number;
  }[];
}

interface AgrochemicalSelection {
  id: string;
  active_principle: string;
  percentage: number;
}



const EditarProducto = () => {
  const title = "Editar Producto";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getApiService, isReady } = useAuth();
  const apiService = getApiService();

  const [modalOpen, setModalOpen] = useState(false);
  const [product, setProduct] = useState<Producto | null>(null);

  const [agroquimicos, setAgroquimicos] = useState<Agroquimico[]>([]);
  const [selectedAgrochemicals, setSelectedAgrochemicals] = useState<AgrochemicalSelection[]>([{
    id: "",
    active_principle: "",
    percentage: 0
  }]);

  useEffect(() => {
    if (!isReady) return;

    const fetchData = async () => {
      try {
        const agroResponse = await apiService.get<ResponseItems<Agroquimico>>("/agrochemicals");

        if (agroResponse.success ) {
          setAgroquimicos(agroResponse.data.content);
  
        } else {
          console.error("Error al obtener agroquímicos");
        }
      } catch (error: any) {
        console.error("Error en la solicitud:", error.message);
      }
    };

    const fetchProduct = async () => {
      const productId = searchParams.get('Id');
      if (!productId) {
        console.error("No se encontró ID de producto en la URL");
        router.push("/productos");
        return;
      }
      try {
        const response = await apiService.get<Producto>(`/products/${productId}`);
        if (response.success) {
          setProduct(response.data);
          
          // Convert product agrochemicals to AgrochemicalSelection format
          if (response.data.agrochemicals && response.data.agrochemicals.length > 0) {
            const selections: AgrochemicalSelection[] = response.data.agrochemicals.map(agro => ({
              id: agro.agrochemical_id,
              active_principle: agro.agrochemical.active_principle,
              percentage: agro.percentage
            }));
            setSelectedAgrochemicals(selections);
          } else if (response.data.agrochemical_id && response.data.agrochemical) {
            // Handle legacy single agrochemical format - use reasonable default percentage
            const selection: AgrochemicalSelection = {
              id: response.data.agrochemical_id,
              active_principle: response.data.agrochemical.active_principle,
              percentage: 50 // Default percentage for legacy products
            };
            setSelectedAgrochemicals([selection]);
          }
        } else {
          console.error("Error al obtener el producto:", response.error);
          router.push("/productos");
        }
      } catch (error: any) {
        console.error("Error en la solicitud:", error.message);
        router.push("/productos");
      }
    };

    fetchProduct();
    fetchData();
  }, [isReady, searchParams]);

  const handleOpenModal = useCallback(() => setModalOpen(true), []);
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    router.push("/productos");
  }, []);

  const handleFormSubmit = (inputData: Record<string, string | number>) => {
    if (selectedAgrochemicals.length === 0) {
      console.error("Debe seleccionar al menos un agroquímico");
      return;
    }

    const payload: EditProductPayload = {
      name: String(inputData.nombre),
      unit: inputData.unidad as string,
      amount: Number(inputData.cantidad),
      brand: String(inputData.marca),
      agrochemicals: selectedAgrochemicals.map(agro => ({
        agrochemical_id: agro.id,
        percentage: agro.percentage
      }))
    };

    updateProduct(payload);
  }

  const updateProduct = async (payload: EditProductPayload) => {
    try {
      const response = await apiService.update<Producto>("/products", product?.id || "", payload);

      if (response.success) {
        //console.log("Producto actualizado:", response.data);
        setProduct(response.data);
        handleOpenModal();
      
      } else {
        console.error("Error al actualizar el producto:", response.error);
      }
    } catch (error: any) {
      console.error("Error en la solicitud:", error.message);
    }
  };

  const isFormValid = useCallback((formData: Record<string, string>) => {
    const basicFieldsValid = formData.nombre && 
           formData.cantidad && 
           formData.unidad && 
           formData.marca;
    
    const agrochemicalsValid = selectedAgrochemicals.length > 0 && 
                              selectedAgrochemicals.every(agro => agro.id && agro.percentage > 0);
    
    return basicFieldsValid && agrochemicalsValid;   
  }, [selectedAgrochemicals]);

  const handleCancel = () => {
    router.push("/productos");
  };

  const fields: Field[] = useMemo(() => [
    {
      name: "nombre",
      label: "Nombre",
      type: "text",
      defaultValue: product?.name || ""
    },
    { 
      name: "cantidad", 
      label: "Cantidad", 
      type: "number",
      defaultValue: product?.amount?.toString() || ""
    },
    {
      name: "unidad",
      label: "Unidad",
      type: "select",
      options: Array.from(new Set(Object.values(Unidad))).sort(),
      defaultValue: product?.unit || ""
    },
    { 
      name: "marca", 
      label: "Marca", 
      type: "text",
      defaultValue: product?.brand || ""
    }
  ], [product]);

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
        equalButtonWidth={true}
        isSubmitDisabled={(formData) => !isFormValid(formData)}
      >
        <AgrochemicalSelector
          agroquimicos={agroquimicos}
          selectedAgrochemicals={selectedAgrochemicals}
          onChange={setSelectedAgrochemicals}
        />
      </Formulario>
      </div>
      <Footer />
      <GenericModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title="Producto modificado"
        modalText={`Se modificó el producto: ${product?.name}`}
        buttonTitle="Cerrar"
        showSecondButton={false}
      />
    </div>
  );
}

export default EditarProducto;
