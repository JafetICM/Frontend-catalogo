// Configuración de la API
const API_CONFIG = {
  // URL base de la API - cambiar según el entorno
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://backend-laravel-o66e6.ondigitalocean.app'  // Tu URL de DigitalOcean
    : 'http://127.0.0.1:8000',
  
  // Timeout para las peticiones
  TIMEOUT: 30000,
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

export default API_CONFIG;
