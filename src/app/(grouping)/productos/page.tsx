
"use client";
import styles from "./productos-view.module.scss";
import Link from "next/link";
import MenuBar from "@/components/menuBar/MenuBar";
import ItemList from "@/components/itemList/ItemList";
import { Producto } from "@/domain/models/Producto";
import { transformToItems } from "@/utilities/transform";
import { useItemsManager } from "@/hooks/useItemsManager"; // Ajusta la ruta
import GenericModal from "@/components/modal/GenericModal";

export default function ProductosView() {
  const title = "Productos";
  
  const initialProductos: Producto[] = [
    {
      id: 1,
      nombre: "Glifosato 48%",
      unidad: "LITROS",
      cantidad: 20,
      marca: "AgroChem SA",
      descripcion: "Herbicida sistémico para el control de malezas."
    },
    {
      id: 2,
      nombre: "Clorpirifos 48%",
      unidad: "LITROS",
      cantidad: 15,
      marca: "Campo Verde Ltda",
      descripcion: "Insecticida organofosforado de amplio espectro."
    },
    {
      id: 3,
      nombre: "Atrazina 90%",
      unidad: "KILOGRAMOS",
      cantidad: 10,
      marca: "AgroSolutions",
      descripcion: "Herbicida selectivo para cultivos de maíz y sorgo."
    },
    {
      id: 4,
      nombre: "Metomilo 40%",
      unidad: "LITROS",
      cantidad: 5,
      marca: "Fertichem",
      descripcion: "Insecticida y acaricida de acción rápida."
    },
    {
      id: 5,
      nombre: "2,4-D Amina 72%",
      unidad: "LITROS",
      cantidad: 25,
      marca: "AgroBioTech",
      descripcion: "Herbicida hormonal para control de malezas de hoja ancha."
    },
    {
      id: 6,
      nombre: "Carbendazim 50%",
      unidad: "KILOGRAMOS",
      cantidad: 8,
      marca: "GreenField Agro",
      descripcion: "Fungicida sistémico para enfermedades de cultivos."
    },
    {
      id: 7,
      nombre: "Paraquat 20%",
      unidad: "LITROS",
      cantidad: 12,
      marca: "RuralQuim",
      descripcion: "Herbicida no selectivo de contacto."
    },
    {
      id: 8,
      nombre: "Cipermetrina 25%",
      unidad: "LITROS",
      cantidad: 18,
      marca: "PampaAgro",
      descripcion: "Insecticida piretroide para control de plagas."
    },
    {
      id: 9,
      nombre: "Mancozeb 80%",
      unidad: "KILOGRAMOS",
      cantidad: 15,
      marca: "EcoAgro",
      descripcion: "Fungicida protector de amplio espectro."
    },
    {
      id: 10,
      nombre: "Tebuconazol 25%",
      unidad: "LITROS",
      cantidad: 10,
      marca: "BioCrop Solutions",
      descripcion: "Fungicida sistémico para control de hongos."
    }
  ];


  const { items: productos, selectedIds, deletedItems, isModalOpen, toggleSelectItem, quitarItems, closeModal } =
    useItemsManager<Producto>(initialProductos);

  const buttons = [{ label: "Agregar", path: "/productos/agregar" }];
  const items = transformToItems(productos, "id", ["nombre", "marca"]);
  const campos = ["nombre", "marca"];

  const modalText =
    deletedItems.length > 0
      ? `Se han eliminado los siguientes productos:\n${deletedItems.map((p) => p.nombre).join("\n")}`
      : "No se eliminaron productos.";

  return (
    <div className="page-container">
      <MenuBar showMenu={true} path="" />
      <h1 className={styles.title}>{title}</h1>

      <ItemList
        items={items}
        displayKeys={campos}
        onSelect={toggleSelectItem}
        selectedIds={selectedIds}
      />

      <div className={styles.buttonContainer}>
        <button
          className={`button button-primary ${styles.buttonHome}`}
          onClick={quitarItems}
          disabled={selectedIds.length === 0}
        >
          Quitar
        </button>
        {buttons.map((button, index) => (
          <Link key={index} href={button.path}>
            <button className={`button button-primary ${styles.buttonHome}`}>
              {button.label}
            </button>
          </Link>
        ))}
      </div>

      <GenericModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Productos Eliminados"
        modalText={modalText}
        buttonTitle="Cerrar"
        showSecondButton={false}
      />
    </div>
  );
}