export interface Field {
    name: string;
    label: string;
    type: "text" | "select" | "number" | "file" | "password";
    options?: string[]; // Para dropdowns
    onFocus?: () => void; 
    defaultValue?: string | number;
    multiple?: boolean;
}
  