import { Paginacion } from "./Paginacion";

export interface ResponseItems<T> extends Paginacion {
    content: T[];
}