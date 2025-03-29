export interface Item {
  id: number;
  [key: string]: string | number;
}

export function transformToItems<T>(
  data: T[],
  idKey: keyof T,
  displayKeys: string[]
): Item[] {
  return data.map((item) => {
    const transformed: Item = { id: item[idKey] as number };
    displayKeys.forEach((key) => {
      transformed[key] = String(item[key as keyof T]); // Convertir a string
    });
    return transformed;
  });
}