export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
  company_id: string;
  phone_number?: string;
  chat_id?: string;
  telegram_id?: string;
  external_id?: string;
} 