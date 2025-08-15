<template>
  <!-- frontend-vue\src\components\MarcasList.vue -->
  <div class="marcas-container">
    <h1>Marcas</h1>

    <!-- Mostrar el estado de carga -->
    <div v-if="loading" class="loading-message">
      <p>Cargando marcas...</p>
    </div>

    <!-- Mostrar el mensaje de error si ocurre alguno -->
    <div v-if="error" class="error-message">
      <p>Hubo un problema al obtener las marcas: {{ error }}</p>
    </div>

    <!-- Mostrar las marcas -->
    <div v-if="marcas.length > 0" class="marcas-list">
      <div v-for="marca in marcas" :key="marca.id" class="marca-item">
        <!-- Mostrar solo el logo -->
        <img :src="marca.logo" alt="Logo de la marca" class="marca-logo" />
      </div>
    </div>

    <!-- Si no hay marcas -->
    <div v-else>
      <p>No hay marcas disponibles.</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'MarcasList',
  setup() {
    const marcas = ref([]);
    const loading = ref(true);
    const error = ref(null);  // Agregar la variable `error` para mostrar en la UI

    // Obtener las marcas desde la API
    onMounted(async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/marcas');
        const data = await response.json();
        marcas.value = data;
      } catch (err) {
        error.value = `Hubo un problema al obtener las marcas: ${err.message}`;
        console.error(err);
      } finally {
        loading.value = false;
      }
    });

    return { marcas, loading, error };
  },
};
</script>

<style src="../assets/MarcasList.css"></style>
