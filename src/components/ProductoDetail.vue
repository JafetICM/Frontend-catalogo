<template>
  <!-- frontend-vue/src/components/ProductoDetail.vue -->
  <div class="product-details-container">
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="retry" class="retry-button">Reintentar</button>
    </div>

    <div v-else-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando detalles del producto...</p>
    </div>

    <div v-else-if="producto" class="product-detail-main">
      <div class="product-detail-layout">
        <!-- Sección de Imágenes -->
        <div class="product-images-section">
          <div class="main-image-container">
            <img :src="selectedImage" :alt="producto.titulo" class="main-product-image" />
          </div>
          <div class="thumbnails-container">
            <div
              v-for="(imagen, index) in productImages"
              :key="index"
              class="thumbnail"
              :class="{ active: selectedImage === imagen.imagen }"
              @click="selectImage(imagen.imagen)"
            >
              <img :src="imagen.imagen" :alt="`${producto.titulo} ${index + 1}`" />
            </div>
          </div>

          <div v-if="producto.categorias?.length" class="product-categories">
            <h3>Categorías</h3>
            <ul>
              <li v-for="categoria in producto.categorias" :key="categoria.id">{{ categoria.nombre }}</li>
            </ul>
          </div>

          <div class="product-features" v-if="producto.caracteristicas">
            <h3>Características</h3>
            <ul class="features-list">
              <li v-for="(caracteristica, index) in producto.caracteristicas.slice(0, 5)" :key="index">
                {{ caracteristica }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Sección de Información del Producto -->
        <div class="product-info-section">
          <div class="product-header">
            <h1 class="product-title">{{ producto.titulo }}</h1>
            <div class="product-model">
              <span class="model-label">Modelo:</span>
              <span class="model-value">{{ producto.modelo || 'N/A' }}</span>
            </div>
            <div class="product-brand">
              <span class="brand-label">Marca:</span>
              <span class="brand-value">{{ producto.marca || 'N/A' }}</span>
            </div>
            <div class="product-sat">
              <span class="sat-label">Código SAT:</span>
              <span class="sat-value">{{ producto.sat_key || 'N/A' }}</span>
            </div>
            <div class="product-garantia">
              <span class="garantia-label">Garantía:</span>
              <span class="garantia-value">{{ producto.garantia || 'N/A' }}</span>
            </div>
          </div>

          <!-- Sección de precios con descuento -->
          <div class="precio-producto">
            <span v-if="producto.precios && producto.precios.precio_descuento && parseFloat(producto.precios.precio_descuento) < parseFloat(producto.precios.precio_lista)">
              <span class="precio-descuento">${{ parseFloat(producto.precios.precio_descuento).toFixed(2) }}</span>
              <span class="precio-lista-tachado">${{ parseFloat(producto.precios.precio_lista).toFixed(2) }}</span>
            </span>
            <span v-else>
              <span class="precio-normal">${{ parseFloat(producto.precios.precio_lista).toFixed(2) }}</span>
            </span>
          </div>

          <div class="stock-section">
            <!-- Información de Stock Principal -->
            <div class="stock-info" :class="getStockClass(producto.total_existencia)">
              <span class="stock-icon">📦</span>
              <span v-if="producto.total_existencia > 0">
                <strong>{{ producto.total_existencia }}</strong> unidades disponibles
              </span>
              <span v-else>Sin existencias</span>
            </div>

            <!-- Desglose Detallado de Inventario -->
            <div v-if="producto.existencia && producto.total_existencia > 0" class="inventory-breakdown">
              <div class="inventory-item">
                <span class="inventory-label">🆕 Nuevo (Caja Cerrada):</span>
                <span class="inventory-quantity new-stock">{{ producto.existencia.nuevo || 0 }}</span>
              </div>
              
              <!-- Caja Abierta con Desglose -->
              <div v-if="hasOpenBoxItems" class="open-box-section">
                <div class="inventory-item">
                  <span class="inventory-label">📦 Caja Abierta:</span>
                  <span class="inventory-quantity open-stock">{{ getTotalOpenBox() }}</span>
                </div>
                
                <!-- Detalle de Caja Abierta -->
                <div class="open-box-details">
                  <div v-for="item in openBoxTypes" :key="item.type" class="open-box-item">
                    <span class="open-box-type">Tipo {{ item.type.toUpperCase() }}:</span>
                    <span class="open-box-quantity">{{ item.quantity }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Información Adicional -->
            <div v-if="producto.existencia && producto.total_existencia > 0" class="inventory-note">
              <p class="note-text">
                <strong>💡 Nota:</strong> Los productos en caja abierta pueden tener uso mínimo o ser de exhibición. 
                Consulte disponibilidad y garantía específica.
              </p>
            </div>

            <div v-if="producto.inventarios?.length" class="inventory-list">
              <button @click="toggleInventoryModal" class="view-inventory-btn">
                Ver inventarios por sucursal
              </button>
              <div v-if="showInventoryModal" class="inventory-modal">
                <div class="inventory-header">
                  <h4>Inventarios</h4>
                  <button @click="showInventoryModal = false" class="close-modal-btn">✖</button>
                </div>
                
                <!-- Filtros de Inventario -->
                <div class="inventory-filters">
                  <div class="filter-group">
                    <label class="filter-label">
                      <input 
                        type="checkbox" 
                        v-model="inventoryFilters.onlyWithStock"
                        @change="applyInventoryFilters"
                      />
                      Solo con stock disponible
                    </label>
                  </div>
                  <div class="filter-group">
                    <select v-model="inventoryFilters.sortBy" @change="applyInventoryFilters" class="inventory-sort">
                      <option value="name">Ordenar por nombre</option>
                      <option value="stock">Ordenar por stock</option>
                    </select>
                  </div>
                </div>
                
                <div class="inventory-list-content">
                  <div v-if="loadingStockSucursales" class="loading-stock">
                    <div class="spinner-small"></div>
                    <p>Cargando stock por sucursal...</p>
                  </div>
                  <div v-else-if="errorStockSucursales" class="error-stock">
                    <p>{{ errorStockSucursales }}</p>
                    <button @click="cargarStockPorSucursal(producto.producto_id)" class="retry-btn">Reintentar</button>
                  </div>
                  <div v-else>
                  <table>
                    <thead>
                      <tr><th>Sucursal</th><th>Stock</th></tr>
                    </thead>
                    <tbody>
                        <tr v-for="(sucursal, index) in filteredInventarios" :key="index">
                        <td>{{ sucursal.sucursal }}</td>
                          <td :class="getStockClass(sucursal.stock)">
                            <span v-if="sucursal.stock > 500">{{ sucursal.stock }}+</span>
                            <span v-else>{{ sucursal.stock }}</span>
                          </td>
                      </tr>
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="product-actions">
            <div class="quantity-selector">
              <button @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
              <span class="quantity-display">{{ quantity }}</span>
              <button @click="increaseQuantity" :disabled="quantity >= producto.total_existencia">+</button>
            </div>
            <button 
              class="add-to-cart-btn" 
              :disabled="producto.total_existencia === 0"
              @click="agregarAlCarrito"
            >
              Agregar 🛒
            </button>
            <div v-if="mostrarMensaje" class="mensaje-agregado" :class="{ 'error': mensajeError }">
              {{ mensaje }}
            </div>
            <button
              class="share-btn"
              @click="compartirProducto"
              :disabled="!producto"
            >
              <i class="fas fa-share-alt"></i>
              Compartir
            </button>
          </div>
        </div>
      </div>

      <div class="product-description-section" v-if="producto.descripcion">
        <h3 class="descripcion-titulo">Descripción del Producto</h3>
        <div class="descripcion-contenido" v-html="decodedDescription"></div>
      </div>

      <div class="product-specifications-section" v-if="producto.especificaciones && Object.keys(producto.especificaciones).length">
        <div class="specifications-header">
        <h3>Especificaciones</h3>
          
          <!-- Filtros de Especificaciones -->
          <div class="specifications-filters">
            <div class="filter-group">
              <input 
                v-model="specFilters.searchTerm"
                @input="applySpecFilters"
                type="text" 
                placeholder="Buscar especificación..."
                class="spec-search"
              />
            </div>
            <div class="filter-group">
              <select v-model="specFilters.sortBy" @change="applySpecFilters" class="spec-sort">
                <option value="name">Ordenar por nombre</option>
                <option value="type">Ordenar por tipo</option>
              </select>
            </div>
            <button @click="resetSpecFilters" class="reset-spec-filters-btn">
              Limpiar Filtros
            </button>
          </div>
        </div>
        
        <div class="accordion-container">
          <div v-for="(value, key) in filteredEspecificaciones" :key="key" class="accordion-item">
            <div class="accordion-header" @click="toggleAccordion(key)" :class="{ 'accordion-header-active': activeAccordions[key] }">
              <h4>{{ key }}</h4>
              <span class="accordion-icon">{{ activeAccordions[key] ? '▲' : '▼' }}</span>
            </div>
            <div class="accordion-content" :class="{ 'accordion-content-active': activeAccordions[key] }">
              <template v-if="Array.isArray(value)">
                <ul><li v-for="(item, i) in value" :key="i">{{ item }}</li></ul>
              </template>
              <template v-else-if="typeof value === 'object' && value !== null">
                <table>
                  <tbody>
                    <tr v-for="(subValue, subKey) in value" :key="subKey">
                      <th>{{ subKey }}</th><td>{{ subValue }}</td>
                    </tr>
                  </tbody>
                </table>
              </template>
              <template v-else><p>{{ value }}</p></template>
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ Productos Relacionados con Filtros -->
      <div v-if="productosRelacionados.length > 0" class="related-products-section">
        <div class="related-header">
        <h3 class="related-title">Productos Relacionados</h3>
          
          <!-- Filtros de Productos Relacionados -->
          <div class="related-filters">
            <div class="filter-group">
              <input 
                v-model="relatedFilters.searchTerm"
                @input="applyRelatedFilters"
                type="text" 
                placeholder="Buscar productos relacionados..."
                class="related-search"
              />
            </div>
            <div class="filter-group">
              <select v-model="relatedFilters.brand" @change="applyRelatedFilters" class="related-brand-filter">
                <option value="">Todas las marcas</option>
                <option v-for="marca in marcasRelacionadas" :key="marca" :value="marca">
                  {{ marca }}
                </option>
              </select>
            </div>
            <div class="filter-group">
              <select v-model="relatedFilters.priceRange" @change="applyRelatedFilters" class="related-price-filter">
                <option value="">Todos los precios</option>
                <option value="0-1000">$0 - $1,000</option>
                <option value="1000-5000">$1,000 - $5,000</option>
                <option value="5000-10000">$5,000 - $10,000</option>
                <option value="10000+">$10,000+</option>
              </select>
            </div>
            <div class="filter-group">
              <select v-model="relatedFilters.sortBy" @change="applyRelatedFilters" class="related-sort">
                <option value="relevance">Más relevantes</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
                <option value="name_asc">Nombre: A-Z</option>
                <option value="name_desc">Nombre: Z-A</option>
              </select>
            </div>
            <button @click="resetRelatedFilters" class="reset-related-filters-btn">
              Limpiar Filtros
            </button>
          </div>
        </div>
        
        <div class="related-scroll-container">
          <div
            class="related-card"
            v-for="(rel, index) in filteredProductosRelacionados"
            :key="index"
          >
            <router-link 
              :to="{ name: 'ProductoDetail', params: { id: rel.producto_id }}" 
              class="related-link"
            >
              <img :src="rel.img_portada" :alt="rel.titulo" class="related-image" />
              <div class="related-info">
                <h4 class="related-name">{{ rel.modelo }}</h4>
                <p class="related-brand">{{ rel.marca }}</p>
                <p class="related-price">
                  <span v-if="rel.precios && rel.precios.precio_descuento && parseFloat(rel.precios.precio_descuento) < parseFloat(rel.precios.precio_lista)">
                    <span class="precio-descuento">${{ parseFloat(rel.precios.precio_descuento).toFixed(2) }}</span>
                    <span class="precio-lista-tachado">${{ parseFloat(rel.precios.precio_lista).toFixed(2) }}</span>
                    <span v-if="rel.precios.descuento" class="discount-badge">-{{ rel.precios.descuento }}%</span>
                  </span>
                  <span v-else>
                    <span class="precio-normal">${{ parseFloat(rel.precios.precio_lista).toFixed(2) }}</span>
                  </span>
                </p>
              </div>
            </router-link>
          </div>
        </div>
        
        <!-- Información de filtros aplicados -->
        <div v-if="hasActiveRelatedFilters" class="filters-info">
          <p>Mostrando {{ filteredProductosRelacionados.length }} de {{ productosRelacionados.length }} productos relacionados</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
  name: 'ProductDetails',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const producto = ref(null);
    const productosRelacionados = ref([]);
    const error = ref(null);
    const loading = ref(true);
    const selectedImage = ref('');
    const quantity = ref(1);
    const activeAccordions = ref({});
    const showInventoryModal = ref(false);
    const mostrarMensaje = ref(false);
    const mensaje = ref('');
    const mensajeError = ref(false);
    const loadingStockSucursales = ref(false);
    const errorStockSucursales = ref(null);
    const stockPorSucursal = ref([]);

    // Filtros para productos relacionados
    const relatedFilters = ref({
      searchTerm: '',
      brand: '',
      priceRange: '',
      sortBy: 'relevance'
    });

    // Filtros para especificaciones
    const specFilters = ref({
      searchTerm: '',
      sortBy: 'name'
    });

    // Filtros para inventario
    const inventoryFilters = ref({
      onlyWithStock: false,
      sortBy: 'name'
    });

    // URL actual para compartir por WhatsApp
    const currentUrl = window.location.href;
    const whatsappShareUrl = computed(() => {
      if (!producto.value) return '';
      return `https://wa.me/?text=${encodeURIComponent(producto.value.titulo + ' ' + currentUrl)}`;
    });

    // Función para compartir producto
    const compartirProducto = async () => {
      if (!producto.value) return;

      const shareData = {
        title: producto.value.titulo,
        text: `¡Mira este producto: ${producto.value.titulo}!`,
        url: currentUrl
      };

      // Intentar usar la Web Share API (móviles)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          console.log('Error al compartir:', error);
          mostrarOpcionesCompartir();
        }
      } else {
        // Fallback para navegadores que no soportan Web Share API
        mostrarOpcionesCompartir();
      }
    };

    // Mostrar opciones de compartir
    const mostrarOpcionesCompartir = () => {
      const opciones = [
        {
          nombre: 'WhatsApp',
          icono: 'fab fa-whatsapp',
          color: '#25D366',
          url: `https://wa.me/?text=${encodeURIComponent(producto.value.titulo + ' ' + currentUrl)}`
        },
        {
          nombre: 'Telegram',
          icono: 'fab fa-telegram',
          color: '#0088cc',
          url: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(producto.value.titulo)}`
        },
        {
          nombre: 'Facebook',
          icono: 'fab fa-facebook',
          color: '#1877f2',
          url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
        },
        {
          nombre: 'Twitter',
          icono: 'fab fa-twitter',
          color: '#1da1f2',
          url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(producto.value.titulo)}&url=${encodeURIComponent(currentUrl)}`
        },
        {
          nombre: 'Email',
          icono: 'fas fa-envelope',
          color: '#ea4335',
          url: `mailto:?subject=${encodeURIComponent(producto.value.titulo)}&body=${encodeURIComponent('¡Mira este producto: ' + producto.value.titulo + ' ' + currentUrl)}`
        },
        {
          nombre: 'Copiar Enlace',
          icono: 'fas fa-link',
          color: '#6b7280',
          accion: 'copiar'
        }
      ];

      // Crear modal de opciones
      const modal = document.createElement('div');
      modal.className = 'share-modal-overlay';
      modal.innerHTML = `
        <div class="share-modal">
          <div class="share-modal-header">
            <h3>Compartir Producto</h3>
            <button class="share-modal-close">✖</button>
          </div>
          <div class="share-modal-content">
            <div class="share-options">
              ${opciones.map(opcion => `
                <button class="share-option" data-url="${opcion.url || ''}" data-accion="${opcion.accion || ''}" style="--color: ${opcion.color}">
                  <i class="${opcion.icono}"></i>
                  <span>${opcion.nombre}</span>
                </button>
              `).join('')}
            </div>
            <div class="share-link-section">
              <label>Enlace directo:</label>
              <div class="share-link-input">
                <input type="text" value="${currentUrl}" readonly>
                <button class="copy-link-btn">Copiar</button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Agregar estilos al modal
      const style = document.createElement('style');
      style.textContent = `
        .share-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(4px);
        }
        
        .share-modal {
          background: white;
          border-radius: 16px;
          padding: 0;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          animation: slideUp 0.3s ease-out;
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .share-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .share-modal-header h3 {
          margin: 0;
          color: #1e293b;
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .share-modal-close {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: #64748b;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.3s ease;
        }
        
        .share-modal-close:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        
        .share-modal-content {
          padding: 1.5rem;
        }
        
        .share-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .share-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          color: var(--color);
        }
        
        .share-option:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          border-color: var(--color);
        }
        
        .share-option i {
          font-size: 1.5rem;
          color: var(--color);
        }
        
        .share-option span {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        
        .share-link-section {
          border-top: 1px solid #e2e8f0;
          padding-top: 1.5rem;
        }
        
        .share-link-section label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
        }
        
        .share-link-input {
          display: flex;
          gap: 0.5rem;
        }
        
        .share-link-input input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;
          background: #f9fafb;
        }
        
        .copy-link-btn {
          padding: 0.75rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .copy-link-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }
        
        @media (max-width: 480px) {
          .share-options {
            grid-template-columns: 1fr;
          }
        }
      `;
      document.head.appendChild(style);

      // Agregar eventos
      modal.querySelector('.share-modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
          document.head.removeChild(style);
        }
      });

      // Eventos para botones de compartir
      modal.querySelectorAll('.share-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const url = btn.dataset.url;
          const accion = btn.dataset.accion;

          if (accion === 'copiar') {
            navigator.clipboard.writeText(currentUrl).then(() => {
              mostrarNotificacion('Enlace copiado al portapapeles');
            });
          } else if (url) {
            window.open(url, '_blank');
          }

          document.body.removeChild(modal);
          document.head.removeChild(style);
        });
      });

      // Evento para copiar enlace
      modal.querySelector('.copy-link-btn').addEventListener('click', () => {
        const input = modal.querySelector('.share-link-input input');
        input.select();
        navigator.clipboard.writeText(input.value).then(() => {
          mostrarNotificacion('Enlace copiado al portapapeles');
        });
      });

      document.body.appendChild(modal);
    };

    // Mostrar notificación
    const mostrarNotificacion = (mensaje) => {
      const notificacion = document.createElement('div');
      notificacion.className = 'share-notification';
      notificacion.textContent = mensaje;
      notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10001;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        font-weight: 600;
      `;
      document.body.appendChild(notificacion);

      setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
          document.body.removeChild(notificacion);
        }, 300);
      }, 2000);
    };

    // Decodificar la descripción del producto
    const decodedDescription = computed(() => {
      if (!producto.value?.descripcion) return '';
      const parser = new DOMParser();
      const doc = parser.parseFromString(producto.value.descripcion, 'text/html');
      return doc.body.innerHTML;
    });

    const productImages = computed(() => producto.value?.imagenes || []);

    // Marcas disponibles en productos relacionados
    const marcasRelacionadas = computed(() => {
      const marcas = new Set(productosRelacionados.value.map(p => p.marca));
      return Array.from(marcas).sort();
    });

    // Productos relacionados filtrados
    const filteredProductosRelacionados = computed(() => {
      let result = [...productosRelacionados.value];

      // Filtrar por término de búsqueda
      if (relatedFilters.value.searchTerm.trim()) {
        const term = relatedFilters.value.searchTerm.toLowerCase();
        result = result.filter(p =>
          (p.titulo && p.titulo.toLowerCase().includes(term)) ||
          (p.modelo && p.modelo.toLowerCase().includes(term)) ||
          (p.marca && p.marca.toLowerCase().includes(term))
        );
      }

      // Filtrar por marca
      if (relatedFilters.value.brand) {
        result = result.filter(p => p.marca === relatedFilters.value.brand);
      }

      // Filtrar por rango de precio
      if (relatedFilters.value.priceRange) {
        const [min, max] = relatedFilters.value.priceRange.split('-').map(Number);
        result = result.filter(p => {
          const precio = p.precios?.precio_descuento || p.precios?.precio_lista || 0;
          if (relatedFilters.value.priceRange === '10000+') {
            return precio >= 10000;
          }
          return precio >= min && precio <= max;
        });
      }

      // Ordenar
      result.sort((a, b) => {
        const precioA = a.precios?.precio_descuento || a.precios?.precio_lista || 0;
        const precioB = b.precios?.precio_descuento || b.precios?.precio_lista || 0;
        
        switch(relatedFilters.value.sortBy) {
          case 'price_asc':
            return precioA - precioB;
          case 'price_desc':
            return precioB - precioA;
          case 'name_asc':
            return (a.titulo || '').localeCompare(b.titulo || '');
          case 'name_desc':
            return (b.titulo || '').localeCompare(a.titulo || '');
          default:
            return 0;
        }
      });

      return result;
    });

    // Especificaciones filtradas
    const filteredEspecificaciones = computed(() => {
      if (!producto.value?.especificaciones) return {};
      
      let result = { ...producto.value.especificaciones };

      // Filtrar por término de búsqueda
      if (specFilters.value.searchTerm.trim()) {
        const term = specFilters.value.searchTerm.toLowerCase();
        const filtered = {};
        
        Object.keys(result).forEach(key => {
          if (key.toLowerCase().includes(term)) {
            filtered[key] = result[key];
          }
        });
        
        result = filtered;
      }

      // Ordenar
      const sortedKeys = Object.keys(result).sort((a, b) => {
        if (specFilters.value.sortBy === 'name') {
          return a.localeCompare(b);
        }
        return 0;
      });

      const sorted = {};
      sortedKeys.forEach(key => {
        sorted[key] = result[key];
      });

      return sorted;
    });

    // Inventarios filtrados
    const filteredInventarios = computed(() => {
      // Usar stockPorSucursal si está disponible, sino usar inventarios del producto
      const inventarios = stockPorSucursal.value.length > 0 ? stockPorSucursal.value : (producto.value?.inventarios || []);
      
      let result = [...inventarios];

      // Filtrar por stock disponible
      if (inventoryFilters.value.onlyWithStock) {
        result = result.filter(inv => inv.stock > 0);
      }

      // Ordenar
      result.sort((a, b) => {
        if (inventoryFilters.value.sortBy === 'stock') {
          return b.stock - a.stock;
        }
        return a.sucursal.localeCompare(b.sucursal);
      });

      return result;
    });

    // Verificar si hay productos en caja abierta
    const hasOpenBoxItems = computed(() => {
      if (!producto.value?.existencia?.asterisco) return false;
      return Object.values(producto.value.existencia.asterisco).some(quantity => quantity > 0);
    });

    // Obtener el total de productos en caja abierta
    const getTotalOpenBox = () => {
      if (!producto.value?.existencia?.asterisco) return 0;
      return Object.values(producto.value.existencia.asterisco).reduce((total, quantity) => total + quantity, 0);
    };

    // Obtener los tipos de caja abierta con cantidad > 0
    const openBoxTypes = computed(() => {
      if (!producto.value?.existencia?.asterisco) return [];
      return Object.entries(producto.value.existencia.asterisco)
        .filter(([, quantity]) => quantity > 0)
        .map(([type, quantity]) => ({ type, quantity }));
    });

    // Verificar si hay filtros activos en productos relacionados
    const hasActiveRelatedFilters = computed(() => {
      return relatedFilters.value.searchTerm || 
             relatedFilters.value.brand || 
             relatedFilters.value.priceRange || 
             relatedFilters.value.sortBy !== 'relevance';
    });

    // Cargar productos relacionados
    const loadProductosRelacionados = async (id) => {
      try {
        const response = await fetch(`https://backend-laravel-o66e6.ondigitalocean.app/productos/${id}/relacionados`);
        if (!response.ok) throw new Error('Error al obtener productos relacionados');
        productosRelacionados.value = await response.json();
      } catch (err) {
        error.value = `Hubo un problema al obtener los productos relacionados: ${err.message}`;
      }
    };

    // Cargar stock por sucursal
    const cargarStockPorSucursal = async (productoId) => {
      try {
        loadingStockSucursales.value = true;
        errorStockSucursales.value = null;
        
        const response = await fetch(`https://backend-laravel-o66e6.ondigitalocean.app/productos/${productoId}/stock-sucursales`);
        if (!response.ok) throw new Error('Error al obtener stock por sucursal');
        
        const data = await response.json();
        stockPorSucursal.value = data.stock_por_sucursal || [];
        
      } catch (err) {
        errorStockSucursales.value = `Error al cargar stock por sucursal: ${err.message}`;
        console.error('Error cargando stock por sucursal:', err);
      } finally {
        loadingStockSucursales.value = false;
      }
    };

    const toggleInventoryModal = () => {
      showInventoryModal.value = !showInventoryModal.value;
      if (showInventoryModal.value) {
        cargarStockPorSucursal(producto.value.producto_id);
      }
    };

    const toggleAccordion = (key) => {
      activeAccordions.value[key] = !activeAccordions.value[key];
    };

    // Aplicar filtros de productos relacionados
    const applyRelatedFilters = () => {
      // Los filtros se aplican automáticamente por computed
    };

    // Resetear filtros de productos relacionados
    const resetRelatedFilters = () => {
      relatedFilters.value = {
        searchTerm: '',
        brand: '',
        priceRange: '',
        sortBy: 'relevance'
      };
    };

    // Aplicar filtros de especificaciones
    const applySpecFilters = () => {
      // Los filtros se aplican automáticamente por computed
    };

    // Resetear filtros de especificaciones
    const resetSpecFilters = () => {
      specFilters.value = {
        searchTerm: '',
        sortBy: 'name'
      };
    };

    // Aplicar filtros de inventario
    const applyInventoryFilters = () => {
      // Los filtros se aplican automáticamente por computed
    };

    // Cargar producto por id con cache
    const loadProducto = async (id) => {
      try {
        loading.value = true;
        
        // Verificar cache local
        const cacheKey = `producto_${id}`;
        const cachedProducto = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(cacheKey + '_timestamp');
        const now = Date.now();
        
        // Cache válido por 2 horas
        if (cachedProducto && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 7200000) {
          producto.value = JSON.parse(cachedProducto);
          selectedImage.value = producto.value.img_portada || '';
          await loadProductosRelacionados(id);
          loading.value = false;
          return;
        }
        
        const response = await fetch(`https://backend-laravel-o66e6.ondigitalocean.app/productos/${id}`);
        if (!response.ok) throw new Error('Error al obtener el producto');
        producto.value = await response.json();
        selectedImage.value = producto.value.img_portada || '';
        
        // Guardar en cache local
        localStorage.setItem(cacheKey, JSON.stringify(producto.value));
        localStorage.setItem(cacheKey + '_timestamp', now.toString());
        
        await loadProductosRelacionados(id);
      } catch (err) {
        error.value = `Hubo un problema al obtener el producto: ${err.message}`;
      } finally {
        loading.value = false;
      }
    };

    // Al cambiar el id en la ruta, cargamos el nuevo producto
    watch(
      () => route.params.id,
      (newId) => {
        loadProducto(newId);
      },
      { immediate: true }
    );

    const selectImage = (image) => selectedImage.value = image;

    // Formatear el precio de los productos relacionados y el producto actual para que se vea bien en la UI
    const formatPrice = (price) => {
      if (!price) return '0.00';
      return new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    };

    // Obtener la clase de stock según la cantidad disponible
    const getStockClass = (stock) => {
      if (stock <= 0) return 'stock-zero';
      if (stock < 5) return 'stock-low';
      return 'stock-normal';
    };

    // Incrementar la cantidad de productos en el carrito
    const increaseQuantity = () => {
      if (quantity.value < producto.value.total_existencia) quantity.value++;
    };

    // Decrementar la cantidad de productos en el carrito
    const decreaseQuantity = () => {
      if (quantity.value > 1) quantity.value--;
    };

    // Reintentar cargar el producto
    const retry = () => {
      const id = route.params.id;
      loadProducto(id);
    };

    // Agregar el producto al carrito
    const agregarAlCarrito = () => {
      try {
        // Obtener el carrito actual del localStorage
        const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];
        
        // Verificar si el producto ya está en el carrito
        const productoExistente = carritoActual.find(item => item.producto_id === producto.value.producto_id);
        
        if (productoExistente) {
          // Si el producto existe, actualizar la cantidad
          const nuevaCantidad = productoExistente.cantidad + quantity.value;
          
          // Verificar que no exceda el stock disponible
          if (nuevaCantidad > producto.value.total_existencia) {
            mensaje.value = 'No hay suficiente stock disponible';
            mensajeError.value = true;
            mostrarMensaje.value = true;
            setTimeout(() => {
              mostrarMensaje.value = false;
            }, 3000);
            return;
          }
          
          productoExistente.cantidad = nuevaCantidad;
        } else {
          // Si el producto no existe, agregarlo al carrito
          carritoActual.push({
            producto_id: producto.value.producto_id,
            titulo: producto.value.titulo,
            modelo: producto.value.modelo,
            marca: producto.value.marca,
            img_portada: producto.value.img_portada,
            imagen: producto.value.img_portada, // Para compatibilidad con la cotización
            precios: producto.value.precios,
            cantidad: quantity.value,
            peso: parseFloat(producto.value.peso) || 0
          });
        }
        
        // Guardar el carrito actualizado
        localStorage.setItem('carrito', JSON.stringify(carritoActual));
        
        // Mostrar mensaje de éxito
        mensaje.value = 'Producto agregado al carrito';
        mensajeError.value = false;
        mostrarMensaje.value = true;
        
        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
          mostrarMensaje.value = false;
        }, 3000);
        
        // Opcional: Redirigir al carrito
        if (confirm('¿Desea ir al carrito?')) {
          router.push('/carrito');
        }
      } catch (error) {
        mensaje.value = 'Error al agregar al carrito';
        mensajeError.value = true;
        mostrarMensaje.value = true;
        setTimeout(() => {
          mostrarMensaje.value = false;
        }, 3000);
      }
    };

    // Cargar el producto inicial
    onMounted(() => {
      const id = route.params.id;
      loadProducto(id);
    });

    // Retornar las variables y funciones para que se puedan usar en la plantilla
    return {
      producto,
      productosRelacionados,
      error,
      loading,
      selectedImage,
      productImages,
      quantity,
      activeAccordions,
      selectImage,
      formatPrice,
      getStockClass,
      increaseQuantity,
      decreaseQuantity,
      retry,
      decodedDescription,
      showInventoryModal,
      toggleAccordion,
      agregarAlCarrito,
      mostrarMensaje,
      mensaje,
      mensajeError,
      whatsappShareUrl,
      // Nuevos filtros
      relatedFilters,
      specFilters,
      inventoryFilters,
      filteredProductosRelacionados,
      filteredEspecificaciones,
      filteredInventarios,
      marcasRelacionadas,
      hasActiveRelatedFilters,
      applyRelatedFilters,
      resetRelatedFilters,
      applySpecFilters,
      resetSpecFilters,
      applyInventoryFilters,
      // Nuevas funciones para el desglose de stock
      getTotalOpenBox,
      hasOpenBoxItems,
      openBoxTypes,
      loadingStockSucursales,
      errorStockSucursales,
      stockPorSucursal,
      toggleInventoryModal,
      compartirProducto
    };
  }
};
</script>
<!-- ✅ Estilos CSS ✅ -->
<style src="../assets/ProductoDetail.css"></style>