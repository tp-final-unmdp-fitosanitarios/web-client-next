export interface StockSummary {
    product_id: string;
    product_name: string;
    brand: string;
    category: string;
    amount: number;
    unit: string;
    sum: StockLineItem[];
}

type StockLineItem = {
    amount: number;
    lot_number: string;
    location_name: string;
    expiration_date: Date;
}