<template>
  <div class="direccion-form">
    <div class="form-header">
      <h3 class="form-title">
        <i class="fas fa-map-marker-alt"></i>
        {{ editando ? 'Editar Dirección' : 'Nueva Dirección' }}
      </h3>
      <button @click="$emit('cancelar')" class="btn-cerrar" title="Cerrar formulario">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <form @submit.prevent="guardarDireccion" class="form-container">
      <div class="form-group">
        <label for="atencion_a">Atención a:</label>
        <input 
          v-model="direccion.atencion_a" 
          id="atencion_a" 
          type="text" 
          required 
          class="form-control"
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="codigo_postal">Código Postal:</label>
          <input 
            v-model="direccion.codigo_postal" 
            id="codigo_postal" 
            type="text" 
            required 
            @change="buscarCP"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="pais">País:</label>
          <select 
            v-model="direccion.pais" 
            id="pais" 
            required 
            class="form-control"
            @change="cargarEstados"
          >
            <option value="">Selecciona un país</option>
            <option v-for="pais in paises" :key="pais.codigo" :value="pais.codigo">
              {{ pais.nombre }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="estado">Estado:</label>
          <select 
            v-model="direccion.estado" 
            id="estado" 
            required 
            class="form-control"
          >
            <option value="">Selecciona un estado</option>
            <option v-for="estado in estados" :key="estado.codigo_estado" :value="estado.codigo_estado">
              {{ estado.estado_nombre }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="ciudad">Ciudad:</label>
          <input 
            v-model="direccion.ciudad" 
            id="ciudad" 
            type="text" 
            required 
            class="form-control"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="colonia">Colonia:</label>
        <select 
          v-model="direccion.colonia" 
          id="colonia" 
          required 
          class="form-control"
        >
          <option value="">Selecciona una colonia</option>
          <option v-for="colonia in colonias" :key="colonia" :value="colonia">
            {{ colonia }}
          </option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="calle">Calle:</label>
          <input 
            v-model="direccion.calle" 
            id="calle" 
            type="text" 
            required 
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="num_ext">Número Exterior:</label>
          <input 
            v-model="direccion.num_ext" 
            id="num_ext" 
            type="text" 
            required 
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="num_int">Número Interior:</label>
          <input 
            v-model="direccion.num_int" 
            id="num_int" 
            type="text" 
            class="form-control"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="telefono">Teléfono:</label>
        <input 
          v-model="direccion.telefono" 
          id="telefono" 
          type="tel" 
          required 
          class="form-control"
        />
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-guardar">
          <i class="fas fa-save"></i>
          {{ editando ? 'Actualizar' : 'Guardar' }}
        </button>
        <button type="button" @click="$emit('cancelar')" class="btn-cancelar">
          <i class="fas fa-times"></i>
          Cancelar
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'DireccionForm',
  props: {
    direccionEditar: {
      type: Object,
      default: null
    },
    editando: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      direccion: {
        atencion_a: '',
        calle: '',
        num_ext: '',
        num_int: '',
        colonia: '',
        codigo_postal: '',
        pais: '',
        estado: '',
        ciudad: '',
        telefono: ''
      },
      paises: [],
      estados: [],
      colonias: []
    }
  },
  watch: {
    direccionEditar: {
      handler(newVal) {
        if (newVal) {
          this.direccion = { ...newVal }
          // Si hay CP, carga estados y colonias automáticamente
          if (this.direccion.codigo_postal && this.direccion.codigo_postal.length === 5) {
            this.buscarCP();
          }
        }
      },
      immediate: true
    },
    'direccion.codigo_postal': {
      handler(newVal) {
        if (newVal && newVal.length === 5) {
          this.buscarCP();
        }
      }
    }
  },
  methods: {
    async obtenerCSRFToken() {
      try {
        await fetch('http://localhost:8000/sanctum/csrf-cookie', {
          method: 'GET',
          credentials: 'include'
        });
        
        // Obtener el token del cookie
        const cookies = document.cookie.split(';');
        const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
        
        if (csrfCookie) {
          return decodeURIComponent(csrfCookie.split('=')[1]);
        }
        
        return '';
      } catch (error) {
        console.error('Error al obtener CSRF token:', error);
        return '';
      }
    },
    async cargarPaises() {
      try {
        const response = await fetch('http://localhost:8000/carrito/paises')
        const data = await response.json()
        this.paises = data.paises || data
      } catch (error) {
        console.error('Error al cargar países:', error)
      }
    },
    async buscarCP() {
      if (this.direccion.codigo_postal && this.direccion.codigo_postal.length === 5) {
        try {
          // Cargar estados
          const responseEstados = await fetch(`http://localhost:8000/carrito/estados/${this.direccion.codigo_postal}`)
          const dataEstados = await responseEstados.json()
          this.estados = dataEstados.estado || [];
          
          // Auto-completar ciudad si solo hay un estado
          if (this.estados.length === 1) {
            this.direccion.estado = this.estados[0].codigo_estado;
            this.direccion.ciudad = this.estados[0].municipio || '';
          }
          
          // Cargar colonias
          const responseColonias = await fetch(`http://localhost:8000/carrito/colonias/${this.direccion.codigo_postal}`)
          const dataColonias = await responseColonias.json()
          this.colonias = dataColonias.colonias || [];
          
          // Auto-seleccionar colonia si solo hay una
          if (this.colonias.length === 1) {
            this.direccion.colonia = this.colonias[0];
          }
        } catch (error) {
          console.error('Error al buscar CP:', error)
        }
      }
    },
    async guardarDireccion() {
      try {
        const method = this.direccion.id ? 'POST' : 'POST';
        const url = this.direccion.id 
          ? `http://localhost:8000/carrito/direcciones/${this.direccion.id}`
          : 'http://localhost:8000/carrito/direcciones';
        
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };
        
        const response = await fetch(url, {
          method,
          headers,
          body: JSON.stringify(this.direccion)
        })

        const responseText = await response.text();
        console.log('Respuesta del backend:', responseText);

        if (response.ok) {
          const resultado = JSON.parse(responseText);
          this.$emit('guardado', resultado);
          alert('Dirección guardada correctamente');
          this.$emit('cerrar');
        } else {
          alert('Error al guardar dirección: ' + responseText);
        }
      } catch (error) {
        console.error('Error al guardar dirección:', error)
        alert('Error de red: ' + error.message);
      }
    },
    async eliminarDireccion(id) {
      try {
        const csrfToken = await this.obtenerCSRFToken();
        
        const headers = {
          'Accept': 'application/json'
        };
        
        if (csrfToken) {
          headers['X-CSRF-TOKEN'] = csrfToken;
        }

        const response = await fetch(`http://localhost:8000/carrito/direcciones/${id}`, {
          method: 'DELETE',
          headers,
          credentials: 'include'
        });

        if (response.ok) {
          this.$emit('eliminada', id);
          alert('Dirección eliminada correctamente');
        } else {
          const errorText = await response.text();
          alert('Error al eliminar dirección: ' + errorText);
        }
      } catch (error) {
        console.error('Error al eliminar dirección:', error);
        alert('Error de red: ' + error.message);
      }
    },
    async listarDirecciones() {
      try {
        const csrfToken = await this.obtenerCSRFToken();
        
        const headers = {
          'Accept': 'application/json'
        };
        
        if (csrfToken) {
          headers['X-CSRF-TOKEN'] = csrfToken;
        }

        const response = await fetch('http://localhost:8000/carrito/direcciones', {
          headers,
          credentials: 'include'
        });

        if (response.ok) {
          const direcciones = await response.json();
          this.$emit('listado', direcciones);
        } else {
          console.error('Error al listar direcciones');
        }
      } catch (error) {
        console.error('Error al listar direcciones:', error);
      }
    }
  },
  mounted() {
    this.cargarPaises()
  }
}
</script>

<style src="../assets/DireccionForm.css"></style>