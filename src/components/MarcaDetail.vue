<template>
  <!-- frontend-vue/src/components/MarcaDetail.vue -->
  <div class="marca-detail-container">
    <!-- Estado de Error -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="retry" class="retry-button">Reintentar</button>
    </div>

    <!-- Estado de Carga -->
    <div v-else-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando información de la marca...</p>
    </div>

    <!-- Contenido Principal -->
    <div v-else>
      <section class="hero-section">
        <!-- Logo de la marca y descripción -->
        <div class="hero-content">
          <img :src="marca.logo" alt="Logo de la marca" class="marca-logo" />
          <div class="marca-description">
            <h1>{{ marca.nombre }}</h1>
            <p>{{ marca.descripcion }}</p>
          </div>
        </div>
      </section>

      <!-- Categorías -->
      <section class="categorias-section">
        <h2>Categorías</h2>
        <div v-if="marca.categorias && marca.categorias.length > 0" class="categorias-list">
          <div v-for="categoria in marca.categorias" :key="categoria.id" class="categoria-card">
            <img :src="categoria.imagen" alt="Imagen de la categoría" class="categoria-img" />
            <div class="categoria-info">
              <h3>{{ categoria.nombre }}</h3>
              <button @click="filterByCategory(categoria.id)">Ver productos de esta categoría</button>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No hay categorías disponibles para esta marca.</p>
        </div>
      </section>

      <!-- Botón de productos -->
      <section class="productos-section">
        <button @click="loadAllProducts" class="ver-productos-btn">Ver todos los productos</button>
        <MarcaProductos 
          v-if="productosVisible" 
          :productos="filteredProducts" 
          :marca-id="route.params.id" 
        />
        <div v-else>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import MarcaProductos from './MarcaProductos.vue';

export default {
  name: 'MarcaDetail',
  components: { MarcaProductos },
  setup() {
    const route = useRoute();
    const marca = ref({});
    const error = ref(null);
    const loading = ref(true);
    const productosVisible = ref(false);
    const allProducts = ref([]);
    const filteredProducts = ref([]);

    const loadMarca = async (id) => {
      try {
        // Verificar cache local
        const cacheKey = `marca_${id}`;
        const cachedMarca = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(cacheKey + '_timestamp');
        const now = Date.now();
        
        // Cache válido por 1 hora
        if (cachedMarca && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 3600000) {
          marca.value = JSON.parse(cachedMarca);
          return;
        }
        
        const response = await fetch(`https://backend-laravel-o66e6.ondigitalocean.app/marcas/${id}`);
        if (!response.ok) throw new Error('Error al obtener la marca');
        marca.value = await response.json();
        
        // Guardar en cache local
        localStorage.setItem(cacheKey, JSON.stringify(marca.value));
        localStorage.setItem(cacheKey + '_timestamp', now.toString());
      } catch (err) {
        error.value = `Hubo un problema al obtener la marca: ${err.message}`;
      } finally {
        loading.value = false;
      }
    };

    const loadProductos = async (id) => {
      try {
        // Verificar cache local
        const cacheKey = `productos_marca_${id}`;
        const cachedProductos = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(cacheKey + '_timestamp');
        const now = Date.now();
        
        // Cache válido por 30 minutos
        if (cachedProductos && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 1800000) {
          const data = JSON.parse(cachedProductos);
          allProducts.value = data.productos || [];
          filteredProducts.value = allProducts.value;
          return;
        }
        
        const response = await fetch(`https://backend-laravel-o66e6.ondigitalocean.app/marcas/${id}/productos`);
        if (!response.ok) throw new Error('Error al obtener los productos');
        const data = await response.json();

        console.log("Productos obtenidos:", data);

        // ✅ Aquí extraemos correctamente solo el arreglo de productos
        allProducts.value = data.productos || [];
        filteredProducts.value = allProducts.value;
        
        // Guardar en cache local
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(cacheKey + '_timestamp', now.toString());

      } catch (err) {
        error.value = `Hubo un problema al obtener los productos: ${err.message}`;
      } finally {
        loading.value = false;
      }
    };


    const loadAllProducts = () => {
      filteredProducts.value = allProducts.value;
      productosVisible.value = true;
    };

    const filterByCategory = (categoryId) => {
      // Filtrar los productos por categoría seleccionada
      filteredProducts.value = allProducts.value.filter(product => 
        product.categorias && product.categorias.some(cat => cat.id === categoryId)
      );
      productosVisible.value = true;  // Mostrar los productos filtrados
    };


    const retry = () => {
      if (route.params.id) {
        error.value = null;
        loadMarca(route.params.id);
        loadProductos(route.params.id);
      }
    };

    onMounted(() => {
      const id = route.params.id;
      if (id) {
        loadMarca(id);
        loadProductos(id);
      } else {
        error.value = "El parámetro de marca no está disponible.";
        loading.value = false;
      }
    });

    return {
      marca,
      error,
      loading,
      productosVisible,
      loadProductos,
      filterByCategory,
      loadAllProducts,
      retry,
      filteredProducts,
      route
    };
  }
};
</script>

<style src="../assets/MarcaDetail.css"></style>
