import { Producto } from '@/domain/models/Producto';
import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL; 

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const postProducto = async (producto: Producto) => {
  try {
    const response = await apiClient.post('/productos', producto); // Ajusta la ruta según tu backend
    return response.data;
  } catch (error) {
    console.error('Error al enviar producto:', error);
    throw error;
  }
};

export const putProducto = async (producto: Producto) => {
  try {
    const response = await apiClient.put(`/productos/${producto.id}`, producto); // Ajusta la ruta según tu backend
    return response.data;
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw error;
  }
};