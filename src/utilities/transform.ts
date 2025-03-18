import { Item } from "@/domain/models/Item";

export function transformToItems<T>(
  array: T[],
  idKey: keyof T,
  displayKeys: (keyof T)[]
): Record<string, string>[] {
  return array.map((item) => {
    //A cada objeto le asigno una clave
    const transformedItem: Record<string, string> = { id: String(item[idKey]) };

    //Agrego la clave y su valor para cada campo recibido
    displayKeys.forEach((key) => {
      transformedItem[key as string] = String(item[key]);
    });

    return transformedItem;
  });
}