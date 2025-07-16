/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Ordena un array de strings de forma alfabética
 * @param array Array de strings a ordenar
 * @returns Array ordenado
 */
export const sortStrings = (array: string[]): string[] => {
    return [...array].sort((a, b) => 
        a.localeCompare(b, 'es', { 
            sensitivity: 'base',
            ignorePunctuation: true 
        })
    );
};

/**
 * Ordena un array de objetos por una propiedad específica de forma alfabética
 * @param array Array a ordenar
 * @param property Propiedad por la cual ordenar
 * @returns Array ordenado
 */
export const sortAlphabetically = <T extends Record<string, any>>(
    array: T[],
    property: keyof T
): T[] => {
    return [...array].sort((a, b) => 
        String(a[property]).localeCompare(String(b[property]), 'es', { 
            sensitivity: 'base',
            ignorePunctuation: true 
        })
    );
};

/**
 * Ordena un array de objetos por una propiedad específica de forma alfabética y elimina duplicados
 * @param array Array a ordenar
 * @param property Propiedad por la cual ordenar
 * @param idProperty Propiedad que se usará como identificador único
 * @returns Array ordenado sin duplicados
 */
export const sortAlphabeticallyUnique = <T extends Record<string, any>>(
    array: T[],
    property: keyof T,
    idProperty: keyof T
): T[] => {
    // Primero eliminamos duplicados usando Map
    const uniqueItems = Array.from(
        new Map(array.map(item => [item[idProperty], item])).values()
    );
    
    // Luego ordenamos
    return sortAlphabetically(uniqueItems, property);
}; 