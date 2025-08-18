<template>
  <!-- frontend-vue/src/App.vue -->
  <div>
    <!-- Navbar -->
    <nav class="navbar">
      <router-link to="/" class="logo">AHRO Catalogo</router-link>
      <ul class="menu">
        <!-- Megamenú Categorías -->
        <li class="dropdown" @mouseover="showSubcategories" @mouseleave="hideSubcategories">
          <a href="#">Categorías</a>
          <div class="dropdown-content" v-show="isSubcategoriesVisible">
            <!-- Columna izquierda - Categorías principales -->
            <!-- Columna de categorías -->
            <div class="categories-sidebar">
              <div
                v-for="categoria in categorias"
                :key="categoria.id"
                class="category-item"
                :class="{ active: selectedCategoryId === categoria.id }"
                @mouseover="selectCategory(categoria)"
              >
                <router-link 
                  :to="`/categorias/${categoria.id}`"
                  class="category-link">
                  <span class="category-name">{{ categoria.nombre }}</span>
                </router-link>
              </div>
            </div>

            <!-- Columna central - Subcategorías -->
            <div class="subcategories-content" v-if="selectedCategory && Array.isArray(selectedCategory.subcategorias)">
              <div class="content-header">
                <h3>{{ selectedCategory.nombre }}</h3>
              </div>
              <div class="subcategories-list">
                <div
                  v-for="subcategoria in selectedCategory.subcategorias"
                  :key="subcategoria.id"
                  class="subcategory-item"
                  @mouseover="selectSubcategory(subcategoria)"
                >
                  <router-link 
                    :to="`/categorias/${subcategoria.id}`" 
                    class="subcategory-link"
                    @click="closeAllMenus">
                    {{ subcategoria.nombre }}
                  </router-link>
                  <!-- Sub-subcategorías -->
                  <div
                    class="sub-subcategories-content"
                    v-if="selectedSubcategory && selectedSubcategory.id === subcategoria.id && Array.isArray(subcategoria.subcategorias)"
                  >
                    <div class="sub-subcategories-list">
                      <div
                        v-for="subSub in subcategoria.subcategorias"
                        :key="subSub.id"
                        class="sub-subcategory-item"
                      >
                        <router-link 
                          :to="`/categorias/${subSub.id}`" 
                          class="sub-subcategory-link"
                          @click="closeAllMenus">
                          {{ subSub.nombre }}
                        </router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>

        <!-- Enlace a productos -->
        <li><router-link to="/productos">Productos</router-link></li>

        <!-- Megamenú Marcas -->
        <li class="dropdown" @mouseover="showMarcas" @mouseleave="hideMarcas">
          <a href="#">Marcas</a>
          <div class="dropdown-content marcas-dropdown" v-show="isMarcasVisible">
            <!-- Columna única - Todas las marcas -->
            <div class="marcas-content">
              <!-- Filtro de búsqueda para marcas -->
              <div class="search-container">
                <input 
                  v-model="marcaBusqueda" 
                  type="text" 
                  placeholder="Buscar marcas..." 
                  @input="filterMarcas" 
                />
              </div>
              <div class="content-header">
                <h3>Todas las Marcas</h3>
              </div>
              <!-- Muestra un spinner de carga -->
              <div v-if="loadingMarcas" class="loading-marcas">
                <p>Cargando marcas...</p>
              </div>
              <div class="marcas-grid">
                <div
                  v-for="marca in marcasFiltradas"
                  :key="marca.id"
                  class="marca-item"
                  @click="navigateToMarca(marca.id)"
                >
                  <div class="marca-link">
                    <span class="marca-name">{{ marca.nombre }}</span>
                  </div>
                </div>
              </div>

              <!-- Mensaje cuando no hay marcas -->
              <div v-if="marcasFiltradas.length === 0 && !loadingMarcas" class="no-marcas">
                <p>No hay marcas disponibles</p>
              </div>
            </div>
          </div>
        </li>
      </ul>

      <!-- Búsqueda de productos -->
      <div class="search-container">
        <form @submit.prevent="buscarProductosDesdeNavbar">
          <input v-model="busqueda" type="text" placeholder="Buscar productos" />
          <button type="submit">Buscar</button>
        </form>
      </div>

      <!-- Menú desplegable de usuario -->
      <div class="user-menu-dropdown">
        <button class="user-menu-toggle" @click="toggleUserMenu" aria-label="Menú de usuario">
          <i class="fas fa-user-circle"></i>
          <span class="user-menu-text">Extenciones</span>
          <i class="fas fa-chevron-down user-menu-arrow" :class="{ 'rotated': showUserMenu }"></i>
        </button>
        
        <div class="user-menu-content" v-show="showUserMenu">
          <!-- Modo oscuro -->
          <div class="user-menu-item">
            <button @click="toggleTheme" class="user-menu-btn theme-toggle">
              <i class="fas" :class="isDarkMode ? 'fa-moon' : 'fa-sun'"></i>
              <span>{{ isDarkMode ? 'Modo Claro' : 'Modo Oscuro' }}</span>
            </button>
          </div>
          
          <!-- Carrito -->
          <div class="user-menu-item">
            <router-link to="/carrito" class="user-menu-btn cart-link">
              <i class="fas fa-shopping-cart"></i>
              <span>Mi Carrito</span>
              <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
            </router-link>
          </div>
          
          <!-- Mis Facturas -->
          <div class="user-menu-item">
            <router-link to="/facturas" class="user-menu-btn">
              <i class="fas fa-file-invoice"></i>
              <span>Mis Facturas</span>
            </router-link>
          </div>
          
          <!-- Separador -->
          <div class="user-menu-separator"></div>
          
          <!-- Información del usuario -->
          <div class="user-menu-item">
            
          </div>
        </div>
      </div>
    </nav>

    <!-- Vista principal -->
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'App',
  setup() {
    const isDarkMode = ref(false);
    const categorias = ref([]);
    const marcas = ref([]);
    const busqueda = ref('');
    const marcaBusqueda = ref('');
    const marcasFiltradas = ref([]);
    const loading = ref(true);
    const loadingMarcas = ref(false);
    const isSubcategoriesVisible = ref(false);
    const selectedCategory = ref(null);
    const selectedSubcategory = ref(null);
    const selectedCategoryId = ref(null);
    const isMarcasVisible = ref(false);
    const showUserMenu = ref(false);
    const cartItemCount = ref(0);
    const router = useRouter();

    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value;
      document.body.classList.toggle('dark-mode', isDarkMode.value);
      localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
    };

    // Cargar categorías principales con cache local
    onMounted(async () => {
      try {
        // Verificar cache local
        const cachedCategorias = localStorage.getItem('categorias_cache');
        const cacheTimestamp = localStorage.getItem('categorias_timestamp');
        const now = Date.now();
        
        // Cache válido por 1 hora
        if (cachedCategorias && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 3600000) {
          categorias.value = JSON.parse(cachedCategorias);
          loading.value = false;
          return;
        }
        
        const response = await fetch('https://backend-laravel-o66e6.ondigitalocean.app/categorias-syscom', {
          headers: {
            'Accept': 'application/json'
          }
        });
        const data = await response.json();
        categorias.value = data.map(cat => ({ ...cat, subcategorias: [] }));
        
        // Guardar en cache local
        localStorage.setItem('categorias_cache', JSON.stringify(categorias.value));
        localStorage.setItem('categorias_timestamp', now.toString());
        
        loading.value = false;
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        loading.value = false;
      }
      
      // Agregar event listener para cerrar el menú cuando se hace clic fuera
      document.addEventListener('click', (event) => {
        const userMenu = document.querySelector('.user-menu-dropdown');
        const userMenuToggle = document.querySelector('.user-menu-toggle');
        
        // Si el clic no es en el menú ni en el botón toggle, cerrar el menú
        if (userMenu && !userMenu.contains(event.target) && !userMenuToggle?.contains(event.target)) {
          showUserMenu.value = false;
        }
      });
      
      // Inicializar contador del carrito
      getCartItemCount();
    });

    // Cargar marcas con cache local
    const fetchMarcas = async () => {
      if (marcas.value.length > 0) return;

      loadingMarcas.value = true;
      try {
        // Verificar cache local
        const cachedMarcas = localStorage.getItem('marcas_cache');
        const cacheTimestamp = localStorage.getItem('marcas_timestamp');
        const now = Date.now();
        
        // Cache válido por 1 hora
        if (cachedMarcas && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 3600000) {
          marcas.value = JSON.parse(cachedMarcas);
          marcasFiltradas.value = marcas.value;
          loadingMarcas.value = false;
          return;
        }
        
        const response = await fetch('https://backend-laravel-o66e6.ondigitalocean.app/marcas');
        const data = await response.json();
        marcas.value = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
        marcasFiltradas.value = marcas.value;
        
        // Guardar en cache local
        localStorage.setItem('marcas_cache', JSON.stringify(marcas.value));
        localStorage.setItem('marcas_timestamp', now.toString());
      } catch (error) {
        console.error('Error al cargar marcas:', error);
        marcas.value = [];
      } finally {
        loadingMarcas.value = false;
      }
    };

    const filterMarcas = () => {
      marcasFiltradas.value = marcas.value.filter(marca =>
        marca.nombre.toLowerCase().includes(marcaBusqueda.value.toLowerCase())
      );
    };

    const buscarProductosDesdeNavbar = () => {
      if (busqueda.value) {
        router.push({ path: '/productos', query: { busqueda: busqueda.value } });
      }
    };

    // Al hacer clic en una marca, actualizar las categorías y navegar a la marca
    const navigateToMarca = (marcaId) => {
      updateCategoriesByBrand(marcaId);  // Actualizamos las categorías de la marca seleccionada
      router.push({ name: 'MarcaDetail', params: { id: marcaId } });
      hideMarcas();  // Ocultar el menú de marcas
    };

    // Función para actualizar las categorías de una marca específica
    const updateCategoriesByBrand = async (marcaId) => {
      try {
        const response = await fetch(`https://backend-laravel-o66e6.ondigitalocean.app/categorias-syscom?marca=${marcaId}`);
        const data = await response.json();
        categorias.value = data.map(cat => ({ ...cat, subcategorias: [] }));
      } catch (err) {
        console.error('Error al actualizar categorías por marca:', err);
      }
    };

    const selectCategory = async (categoria) => {
      selectedCategoryId.value = categoria.id;
      selectedCategory.value = categoria;
      selectedSubcategory.value = null;
      if (!categoria.subcategorias || categoria.subcategorias.length === 0) {
        await fetchSubcategorias(categoria.id);
      }
    };

    const selectSubcategory = async (subcategoria) => {
      selectedSubcategory.value = subcategoria;
      if (!subcategoria.subcategorias) {
        await fetchSubcategorias(subcategoria.id, selectedCategory.value.id);
      }
    };

    const fetchSubcategorias = async (id, parentId = null) => {
      try {
        // Verificar cache local para subcategorías
        const cacheKey = `subcategorias_${id}`;
        const cachedSubcategorias = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
        const now = Date.now();
        
        // Cache válido por 30 minutos
        if (cachedSubcategorias && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 1800000) {
          const data = JSON.parse(cachedSubcategorias);
          updateSubcategoriasInMemory(id, parentId, data);
          return;
        }
        
        const response = await fetch(`https://backend-laravel-o66e6.ondigitalocean.app/categorias-syscom/${id}`);
        const data = await response.json();
        
        // Guardar en cache local
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
        
        updateSubcategoriasInMemory(id, parentId, data);
      } catch (err) {
        console.error('Error al cargar subcategorías:', err);
      }
    };

    const updateSubcategoriasInMemory = (id, parentId, data) => {
      if (parentId) {
        const parent = categorias.value.find(cat =>
          cat.subcategorias?.some(sub => sub.id === parentId)
        );
        if (parent) {
          const sub = parent.subcategorias.find(s => s.id === id);
          if (sub) sub.subcategorias = data.subcategorias || [];
        }
      } else {
        const categoria = categorias.value.find(cat => cat.id === id);
        if (categoria) categoria.subcategorias = data.subcategorias || [];
      }
    };

    const showSubcategories = () => {
      isSubcategoriesVisible.value = true;
    };
    const hideSubcategories = () => {
      isSubcategoriesVisible.value = false;
    };

    const closeUserMenu = () => {
      showUserMenu.value = false;
    };

    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value;
    };

    // Obtener cantidad de productos en el carrito
    const getCartItemCount = () => {
      try {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const count = carrito.reduce((total, item) => total + (item.cantidad || 1), 0);
        cartItemCount.value = count;
        return count;
      } catch (error) {
        cartItemCount.value = 0;
        return 0;
      }
    };

    // Watcher para el carrito
    watch(() => localStorage.getItem('carrito'), () => {
      getCartItemCount();
    }, { immediate: true });
    const showMarcas = () => {
      isMarcasVisible.value = true;
      // Solo cargar si no están ya cargadas
      if (marcas.value.length === 0) {
        fetchMarcas();
      } else {
        // Si ya están cargadas, mostrar inmediatamente
        marcasFiltradas.value = marcas.value;
      }
    };
    const hideMarcas = () => {
      isMarcasVisible.value = false;
    };
    const closeAllMenus = () => {
      isSubcategoriesVisible.value = false;
      isMarcasVisible.value = false;
      selectedCategory.value = null;
      selectedSubcategory.value = null;
      selectedCategoryId.value = null;
    };

    return {
      isDarkMode,
      toggleTheme,
      categorias,
      marcas,
      busqueda,
      marcaBusqueda,
      marcasFiltradas,
      loading,
      loadingMarcas,
      buscarProductosDesdeNavbar,
      navigateToMarca,
      isSubcategoriesVisible,
      showSubcategories,
      hideSubcategories,
      fetchSubcategorias,
      selectedCategory,
      selectedSubcategory,
      selectedCategoryId,
      selectCategory,
      selectSubcategory,
      isMarcasVisible,
      showMarcas,
      hideMarcas,
      closeAllMenus,
      filterMarcas,
      showUserMenu,
      closeUserMenu,
      toggleUserMenu,
      getCartItemCount,
      cartItemCount
    };
  }
};
</script>

<style src="./assets/App.css"></style>