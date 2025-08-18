import API_CONFIG from '../config/api.js';

// Función helper para hacer peticiones a la API
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...options.headers
    },
    timeout: API_CONFIG.TIMEOUT
  };

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Función para obtener la URL base de la API
export const getApiUrl = () => API_CONFIG.BASE_URL;

// Función para construir URLs completas
export const buildApiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;
