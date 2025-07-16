export interface User {
    id: string,
    first_name: string,
    last_name: string,
    roles: string[],
    company_id: string,
    email: string,
    phone_number?: string,
    chat_id?: string,
    telegram_id?: string,
    external_id?: string
}

