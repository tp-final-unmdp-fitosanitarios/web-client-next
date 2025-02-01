export interface Field {
    name: string;
    label: string;
    type: "text" | "select" | "number";
    options?: string[]; // Para dropdowns
  }
  