<template>
  <!-- frontend-vue/src/components/Categorias.vue -->
  <div class="categorias-container">
    <h1>Categorías</h1>

    <!-- Mostrar el estado de carga -->
    <div v-if="loading" class="loading-message">
      <div class="spinner"></div>
      <p>Cargando categorías...</p>
    </div>

    <!-- Mostrar categorías y subcategorías -->
    <div v-if="!loading && categorias.length > 0" class="categorias-list">
      <div class="categorias-columns">
        <!-- Columna de categorías -->
        <div class="main-categories">
          <ul>
            <li v-for="categoria in categorias" :key="categoria.id" class="categoria-item" @click="setActiveCategory(categoria)">
              <h2>{{ categoria.nombre }}</h2>
              <p>Nivel: {{ categoria.id }}</p>
              <button class="cta">Subcategorías</button>
            </li>
          </ul>
        </div>

        <!-- Columna de subcategorías (a la derecha) -->
        <div class="subcategorias-column" v-if="activeCategory">
          <h2>{{ activeCategory.nombre }} - Subcategorías</h2>
          <div v-if="activeCategory.subcategorias && activeCategory.subcategorias.length > 0">
            <div class="subcategorias-grid">
              <div v-for="subcategoria in activeCategory.subcategorias" :key="subcategoria.id" class="subcategory-item">
                <router-link :to="`/categorias/${subcategoria.id}`" class="subcategory-link">
                  <div class="subcategory-card">
                    <h3>{{ subcategoria.nombre }}</h3>
                    <p class="subcategoria-level">(Nivel: {{ subcategoria.nivel }})</p>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
          <div v-else>
            <p>No hay subcategorías disponibles para esta categoría.</p>
          </div>

          <!-- Mostrar los productos de la categoría -->
          <div class="productos-de-categoria" v-if="activeCategory.productos && activeCategory.productos.length > 0">
            <h3>Productos de esta categoría</h3>
            <div class="productos-grid">
              <div v-for="producto in activeCategory.productos" :key="producto.id" class="producto-item">
                <img :src="producto.img_portada" alt="Producto" />
                <h4>{{ producto.titulo }}</h4>
                <p>{{ producto.descripcion }}</p>
                <p><strong>Precio:</strong> USD$ {{ producto.precio }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mostrar mensaje si no hay categorías -->
    <div v-if="!loading && categorias.length === 0">
      <p>No hay categorías disponibles.</p>
    </div>

    <!-- Mostrar mensaje de error si ocurre alguno -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'CategoriaList',
  setup() {
    const categorias = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const activeCategory = ref(null); // Para manejar la categoría activa

    // Obtener las categorías desde la API
    onMounted(async () => {
      try {
        const response = await fetch('https://backend-laravel-o66e6.ondigitalocean.app/categorias-syscom');
        const data = await response.json();
        categorias.value = data;
      } catch (err) {
        error.value = `Hubo un problema al obtener las categorías: ${err.message}`;
        console.error(err);
      } finally {
        loading.value = false;
      }
    });

    // Función para establecer la categoría activa y mostrar subcategorías
    // Función para establecer la categoría activa y mostrar subcategorías
    const setActiveCategory = async (categoria) => {
      activeCategory.value = categoria;
      try {
          const responseSubcategorias = await fetch(`https://backend-laravel-o66e6.ondigitalocean.app/categorias-syscom/${categoria.id}`);
          if (!responseSubcategorias.ok) throw new Error('Error al obtener subcategorías');
          const dataSubcategorias = await responseSubcategorias.json();
          activeCategory.value.subcategorias = dataSubcategorias.subcategorias || [];

          // Filtrar productos por categoría (usando el ID de la categoría)
          const responseProductos = await fetch(`https://backend-laravel-o66e6.ondigitalocean.app/productos?categoria_id=${categoria.id}`);
          if (!responseProductos.ok) throw new Error('Error al obtener productos');
          const productosData = await responseProductos.json();
          
          activeCategory.value.productos = productosData.productos || [];
      } catch (err) {
          error.value = `Error al obtener los productos o subcategorías: ${err.message}`;
          console.error(err);
      }
    };
    
    return { categorias, loading, activeCategory, setActiveCategory, error };
  },
};
</script>

<style src="../assets/Categorias.css" scoped></style>