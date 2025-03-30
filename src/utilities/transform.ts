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
      const value = item[key as keyof T];

      if (typeof value === "object" && value !== null) {
        // Extraer campos específicos si el valor es un objeto
        if ("nombre" in value) {
          transformed[key] = (value as { nombre: string }).nombre;
        } else if ("direccion" in value) {
          transformed[key] = (value as { direccion: string }).direccion;
        } else {
          transformed[key] = JSON.stringify(value); // Fallback
        }
      } else {
        transformed[key] = String(value); // Convertir números y strings normales
      }
    });

    return transformed;
  });
}
