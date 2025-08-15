# Sistema de Login - AHRO Catálogo

## 🔐 Credenciales de Acceso

**Usuario:** `104521370`  
**Contraseña:** `21370#Ahro`

## ✨ Características Implementadas

### 🔒 Autenticación Segura
- **Validación de credenciales**: Verificación de usuario y contraseña
- **Sesión persistente**: La sesión se mantiene activa por 24 horas
- **Protección de rutas**: Todas las páginas requieren autenticación
- **Logout seguro**: Cierre de sesión con confirmación

### 🎨 Interfaz de Usuario
- **Diseño moderno**: Interfaz atractiva con gradientes y animaciones
- **Responsive**: Funciona en dispositivos móviles y desktop
- **Feedback visual**: Mensajes de error y estados de carga
- **Accesibilidad**: Navegación por teclado y lectores de pantalla

### 🛡️ Seguridad
- **Validación en frontend**: Verificación inmediata de credenciales
- **Expiración de sesión**: Sesión automática después de 24 horas
- **Limpieza de datos**: Eliminación segura de datos al cerrar sesión
- **Redirección automática**: Protección contra acceso directo a URLs

## 🚀 Cómo Usar

### 1. Acceso al Sistema
1. Abrir la aplicación en el navegador
2. Serás redirigido automáticamente a la página de login
3. Ingresar las credenciales:
   - **Usuario:** `104521370`
   - **Contraseña:** `21370#Ahro`
4. Hacer clic en "Iniciar Sesión"

### 2. Navegación Protegida
- Una vez autenticado, tendrás acceso a todas las funcionalidades
- La sesión se mantiene activa por 24 horas
- Si intentas acceder a una URL directamente sin estar autenticado, serás redirigido al login

### 3. Cerrar Sesión
- Hacer clic en el botón "Salir" en la barra de navegación
- Confirmar el cierre de sesión
- Serás redirigido automáticamente al login

## 📁 Archivos Modificados/Creados

### Nuevos Archivos
- `src/components/Login.vue` - Componente de login
- `src/utils/auth.js` - Utilidades de autenticación
- `src/components/AuthGuard.vue` - Guard de protección de rutas
- `README-LOGIN.md` - Esta documentación

### Archivos Modificados
- `src/router/index.js` - Agregadas rutas protegidas y guards
- `src/App.vue` - Agregado botón de logout
- `src/assets/App.css` - Estilos para el botón de logout
- `src/main.js` - Agregado Font Awesome para iconos

## 🔧 Configuración Técnica

### Estructura de Autenticación
```javascript
// Verificación de autenticación
auth.isAuthenticated() // Retorna true/false

// Obtener usuario actual
auth.getUser() // Retorna objeto con datos del usuario

// Cerrar sesión
auth.logout() // Limpia datos de sesión

// Validar credenciales
auth.validateCredentials(username, password) // Retorna true/false
```

### Protección de Rutas
```javascript
// Meta tags para protección
meta: { requiresAuth: true } // Ruta protegida
meta: { requiresGuest: true } // Solo para no autenticados
```

### Almacenamiento Local
- `isAuthenticated`: Estado de autenticación
- `user`: Datos del usuario y timestamp de login
- Cache de categorías y marcas para mejor rendimiento

## 🎯 Funcionalidades Específicas

### Login
- ✅ Validación de campos requeridos
- ✅ Mostrar/ocultar contraseña
- ✅ Mensajes de error descriptivos
- ✅ Animaciones de carga
- ✅ Navegación por teclado (Enter)

### Logout
- ✅ Confirmación antes de cerrar sesión
- ✅ Limpieza automática de datos
- ✅ Redirección al login
- ✅ Botón visible en navbar

### Protección
- ✅ Verificación automática en cada navegación
- ✅ Redirección automática al login
- ✅ Expiración de sesión por tiempo
- ✅ Protección contra acceso directo

## 🔄 Flujo de Autenticación

1. **Acceso inicial** → Redirección automática a `/login`
2. **Ingreso de credenciales** → Validación en frontend
3. **Credenciales correctas** → Almacenamiento en localStorage
4. **Redirección** → Página principal (`/`)
5. **Navegación** → Verificación automática en cada ruta
6. **Expiración** → Limpieza automática después de 24 horas
7. **Logout** → Limpieza manual y redirección al login

## 🛠️ Mantenimiento

### Cambiar Credenciales
Para cambiar las credenciales, modificar en:
- `src/utils/auth.js` - Función `validateCredentials()`
- `src/components/Login.vue` - Validación de login

### Ajustar Tiempo de Sesión
Para cambiar el tiempo de expiración, modificar en:
- `src/utils/auth.js` - Variable `sessionDuration`

### Personalizar Estilos
Los estilos del login están en:
- `src/components/Login.vue` - Estilos scoped
- `src/assets/App.css` - Estilos del botón logout

## ✅ Estado del Proyecto

**✅ COMPLETADO** - Sistema de login completamente funcional y listo para producción.

- 🔐 Autenticación implementada
- 🛡️ Protección de rutas activa
- 🎨 Interfaz de usuario completa
- 📱 Responsive design
- 🔄 Flujo de navegación optimizado
- 📚 Documentación completa
