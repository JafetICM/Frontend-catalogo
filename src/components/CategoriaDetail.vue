<template>
  <div class="productos-page">
    <!-- Header con controles -->
    <div class="productos-header">
      <div class="controls-section">
        <select v-model="sortBy" @change="applySort" class="sort-select">
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="name_asc">Nombre: A-Z</option>
            <option value="name_desc">Nombre: Z-A</option>
          </select>
        
        <button @click="resetFilters" class="reset-filters-btn">
          Limpiar Filtros
        </button>
        </div>
      </div>

    <!-- Contenido principal con layout de dos columnas -->
    <div class="main-content">
      <!-- Columna izquierda: Productos -->
      <div class="products-column">
      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando productos...</p>
      </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-container">
          <p>{{ error }}</p>
          <button @click="retry" class="retry-button">Reintentar</button>
      </div>

      <!-- Products grid -->
      <div v-else class="products-grid">
          <div 
            v-for="producto in productosPaginados" 
             :key="producto.producto_id" 
             class="product-card"
            @click="navigateToProduct(producto.producto_id)"
          >
          <div class="product-image">
            <img :src="producto.img_portada" :alt="producto.titulo">
              <div class="product-overlay">
                <button 
                  class="add-to-cart-btn" 
                  @click.stop="addToCart(producto)"
                  :disabled="producto.total_existencia === 0"
                >
                  Agregar al Carrito
              </button>
            </div>
          </div>
            
          <div class="product-info">
            <h3 class="product-title">{{ producto.titulo }}</h3>
              <p class="product-brand">{{ producto.marca }}</p>
              
            <div class="product-price">
              <span v-if="producto.precios && producto.precios.precio_descuento && parseFloat(producto.precios.precio_descuento) < parseFloat(producto.precios.precio_lista)">
                  <span class="price-discount">${{ parseFloat(producto.precios.precio_descuento).toFixed(2) }}</span>
                  <span class="price-original">${{ parseFloat(producto.precios.precio_lista).toFixed(2) }}</span>
              </span>
              <span v-else>
                  <span class="price-normal">${{ parseFloat(producto.precios.precio_lista).toFixed(2) }}</span>
              </span>
            </div>
              
            <div class="stock-status" :class="getStockClass(producto.total_existencia)">
              {{ getStockText(producto.total_existencia) }}
            </div>
          </div>
        </div>
      </div>

        <!-- Paginación -->
      <div class="pagination" v-if="totalPages > 1">
          <button :disabled="currentPage === 1" @click="changePage(1)">«</button>
          <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">‹</button>
          
        <button
            v-for="page in visiblePages"
            :key="page"
            :class="['page-btn', { active: currentPage === page }]"
            @click="changePage(page)"
            :disabled="currentPage === page"
          >
            {{ page }}
          </button>
          
          <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">›</button>
          <button :disabled="currentPage === totalPages" @click="changePage(totalPages)">»</button>
        </div>
      </div>

      <!-- Columna derecha: Filtros -->
      <div class="filters-column">
        <div class="filters-sidebar">
          <div class="filters-header">
            <h3>Filtros</h3>
            <button @click="resetFilters" class="reset-sidebar-btn">
              🔄 Limpiar
        </button>
          </div>

          <!-- Filtros de marca -->
          <div class="filter-section" v-if="marcasDisponibles.length">
            <h4>Marcas</h4>
            <div class="brands-filter">
              <label 
                v-for="marca in marcasDisponibles" 
                :key="marca" 
                class="brand-checkbox"
              >
                <input 
                  type="checkbox" 
                  v-model="filters.selectedBrands" 
                  :value="marca"
                  @change="applyFilters"
                />
                <span>{{ marca }} ({{ contarProductosPorMarca(marca) }})</span>
              </label>
            </div>
          </div>
          
          <!-- Filtro de disponibilidad -->
          <div class="filter-section">
            <h4>Disponibilidad</h4>
            <div class="stock-filter">
              <label class="stock-checkbox">
                <input 
                  type="checkbox" 
                  v-model="filters.onlyInStock"
                  @change="applyFilters"
                />
                <span>Solo productos en existencia</span>
              </label>
            </div>
          </div>

          <!-- Filtro de precio -->
          <div class="filter-section">
            <h4>Rango de Precio</h4>
            <div class="price-inputs">
              <div class="price-input-group">
                <label>Mínimo:</label>
                <input 
                  type="number" 
                  v-model="filters.minPrice" 
                  placeholder="0"
                  @input="debouncedApplyFilters"
                  class="price-input"
                />
              </div>
              <div class="price-input-group">
                <label>Máximo:</label>
                <input 
                  type="number" 
                  v-model="filters.maxPrice" 
                  placeholder="999999"
                  @input="debouncedApplyFilters"
                  class="price-input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje de notificación -->
    <div v-if="mostrarMensaje" class="mensaje-agregado" :class="{ 'error': mensajeError }">
      {{ mensaje }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
  name: 'CategoriaDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const productos = ref([]);
    const selectedCategory = ref({});
    const loading = ref(true);
    const error = ref(null);
    const currentPage = ref(1);
    const itemsPerPage = 12;
    const sortBy = ref('price_asc');

    const filters = ref({
      selectedBrands: [],
      onlyInStock: false,
      minPrice: '',
      maxPrice: ''
    });

    // Estados para mensajes
    const mostrarMensaje = ref(false);
    const mensaje = ref('');
    const mensajeError = ref(false);

    // Computed properties
    const marcasDisponibles = computed(() => {
      const marcas = new Set(productos.value.map(p => p.marca));
      return Array.from(marcas).sort();
    });

    const getPrecioFiltrado = (p) => {
      if (p.precios?.precio_descuento && parseFloat(p.precios.precio_descuento) < parseFloat(p.precios.precio_lista)) {
        return parseFloat(p.precios.precio_descuento);
      }
      return parseFloat(p.precios?.precio_lista) || 0;
    };

    const productosFiltrados = computed(() => {
      let result = [...productos.value];

      // Filtrar por marcas seleccionadas
      if (filters.value.selectedBrands.length > 0) {
        result = result.filter(p => filters.value.selectedBrands.includes(p.marca));
      }

      // Filtrar por stock
      if (filters.value.onlyInStock) {
        result = result.filter(p => p.total_existencia > 0);
      }

      // Filtrar por precio
      if (filters.value.minPrice) {
        result = result.filter(p => getPrecioFiltrado(p) >= Number(filters.value.minPrice));
      }
      if (filters.value.maxPrice) {
        result = result.filter(p => getPrecioFiltrado(p) <= Number(filters.value.maxPrice));
      }

      // Aplicar ordenamiento
      result.sort((a, b) => {
        const precioA = getPrecioFiltrado(a);
        const precioB = getPrecioFiltrado(b);
        
        switch(sortBy.value) {
          case 'price_asc':
            return precioA - precioB;
          case 'price_desc':
            return precioB - precioA;
          case 'name_asc':
            return a.titulo.localeCompare(b.titulo);
          case 'name_desc':
            return b.titulo.localeCompare(a.titulo);
          default:
            return 0;
        }
      });

      return result;
    });

    const totalPages = computed(() => 
      Math.ceil(productosFiltrados.value.length / itemsPerPage)
    );

    const productosPaginados = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return productosFiltrados.value.slice(start, end);
    });

    const visiblePages = computed(() => {
      const pages = [];
      const max = totalPages.value;
      const current = currentPage.value;
      if (max <= 7) {
        for (let i = 1; i <= max; i++) pages.push(i);
      } else {
        if (current <= 4) {
          pages.push(1, 2, 3, 4, 5, '...', max);
        } else if (current >= max - 3) {
          pages.push(1, '...', max - 4, max - 3, max - 2, max - 1, max);
        } else {
          pages.push(1, '...', current - 1, current, current + 1, '...', max);
        }
      }
      return pages;
    });

    // Methods
    const contarProductosPorMarca = (marca) => {
      return productos.value.filter(p => p.marca === marca).length;
    };

    const loadProductsByCategory = async (categoryId) => {
      try {
        loading.value = true;
        error.value = null;
        const response = await fetch(`https://backend-laravel-o66e6.ondigitalocean.app/productos?categoria_id=${categoryId}&page=${currentPage.value}`);
        if (!response.ok) {
          throw new Error("Error al cargar productos");
        }
        const data = await response.json();
        productos.value = data.productos;
        currentPage.value = 1;
      } catch (err) {
        error.value = 'Error al cargar los productos. Por favor, intente nuevamente.';
        console.error("Error al obtener los productos:", err);
      } finally {
        loading.value = false;
      }
    };

    const loadCategory = async (categoryId) => {
      try {
        const response = await fetch(`https://backend-laravel-o66e6.ondigitalocean.app/categorias-syscom/${categoryId}`);
        const data = await response.json();
        selectedCategory.value = data;
      } catch (err) {
        console.error("Error al cargar la categoría:", err);
      }
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price || 0);
    };

    const getStockClass = (stock) => {
      if (stock <= 0) return 'out-of-stock';
      if (stock < 5) return 'low-stock';
      return 'in-stock';
    };

    const getStockText = (stock) => {
      if (stock <= 0) return 'Sin existencias';
      if (stock < 5) return `¡Solo ${stock} disponibles!`;
      return 'En existencia';
    };

    const navigateToProduct = (productId) => {
      router.push({
        name: 'ProductoDetail',
        params: { id: productId }
      });
    };

    const changePage = (page) => {
      currentPage.value = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Debounce para búsquedas
    let debounceTimer = null;
    
    const debouncedApplyFilters = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        applyFilters();
      }, 300);
    };

    const applyFilters = () => {
      currentPage.value = 1;
    };

    const resetFilters = () => {
      filters.value = {
        selectedBrands: [],
        onlyInStock: false,
        minPrice: '',
        maxPrice: ''
      };
      sortBy.value = 'price_asc';
      currentPage.value = 1;
    };

    const applySort = () => {
      currentPage.value = 1;
    };

    const addToCart = (producto) => {
      try {
        // Verificar stock
        if (producto.total_existencia <= 0) {
          mensaje.value = 'Producto sin existencias';
          mensajeError.value = true;
          mostrarMensaje.value = true;
          setTimeout(() => {
            mostrarMensaje.value = false;
          }, 3000);
          return;
        }

        // Obtener el carrito actual del localStorage
        const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];
        
        // Verificar si el producto ya está en el carrito
        const productoExistente = carritoActual.find(item => item.producto_id === producto.producto_id);
        
        if (productoExistente) {
          // Si el producto existe, actualizar la cantidad
          const nuevaCantidad = productoExistente.cantidad + 1;
          
          // Verificar que no exceda el stock disponible
          if (nuevaCantidad > producto.total_existencia) {
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
            producto_id: producto.producto_id,
            titulo: producto.titulo,
            modelo: producto.modelo,
            marca: producto.marca,
            img_portada: producto.img_portada,
            imagen: producto.img_portada, // Para compatibilidad con la cotización
            precios: producto.precios,
            cantidad: 1,
            peso: parseFloat(producto.peso) || 0
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
        
        // Opcional: Preguntar si desea ir al carrito
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

    const retry = () => {
      const categoryId = route.params.id;
      if (categoryId) {
        loadCategory(categoryId);
        loadProductsByCategory(categoryId);
      }
    };

    // Watch route changes
    watch(
      () => route.params.id,
      (newId) => {
        if (newId) {
          currentPage.value = 1;
          loadCategory(newId);
          loadProductsByCategory(newId);
        }
      }
    );

    onMounted(() => {
      const categoryId = route.params.id;
      if (categoryId) {
        loadCategory(categoryId);
        loadProductsByCategory(categoryId);
      }
    });

    return {
      productos,
      selectedCategory,
      loading,
      error,
      currentPage,
      totalPages,
      sortBy,
      filters,
      marcasDisponibles,
      productosFiltrados,
      productosPaginados,
      formatPrice,
      getStockClass,
      getStockText,
      navigateToProduct,
      changePage,
      applyFilters,
      debouncedApplyFilters,
      resetFilters,
      applySort,
      addToCart,
      contarProductosPorMarca,
      visiblePages,
      mostrarMensaje,
      mensaje,
      mensajeError,
      retry
    };
  }
};
</script>

<style src="../assets/CategoriaDetail.css"></style>
