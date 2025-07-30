// src/lib/bitrix24-api.ts

/**
 * Obtiene una lista de Deals desde la API de Bitrix24.
 * @param accessToken El token de acceso de la sesión del usuario.
 * @param portalUrl La URL base del portal del usuario para las llamadas a la API.
 * @returns Una promesa que se resuelve con los datos de la API.
 */
export async function getDeals(accessToken: string, portalUrl: string) {
  // Construimos la URL completa para el método 'crm.deal.list'
  const url = `${portalUrl}crm.deal.list.json?auth=${accessToken}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Error al llamar a la API de Bitrix24: ${response.statusText}`
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Falló la obtención de Deals:", error);
    // Devolvemos null o un objeto de error para manejarlo en la UI
    return null;
  }
}
