import { Paginacion } from "./Paginacion";

export interface ResponseItems<T> {
    pagination: Paginacion;
    content: T[];
  }