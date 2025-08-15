<template>
  <div class="product-search-form-container">
    <h2>Buscar Productos</h2>
    <div class="search-bar">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Busca productos por nombre, marca o modelo..." 
        @keyup.enter="searchProducts"
      />
      <button @click="searchProducts">Buscar</button>
    </div>

    <!-- Productos encontrados -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando productos...</p>
    </div>

    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <div v-if="productosRelacionados.length > 0" class="search-results">
      <h3>Resultados de la Búsqueda</h3>
      <div class="product-grid">
        <div 
          v-for="(producto, index) in productosRelacionados" 
          :key="index" 
          class="product-card"
        >
          <router-link :to="`/producto/${producto.producto_id}`" class="product-link">
            <div class="product-image">
              <img :src="producto.img_portada" :alt="producto.titulo" />
            </div>
            <div class="product-info">
              <h4>{{ producto.titulo }}</h4>
              <p class="product-price">MX$ {{ formatPrice(producto.precios?.precio_descuento || producto.precios?.precio_especial) }}</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Si no hay productos relacionados -->
    <div v-if="productosRelacionados.length === 0 && !loading" class="no-results">
      <p>No se encontraron productos relacionados a "{{ searchQuery }}".</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'ProductSearchForm',
  setup() {
    const searchQuery = ref('');
    const productosRelacionados = ref([]);
    const error = ref(null);
    const loading = ref(false);

    const searchProducts = async () => {
      if (!searchQuery.value.trim()) {
        return;
      }

      loading.value = true;
      error.value = null;
      productosRelacionados.value = [];

      try {
        const response = await fetch(`http://127.0.0.1:8000/productos/buscar?query=${searchQuery.value}`);
        if (!response.ok) {
          throw new Error('Error al obtener los productos');
        }
        const data = await response.json();
        productosRelacionados.value = data.productos || [];
      } catch (err) {
        error.value = `Hubo un problema al obtener los productos: ${err.message}`;
      } finally {
        loading.value = false;
      }
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price || 0);
    };

    return {
      searchQuery,
      productosRelacionados,
      error,
      loading,
      searchProducts,
      formatPrice
    };
  }
};
</script>

<style src="../assets/ProductSearchForm.css"></style>