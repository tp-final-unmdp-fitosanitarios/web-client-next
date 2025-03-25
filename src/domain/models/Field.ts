export interface Field {
    name: string;
    label: string;
    type: "text" | "select" | "number" | "file";
    options?: string[]; // Para dropdowns
  }
  