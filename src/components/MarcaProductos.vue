<template>
  <!-- frontend-vue/src/components/MarcaProductos.vue -->
  <div class="marca-productos-container">
    <!-- Estado de Error -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="retry" class="retry-button">Reintentar</button>
    </div>

    <!-- Estado de Carga -->
    <div v-else-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando productos...</p>
    </div>

    <!-- Estado Vacío -->
    <div v-else-if="productos.length === 0" class="empty-state">
      <h2>No hay productos disponibles</h2>
      <p>No se encontraron productos para esta marca.</p>
    </div>

    <!-- Contenido Principal -->
    <div v-else>
      <h1>Productos de {{ marca.nombre }}</h1>
      <div class="products-grid">
        <router-link
          v-for="producto in productos"
          :key="producto.producto_id"
          :to="`/productos/${producto.producto_id}`"
          class="product-card"
        >
          <div class="product-card-image">
            <img :src="producto.img_portada" alt="Producto" />
          </div>
          <div class="product-card-body">
            <h2 class="product-title">{{ producto.titulo }}</h2>

            <div class="product-meta">
              <p><strong>Modelo:</strong> {{ producto.modelo || 'N/A' }}</p>
              <p><strong>Marca:</strong> {{ producto.marca || 'N/A' }}</p>               
            </div>

            <div class="pricing">
              <span v-if="producto.precios && producto.precios.precio_descuento && parseFloat(producto.precios.precio_descuento) < parseFloat(producto.precios.precio_lista)">
                <span class="precio-descuento">${{ parseFloat(producto.precios.precio_descuento).toFixed(2) }}</span>
                <span class="precio-lista-tachado">${{ parseFloat(producto.precios.precio_lista).toFixed(2) }}</span>
                <span v-if="producto.precios.descuento" class="discount-badge">
                  -{{ producto.precios.descuento }}%
                </span>
              </span>
              <span v-else>
                <span class="precio-normal">${{ parseFloat(producto.precios.precio_lista).toFixed(2) }}</span>
              </span>
            </div>

            <div class="stock-info" :class="getStockClass(producto.total_existencia)">
              <span v-if="producto.total_existencia > 0">
                Disponible: {{ producto.total_existencia }} unidades
              </span>
              <span v-else>Sin existencias</span>
            </div>

            <div class="product-card-actions">
              <button 
                class="add-to-cart" 
                :disabled="producto.total_existencia <= 0" 
                @click="agregarAlCarrito(producto)"
              >
                Agregar 🛒
              </button>
              <button class="view-detail">Ver detalle</button>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'MarcaProductos',
  setup() {
    const route = useRoute();
    const marca = ref({});
    const productos = ref([]);
    const error = ref(null);
    const loading = ref(true);

    const loadMarca = async (id) => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/marcas/${id}`);
        if (!response.ok) throw new Error('Error al obtener la marca');
        marca.value = await response.json();
      } catch (err) {
        error.value = `Hubo un problema al obtener la marca: ${err.message}`;
      }
    };

    const loadProductos = async (id) => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/marcas/${id}/productos`);
        if (!response.ok) throw new Error('Error al obtener los productos');
        const data = await response.json();
        productos.value = data.productos || [];
      } catch (err) {
        error.value = `Hubo un problema al obtener los productos: ${err.message}`;
      } finally {
        loading.value = false;
      }
    };

    const retry = () => {
      const id = route.params.id;
      loadMarca(id);
      loadProductos(id);
    };

    const getStockClass = (stock) => {
      if (stock <= 0) return 'stock-cero';
      if (stock < 5) return 'stock-bajo';
      return 'stock-normal';
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price || 0);
    };

    const agregarAlCarrito = (producto) => {
      let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
      const productoExistente = carrito.find(item => item.producto_id === producto.producto_id);

      if (productoExistente) {
        productoExistente.cantidad += 1;
      } else {
        carrito.push({
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

      localStorage.setItem('carrito', JSON.stringify(carrito));
      alert(`${producto.titulo} ha sido agregado al carrito.`);
    };

    onMounted(async () => {
      const id = route.params.id;
      await Promise.all([loadMarca(id), loadProductos(id)]);
    });

    return {
      marca,
      productos,
      error,
      loading,
      retry,
      getStockClass,
      formatPrice,
      agregarAlCarrito
    };
  }
};
</script>

<style src="../assets/MarcaProductos.css"></style>