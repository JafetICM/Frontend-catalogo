<template>
  <div class="facturas-container">
    <header class="facturas-header">
      <h1 class="titulo-principal">
        <i class="fas fa-file-invoice"></i>
        Mis Facturas
      </h1>
    </header>

    <!-- Controles de filtrado y búsqueda -->
    <div class="controles-facturas">
      <div class="filtros-superiores">
        <!-- Selector de año -->
        <div class="filtro-anio">
          <label for="anio">Año de actividad:</label>
          <select v-model="anioSeleccionado" @change="cargarFacturas">
            <option v-for="anio in anosDisponibles" :key="anio" :value="anio">
              {{ anio }}
            </option>
          </select>
        </div>

        <!-- Descarga de facturas por mes -->
        <div class="descarga-facturas">
          <label>Descargar Facturas y XML:</label>
          <select v-model="mesDescarga" class="select-mes">
            <option value="">Seleccionar mes</option>
            <option value="1">Enero</option>
            <option value="2">Febrero</option>
            <option value="3">Marzo</option>
            <option value="4">Abril</option>
            <option value="5">Mayo</option>
            <option value="6">Junio</option>
            <option value="7">Julio</option>
            <option value="8">Agosto</option>
            <option value="9">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
          <button @click="descargarFacturas" class="btn-descargar" :disabled="!mesDescarga">
            <i class="fas fa-download"></i>
          </button>
        </div>
      </div>

      <!-- Barra de búsqueda -->
      <div class="busqueda-facturas">
        <div class="search-input">
          <i class="fas fa-search"></i>
          <input 
            v-model="busqueda" 
            type="text" 
            placeholder="Buscar Factura / Fecha / Producto / N"
            @input="filtrarFacturas"
          />
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="botones-accion">
        <button class="btn-subir-pago">
          <i class="fas fa-upload"></i>
          ↑ Subir pago de facturas
        </button>
        <button class="btn-reporte" @click="generarReporteFacturas" :disabled="generandoReporte">
          <i class="fas fa-file-csv"></i>
          {{ generandoReporte ? 'Generando reporte...' : 'Reporte de facturas (CSV)' }}
        </button>
      </div>
    </div>

    <!-- Tabla de facturas -->
    <div class="tabla-facturas">
      <div v-if="loading" class="loading">
        <p>Cargando facturas...</p>
      </div>

      <div v-else-if="facturas.length === 0" class="no-facturas">
        <div class="no-facturas-content">
          <i class="fas fa-file-invoice"></i>
          <h3>No hay facturas disponibles</h3>
          <p>No se encontraron facturas para el año {{ anioSeleccionado }}</p>
        </div>
      </div>

      <table v-else class="facturas-table">
        <thead>
          <tr>
            <th>Factura</th>
            <th>Orden</th>
            <th>Producto</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>No. de Guía</th>
            <th>Estatus</th>
          </tr>
        </thead>
        <tbody>
                     <tr v-for="factura in facturasFiltradas" :key="factura.folio_factura" class="factura-row">
             <td class="factura-numero">
               <router-link :to="{ name: 'factura-detalle', params: { id: factura.folio_factura } }" class="folio-link">
                 {{ factura.folio_factura }}
               </router-link>
             </td>
             <td class="orden-numero">{{ factura.folio_pedido }}</td>
             <td class="producto-descripcion">{{ factura.texto }}</td>
             <td class="fecha">{{ formatearFecha(factura.fecha) }}</td>
             <td class="total">{{ formatearMoneda(factura.total) }}</td>
             <td class="guias">
               <a v-if="factura.entrega && factura.entrega.proceso_entrega && factura.entrega.proceso_entrega.length > 0" href="#" @click.prevent="verGuias(factura.folio_factura)">
                 Ver {{ factura.entrega.proceso_entrega.length }} guías
               </a>
               <span v-else>-</span>
             </td>
             <td class="estatus">
               <span :class="['estatus-badge', factura.estatus.toLowerCase()]">
                 <i v-if="factura.estatus === 'Activa'" class="fas fa-check"></i>
                 {{ factura.estatus }}
               </span>
             </td>
           </tr>
        </tbody>
      </table>
    </div>

         <!-- Paginación -->
     <div v-if="facturas.length > 0" class="paginacion">
       <div class="paginacion-info">
         Página {{ paginaActual }} de {{ paginas }} (Mostrando {{ mostrando }} de {{ totalFacturas }} facturas)
       </div>
      <div class="paginacion-controles">
        <button 
          @click="cambiarPagina(paginaActual - 1)" 
          :disabled="paginaActual <= 1"
          class="btn-pagina"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
                 <button 
           v-for="pagina in paginasVisibles" 
           :key="pagina"
           @click="cambiarPagina(pagina)"
           :class="['btn-pagina', { activa: pagina === paginaActual }]"
         >
           {{ pagina }}
         </button>
         
         <button 
           @click="cambiarPagina(paginaActual + 1)" 
           :disabled="paginaActual >= paginas"
           class="btn-pagina"
         >
           <i class="fas fa-chevron-right"></i>
         </button>
         
         <button 
           @click="cambiarPagina(paginas)"
           :disabled="paginaActual >= paginas"
           class="btn-pagina"
         >
           >> Última
         </button>
      </div>
    </div>

    <!-- Información de última actualización -->
    <div class="ultima-actualizacion">
      <p>
        Última actualización: {{ ultimaActualizacion }}
        <a href="#" @click.prevent="actualizarFacturas" class="link-actualizar">
          Haz click aquí para actualizar tu lista de facturas (Puede tardar unos minutos).
        </a>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FacturasComponent',
  data() {
    return {
      facturas: [],
      facturasFiltradas: [],
      loading: true,
      anioSeleccionado: new Date().getFullYear(),
      anosDisponibles: [2025, 2024, 2023, 2022, 2021],
      busqueda: '',
      mesDescarga: '',
             paginaActual: 1,
       itemsPorPagina: 10,
       totalFacturas: 0,
       paginas: 1,
       mostrando: 0,
      ultimaActualizacion: new Date().toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'America/Mexico_City'
      }),
      generandoReporte: false,
      busquedaTimeout: null
    }
  },
  computed: {
    totalPaginas() {
      return Math.ceil(this.facturasFiltradas.length / this.itemsPorPagina);
    },
         paginasVisibles() {
       const paginas = [];
       const inicio = Math.max(1, this.paginaActual - 2);
       const fin = Math.min(this.paginas, this.paginaActual + 2);
       
       for (let i = inicio; i <= fin; i++) {
         paginas.push(i);
       }
       return paginas;
     }
  },
  methods: {
         async cargarFacturas() {
       this.loading = true;
       try {
         const response = await fetch(`http://127.0.0.1:8000/facturas?anio=${this.anioSeleccionado}&pagina=${this.paginaActual}`);
         const data = await response.json();
         
         if (data.error) {
           console.error('Error al cargar facturas:', data.error);
           this.facturas = [];
         } else {
           // Manejar la estructura de respuesta con facturas y metadatos
           this.facturas = data.facturas || data || [];
           this.totalFacturas = data.total_facturas || this.facturas.length;
           this.paginas = data.paginas || 1;
           this.mostrando = data.mostrando || this.facturas.length;
         }
         
         // Solo aplicar filtros si no hay búsqueda activa
         if (!this.busqueda.trim()) {
           this.facturasFiltradas = this.facturas;
         } else {
           this.filtrarFacturas();
         }
       } catch (error) {
         console.error('Error al cargar facturas:', error);
         this.facturas = [];
       } finally {
         this.loading = false;
       }
     },
    
         filtrarFacturas() {
       if (!this.busqueda.trim()) {
         // Si no hay búsqueda, mostrar todas las facturas de la página actual
         this.facturasFiltradas = this.facturas;
       } else {
         // Si hay búsqueda, filtrar las facturas
         const busquedaLower = this.busqueda.toLowerCase();
         this.facturasFiltradas = this.facturas.filter(factura => 
           factura.folio_factura?.toLowerCase().includes(busquedaLower) ||
           factura.folio_pedido?.toLowerCase().includes(busquedaLower) ||
           factura.texto?.toLowerCase().includes(busquedaLower) ||
           factura.fecha?.includes(busquedaLower)
         );
       }
     },
    
         async cambiarPagina(pagina) {
       if (pagina >= 1 && pagina <= this.paginas && pagina !== this.paginaActual) {
         console.log(`Cambiando de página ${this.paginaActual} a página ${pagina}`);
         this.paginaActual = pagina;
         await this.cargarFacturas();
       }
     },
    
    formatearFecha(fecha) {
      if (!fecha) return '-';
      return new Date(fecha).toLocaleDateString('es-MX');
    },
    
    formatearMoneda(monto) {
      if (!monto) return '-';
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(monto);
    },
    
         async verFactura(id) {
       try {
         const encodedId = encodeURIComponent(id);
         const response = await fetch(`http://127.0.0.1:8000/facturas/${encodedId}`);
         const data = await response.json();
         
         if (data.error) {
           alert('Error al obtener la factura: ' + data.message);
         } else {
           // Mostrar los detalles de la factura
           console.log('Detalles de la factura:', data);
           alert(`Factura ${data.folio_factura || id}\nOrden: ${data.folio_pedido || 'N/A'}\nTotal: ${this.formatearMoneda(data.total || 0)}`);
         }
       } catch (error) {
         console.error('Error al obtener la factura:', error);
         alert('Error al cargar los detalles de la factura');
       }
     },
    
         async verGuias(id) {
       try {
         const encodedId = encodeURIComponent(id);
         const response = await fetch(`http://127.0.0.1:8000/facturas/${encodedId}`);
         const data = await response.json();
         
         if (data.error) {
           alert('Error al obtener las guías: ' + data.message);
         } else if (data.entrega && data.entrega.proceso_entrega) {
           const guias = data.entrega.proceso_entrega;
           let mensaje = `Guías de la factura ${data.folio_factura}:\n\n`;
           
           guias.forEach((guia, index) => {
             mensaje += `${index + 1}. Guía: ${guia.guias}\n`;
             mensaje += `   Fletera: ${guia.fletera}\n`;
             mensaje += `   Estado: ${guia.estado}\n`;
             mensaje += `   Fecha: ${guia.fecha}\n\n`;
           });
           
           alert(mensaje);
         } else {
           alert('No hay guías disponibles para esta factura');
         }
       } catch (error) {
         console.error('Error al obtener las guías:', error);
         alert('Error al cargar las guías de la factura');
       }
     },
    
    async descargarFacturas() {
      if (!this.mesDescarga) {
        alert('Por favor selecciona un mes para descargar');
        return;
      }
      
      try {
        // Obtener el nombre del mes para mostrar en el mensaje
        const meses = {
          '1': 'Enero', '2': 'Febrero', '3': 'Marzo', '4': 'Abril',
          '5': 'Mayo', '6': 'Junio', '7': 'Julio', '8': 'Agosto',
          '9': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
        };
        
        const nombreMes = meses[this.mesDescarga];
        console.log(`Descargando facturas de ${nombreMes} ${this.anioSeleccionado}...`);
        
        // Preparar los datos para la descarga
        const datos = {
          mes: this.mesDescarga,
          anio: this.anioSeleccionado
        };

        const response = await fetch('http://127.0.0.1:8000/facturas/descargar-mes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(datos)
        });

        if (response.ok) {
          // Crear un blob del archivo CSV
          const blob = await response.blob();
          
          // Crear URL para descarga
          const url = window.URL.createObjectURL(blob);
          
          // Crear elemento de descarga
          const a = document.createElement('a');
          a.href = url;
          a.download = `facturas_${nombreMes}_${this.anioSeleccionado}_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          
          // Limpiar
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          alert(`✅ Facturas de ${nombreMes} ${this.anioSeleccionado} descargadas exitosamente`);
        } else {
          let errorMessage = 'Error desconocido';
          try {
            const error = await response.json();
            errorMessage = error.message || error.error || 'Error desconocido';
          } catch (parseError) {
            errorMessage = `Error del servidor: ${response.status}`;
          }
          
          if (response.status === 404) {
            alert(`ℹ️ No hay facturas disponibles para ${nombreMes} ${this.anioSeleccionado}`);
          } else {
            alert(`❌ Error al descargar las facturas: ${errorMessage}`);
          }
        }
      } catch (error) {
        console.error('Error al descargar facturas:', error);
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          alert('❌ Error de conexión: No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
        } else {
          alert('❌ Error al descargar las facturas: ' + error.message);
        }
      }
    },
    
    actualizarFacturas() {
      this.ultimaActualizacion = new Date().toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'America/Mexico_City'
      });
      this.cargarFacturas();
    },

    async generarReporteFacturas() {
      this.generandoReporte = true;
      try {
        // Mostrar mensaje de inicio
        console.log('Iniciando generación de reporte completo...');
        alert('🔄 Generando reporte completo de facturas...\n\nEsto puede tomar unos segundos mientras se obtienen todas las facturas');
        
        // Primero verificar que el servidor esté funcionando
        const testResponse = await fetch('http://127.0.0.1:8000/test-server');
        if (!testResponse.ok) {
          throw new Error('El servidor no está respondiendo correctamente');
        }
        
        // Preparar los filtros para el reporte completo
        const filtros = {
          anio: this.anioSeleccionado,
          busqueda: this.busqueda
          // No especificamos página para obtener todas las facturas
        };

        console.log('Enviando solicitud de reporte con filtros:', filtros);

        const response = await fetch('http://127.0.0.1:8000/facturas/reporte', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(filtros)
        });

        if (response.ok) {
          // Crear un blob del archivo CSV
          const blob = await response.blob();
          
          // Crear URL para descarga
          const url = window.URL.createObjectURL(blob);
          
          // Crear elemento de descarga
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte_facturas_${this.anioSeleccionado}_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          
          // Limpiar
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          console.log('Reporte completo generado exitosamente');
          alert('✅ Reporte de facturas generado exitosamente\n\nEl archivo CSV contiene TODAS las facturas del año ' + this.anioSeleccionado + ' y se ha descargado automáticamente.');
        } else {
          // Manejar error sin leer el stream dos veces
          let errorMessage = `Error del servidor: ${response.status}`;
          
          // Verificar el tipo de contenido
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            try {
              const error = await response.json();
              errorMessage = error.message || error.error || errorMessage;
            } catch (parseError) {
              errorMessage += ' - Error al parsear respuesta JSON';
            }
          } else {
            errorMessage += ' - Respuesta no válida del servidor';
          }
          
          alert('❌ Error al generar el reporte: ' + errorMessage);
        }
      } catch (error) {
        console.error('Error al generar reporte:', error);
        
        // Manejar diferentes tipos de errores
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          alert('❌ Error de conexión: No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
        } else if (error.name === 'TypeError' && error.message.includes('body stream already read')) {
          alert('❌ Error interno: Problema con la respuesta del servidor. Intenta nuevamente.');
        } else {
          alert('❌ Error al generar el reporte de facturas: ' + error.message);
        }
      } finally {
        this.generandoReporte = false;
      }
    }
  },
  
  watch: {
    busqueda: {
      handler(newVal, oldVal) {
        // Si la búsqueda cambia, resetear a página 1 y aplicar filtros
        if (newVal !== oldVal) {
          this.paginaActual = 1;
          // Usar debounce para evitar demasiadas llamadas
          clearTimeout(this.busquedaTimeout);
          this.busquedaTimeout = setTimeout(() => {
            this.filtrarFacturas();
          }, 300);
        }
      },
      immediate: false
    }
  },
  
  mounted() {
    this.cargarFacturas();
  },
  
  beforeUnmount() {
    // Limpiar timeout al destruir el componente
    if (this.busquedaTimeout) {
      clearTimeout(this.busquedaTimeout);
    }
  }
}
</script>

<style src="../assets/Facturas.css"></style>