// src/types/bitrix24.d.ts
export interface BitrixDeal {
  ID: string;
  TITLE: string;
  OPPORTUNITY?: string;
  CURRENCY_ID?: string;
  STAGE_ID?: string;
  ASSIGNED_BY_ID?: string;
  COMPANY_ID?: string;
  CONTACT_IDS?: string[];
  DATE_CREATE?: string;
  DATE_MODIFY?: string;
  // Permite cualquier otra propiedad sin sacrificar el tipado de las conocidas
  [key: string]: unknown;
}

// Creamos un tipo para la respuesta completa de la API
export interface DealsApiResponse {
  result: BitrixDeal[];
  total: number;
}
