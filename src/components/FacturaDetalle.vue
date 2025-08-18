<template>
  <div class="factura-detalle-container">
    <header class="factura-detalle-header">
      <div class="header-actions">
        <button @click="$router.go(-1)" class="btn-volver">
          <i class="fas fa-arrow-left"></i>
          Volver a Mis Facturas
        </button>
      </div>
      <h1 class="titulo-principal">
        <i class="fas fa-file-invoice"></i>
        Detalles de Factura
      </h1>
    </header>

    <div v-if="loading" class="loading">
      <p>Cargando detalles de la factura...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="factura" class="factura-content">
      <!-- Header de la factura -->
      <div class="factura-header">
        <div class="factura-info-principal">
          <div class="folio-section">
            <h2>Folio No.: {{ factura.folio_factura }}</h2>
            <div class="estatus-badge activa">
              <i class="fas fa-check"></i>
              {{ factura.estatus }}
            </div>
            <div v-if="factura.fiscal" class="estatus-fiscal">
              <i class="fas fa-file-invoice-dollar"></i>
              {{ factura.fiscal }}
            </div>
          </div>
          <div class="orden-info">
            <strong>Orden:</strong> {{ factura.folio_pedido }}
          </div>
          <div v-if="factura.uuid" class="uuid-info">
            <strong>UUID:</strong> {{ factura.uuid }}
          </div>
        </div>
        <div class="factura-actions">
          
        </div>
      </div>

      <!-- Información de factura y envío -->
      <div class="factura-info-grid">
        <div class="info-section">
          <h3>Información de Factura</h3>
          <div class="info-item">
            <span class="label">Fecha:</span>
            <span class="value">{{ formatearFecha(factura.fecha) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Forma de Pago:</span>
            <span class="value">{{ factura.metodo_txt || factura.forma_pago || 'Transferencia' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Método de Pago:</span>
            <span class="value">{{ factura.metodo_pago || '03' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Moneda:</span>
            <span class="value">{{ factura.moneda || 'MXN' }}</span>
          </div>
          <div class="info-item">
            <span class="label">IVA (%):</span>
            <span class="value">{{ factura.iva_porcent || '16' }}%</span>
          </div>
          <div class="info-item">
            <span class="label">Monto Total de Factura:</span>
            <span class="value total-amount">{{ formatearMoneda(factura.total) }}</span>
          </div>
        </div>

        <div class="info-section">
          <h3>Información de Envío</h3>
          <div class="info-item">
            <span class="label">Atención a:</span>
            <span class="value">{{ factura.atencion_a || factura.direccion?.atencion_a || 'SOPORTE' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Calle:</span>
            <span class="value">{{ factura.calle_emb || factura.direccion?.calle || '20J' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Número Exterior:</span>
            <span class="value">{{ factura.no_ext_emb || factura.direccion?.num_ext || '139' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Número Interior:</span>
            <span class="value">{{ factura.no_int_emb || factura.direccion?.num_int || '' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Colonia:</span>
            <span class="value">{{ factura.colonia_emb || factura.direccion?.colonia || 'JARDINES DEL NORTE' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Código Postal:</span>
            <span class="value">{{ factura.cp_emb || factura.direccion?.codigo_postal || '97139' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Ciudad:</span>
            <span class="value">{{ factura.ciudad_emb || factura.direccion?.ciudad || 'MERIDA' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Estado:</span>
            <span class="value">{{ factura.estado_emb || factura.direccion?.estado || 'YUCATÁN' }}</span>
          </div>
          <div class="info-item">
            <span class="label">País:</span>
            <span class="value">{{ factura.pais_emb || factura.direccion?.pais || 'Mexico' }}</span>
          </div>
        </div>
      </div>

      <!-- Información de Guías -->
      <div v-if="factura.guias && factura.guias.length > 0" class="guias-section">
        <h3>Información de Guías</h3>
        <div v-for="(guia, index) in factura.guias" :key="index" class="guia-item">
          <div class="guia-header">
            <strong>Guía {{ index + 1 }}:</strong> {{ guia.guia }}
          </div>
          <div class="guia-details">
            <div class="guia-detail-item estatus">
              <span class="label">Estatus:</span>
              <span class="value">{{ guia.estatus }}</span>
            </div>
            <div class="guia-detail-item">
              <span class="label">Envío:</span>
              <span class="value">{{ guia.envio }}</span>
            </div>
            <div class="guia-detail-item fletera">
              <span class="label">Fletera:</span>
              <span class="value">{{ guia.fletera }}</span>
            </div>
            <div class="guia-detail-item factura">
              <span class="label">Factura:</span>
              <span class="value">{{ guia.factura }}</span>
            </div>
            <div class="guia-detail-item">
              <span class="label">Firma:</span>
              <span class="value">{{ guia.firma }}</span>
            </div>
            <div class="guia-detail-item">
              <span class="label">ID Fletera:</span>
              <span class="value">{{ guia.id_fletera }}</span>
            </div>
            <div class="guia-detail-item">
              <span class="label">Fecha Guía:</span>
              <span class="value">{{ guia.fecha_guia === '0' ? 'No disponible' : guia.fecha_guia }}</span>
            </div>
            <div class="guia-detail-item estado">
              <span class="label">Estado:</span>
              <span class="value">{{ guia.estado }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón de monitoreo -->
      <div class="monitoreo-section">
        <button class="btn-monitoreo">
          <i class="fas fa-truck"></i>
          Monitorea el trayecto de tu paquete
        </button>
      </div>

      <!-- Estado de los paquetes -->
      <div v-if="factura.entrega && factura.entrega.proceso_entrega" class="estado-paquetes">
        <h3>Estado de los paquetes</h3>
        <div v-for="(entrega, index) in factura.entrega.proceso_entrega" :key="index" class="paquete-item">
          <div class="paquete-header">
            <div class="guia-info">
              <strong>Guía:</strong> {{ entrega.guias }}
            </div>
            <div class="fletera-info">
              <strong>Fletera:</strong> {{ entrega.fletera }}
            </div>
            <div class="estado-info">
              <strong>Estado:</strong> 
              <span class="estado-badge entregado">{{ entrega.estado }}</span>
            </div>
          </div>

          <!-- Barra de progreso -->
          <div class="progress-bar">
            <div class="progress-step completed">
              <i class="fas fa-check"></i>
              <span>Pedido Confirmado</span>
            </div>
            <div class="progress-step completed">
              <i class="fas fa-check"></i>
              <span>Recolectando</span>
            </div>
            <div class="progress-step completed">
              <i class="fas fa-check"></i>
              <span>Listo para Enviar</span>
            </div>
            <div class="progress-step completed">
              <i class="fas fa-check"></i>
              <span>En Manos del Transportista</span>
            </div>
            <div class="progress-step completed">
              <i class="fas fa-check"></i>
              <span>En Ruta de Entrega</span>
            </div>
            <div class="progress-step completed">
              <i class="fas fa-check"></i>
              <span>Pedido Entregado</span>
            </div>
          </div>

          <!-- Detalles de envío -->
          <div class="envio-detalles">
            <div class="detalle-item">
              <span class="label">Folio de envío:</span>
              <span class="value">{{ factura.folio_pedido }}-46</span>
            </div>
            <div class="detalle-item">
              <span class="label">Fecha entregado:</span>
              <span class="value">{{ formatearFechaEntrega(obtenerFechaEntrega(entrega)) }}</span>
            </div>
            <div class="detalle-item">
              <span class="label">Almacén:</span>
              <span class="value">SYSCOM VERACRUZ</span>
            </div>
            <div class="detalle-item">
              <span class="label">Tipo envío:</span>
              <span class="value">Sucursal</span>
            </div>
          </div>

          <!-- Productos -->
          <div class="productos-envio">
            <strong>Productos:</strong>
            <span>{{ obtenerCodigosProductos() }}</span>
          </div>

          <!-- Historial de envío -->
          <div class="historial-envio">
            <h4>ENVÍO DEMORADO</h4>
            <div class="historial-item">
              <div class="historial-fecha">31 07 2025 10:56</div>
              <div class="historial-mensaje">Recibida En Sucursal destino - Tixcacal, Yucatan, Mexico</div>
            </div>
            <div class="historial-item">
              <div class="historial-fecha">01 08 2025 12:29</div>
              <div class="historial-mensaje">Mercancia Entregada A Domicilio, recibió marcelino - Tixcacal, Yucatan, Mexico</div>
            </div>
            <a href="#" class="link-historial">Historial</a>
          </div>
        </div>
      </div>

      <!-- Ejecutivo de Ventas -->
      <div class="ejecutivo-section">
        <h3>Ejecutivo de Ventas</h3>
        <div class="ejecutivo-info">
          <div class="ejecutivo-nombre">{{ factura.nom_vendedor || 'Claudia Iby Domínguez Flores' }}</div>
          <div class="ejecutivo-email">{{ factura.mail_vendedor || 'idominguez@syscom.mx' }}</div>
          <div class="ejecutivo-extension">Extensión: {{ factura.ext_vendedor || '7056' }}</div>
        </div>
      </div>

      <!-- Tabla de productos -->
      <div class="productos-section">
        <h3>Productos</h3>
        <table class="productos-table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Descuentos</th>
              <th>Precio Lista</th>
              <th>Precio Unitario</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="producto in factura.productos" :key="producto.producto_id || producto.id">
              <td class="producto-foto">
                <img v-if="producto.imagen" :src="producto.imagen" :alt="producto.titulo || producto.nombre" />
                <div v-else class="placeholder-foto">
                  <i class="fas fa-image"></i>
                </div>
              </td>
              <td class="producto-info">
                <div class="producto-codigo">{{ producto.cod_art || producto.codigo }}</div>
                <div class="producto-nombre">{{ producto.titulo || producto.nombre }}</div>
                <div class="producto-marca">{{ producto.marca }}</div>
              </td>
              <td class="producto-cantidad">{{ producto.cantidad }}</td>
              <td class="producto-descuentos">
                <div v-if="producto.descuento_cliente" class="descuento-item">
                  <span class="descuento-label">Cliente:</span> -{{ producto.descuento_cliente }}%
                </div>
                <div v-if="producto.descuento_clasificacion" class="descuento-item">
                  <span class="descuento-label">Clasificación:</span> -{{ producto.descuento_clasificacion }}%
                </div>
                <div v-if="producto.descuento_financiero" class="descuento-item">
                  <span class="descuento-label">Financiero:</span> -{{ producto.descuento_financiero }}%
                </div>
                <div v-if="producto.descuento_volumen" class="descuento-item">
                  <span class="descuento-label">Volumen:</span> -{{ producto.descuento_volumen }}%
                </div>
              </td>
              <td class="producto-precio-lista">{{ formatearMoneda(producto.precio_lista || producto.precio_oferta) }}</td>
              <td class="producto-precio">{{ formatearMoneda(producto.precio_unitario || producto.precio) }}</td>
              <td class="producto-importe">{{ formatearMoneda(producto.importe) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Resumen de la factura -->
      <div class="resumen-factura">
        <div class="resumen-item">
          <span class="label">Subtotal:</span>
          <span class="value">{{ formatearMoneda(factura.sub_total || factura.subtotal) }}</span>
        </div>
        <div class="resumen-item">
          <span class="label">Envío:</span>
          <span class="value">{{ formatearMoneda(factura.envio || 0) }}</span>
        </div>
        <div class="resumen-item">
          <span class="label">I.V.A. ({{ factura.iva_porcent || '16' }}%):</span>
          <span class="value">{{ formatearMoneda(factura.iva) }}</span>
        </div>
        <div class="resumen-item total">
          <span class="label">Total:</span>
          <span class="value">{{ formatearMoneda(factura.total) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FacturaDetalleComponent',
  data() {
    return {
      factura: null,
      loading: true,
      error: null,
      generandoPDF: false,
      generandoCotizacion: false
    }
  },
  methods: {
    async cargarFactura() {
      this.loading = true;
      this.error = null;
      
      try {
        const folio = this.$route.params.id;
        // El folio ya viene codificado desde el router, no necesitamos codificarlo de nuevo
        const response = await fetch(`https://backend-laravel-o66e6.ondigitalocean.app/facturas/${folio}`);
        const data = await response.json();
        
        if (data.error) {
          this.error = data.message || 'Error al cargar la factura';
        } else {
          this.factura = data;
        }
      } catch (error) {
        console.error('Error al cargar la factura:', error);
        this.error = 'Error al cargar los detalles de la factura';
      } finally {
        this.loading = false;
      }
    },
    
    formatearFecha(fecha) {
      if (!fecha) return '-';
      return new Date(fecha).toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    
    formatearFechaEntrega(fecha) {
      if (!fecha || fecha === '0' || fecha === '') return 'No disponible';
      
      try {
        // Intentar parsear la fecha
        const fechaObj = new Date(fecha);
        
        // Verificar si la fecha es válida
        if (isNaN(fechaObj.getTime())) {
          return 'No disponible';
        }
        
        return fechaObj.toLocaleString('es-MX', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        console.error('Error al formatear fecha de entrega:', error);
        return 'No disponible';
      }
    },
    
    formatearMoneda(monto) {
      if (!monto) return '-';
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(monto);
    },
    
    obtenerGuias() {
      if (!this.factura.entrega || !this.factura.entrega.proceso_entrega) {
        return 'No disponible';
      }
      
      return this.factura.entrega.proceso_entrega
        .map(entrega => `${entrega.guias} - Crédito - ${entrega.fletera}`)
        .join(', ');
    },
    
    formatearCiudad() {
      const estado = this.factura.direccion?.estado || 'YUCATÁN';
      const ciudad = this.factura.direccion?.ciudad || 'MERIDA';
      return `${ciudad}, ${estado}`;
    },
    
    obtenerCodigosProductos() {
      if (!this.factura.productos) return 'No disponible';
      return this.factura.productos.map(p => p.codigo).join(', ');
    },
    
    obtenerFechaEntrega(entrega) {
      // Buscar la fecha de entrega en diferentes campos posibles
      const posiblesFechas = [
        entrega.fecha,
        entrega.fecha_entrega,
        entrega.fecha_entregado,
        entrega.fecha_entrega_real,
        entrega.fecha_finalizacion
      ];
      
      for (const fecha of posiblesFechas) {
        if (fecha && fecha !== '0' && fecha !== '') {
          return fecha;
        }
      }
      
      return null;
    },

    async imprimirFactura() {
      this.generandoPDF = true;
      try {
        const folio = this.$route.params.id;
        
        const response = await fetch(`https://backend-laravel-o66e6.ondigitalocean.app/facturas/${folio}/pdf`);
        
        if (response.ok) {
          // Obtener el tipo de contenido
          const contentType = response.headers.get('content-type');
          
          // Determinar la extensión del archivo
          let extension = 'pdf';
          let message = 'PDF de factura generado exitosamente';
          
          if (contentType && contentType.includes('text/html')) {
            extension = 'html';
            message = 'HTML de factura generado exitosamente (se abrirá en el navegador)';
          }
          
          // Crear un blob del archivo
          const blob = await response.blob();
          
          if (contentType && contentType.includes('text/html')) {
            // Para HTML, abrir en nueva pestaña
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            window.URL.revokeObjectURL(url);
          } else {
            // Para PDF, descargar
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `factura_${folio}_${new Date().toISOString().split('T')[0]}.${extension}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }
          
          alert(message);
        } else {
          let errorMessage = 'Error desconocido';
          try {
            const error = await response.json();
            errorMessage = error.message || error.error || 'Error desconocido';
          } catch (parseError) {
            errorMessage = `Error del servidor: ${response.status}`;
          }
          alert('Error al generar el documento: ' + errorMessage);
        }
      } catch (error) {
        console.error('Error al generar documento:', error);
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          alert('Error de conexión: No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
        } else {
          alert('Error al generar el documento de la factura: ' + error.message);
        }
      } finally {
        this.generandoPDF = false;
      }
    },

    prepararDireccion(direccionOriginal) {
      console.log('Preparando dirección:', direccionOriginal);
      
      // Si no hay dirección, usar los campos individuales de la factura
      if (!direccionOriginal) {
        console.log('No hay objeto dirección, usando campos individuales de la factura');
        return {
          atencion_a: this.factura.atencion_a || 'SOPORTE',
          calle: this.factura.calle_emb || '20J',
          num_ext: this.factura.no_ext_emb || '139',
          num_int: this.factura.no_int_emb || '',
          colonia: this.factura.colonia_emb || 'JARDINES DEL NORTE',
          codigo_postal: this.factura.cp_emb || '97139',
          ciudad: this.factura.ciudad_emb || 'MERIDA',
          estado: this.factura.estado_emb || 'YUCATÁN',
          pais: this.factura.pais_emb || 'MEX',
          telefono: ''
        };
      }

      // Usar los datos exactos que se muestran en el template
      const direccion = {
        atencion_a: direccionOriginal.atencion_a || this.factura.atencion_a || 'SOPORTE',
        calle: direccionOriginal.calle || this.factura.calle_emb || '20J',
        num_ext: direccionOriginal.num_ext || this.factura.no_ext_emb || '139',
        num_int: direccionOriginal.num_int || this.factura.no_int_emb || '',
        colonia: direccionOriginal.colonia || this.factura.colonia_emb || 'JARDINES DEL NORTE',
        codigo_postal: direccionOriginal.codigo_postal || this.factura.cp_emb || '97139',
        ciudad: direccionOriginal.ciudad || this.factura.ciudad_emb || 'MERIDA',
        estado: direccionOriginal.estado || this.factura.estado_emb || 'YUCATÁN',
        pais: direccionOriginal.pais || this.factura.pais_emb || 'MEX',
        telefono: direccionOriginal.telefono || ''
      };

      console.log('Dirección preparada:', direccion);
      return direccion;
    },

    obtenerFletera() {
      if (!this.factura.entrega || !this.factura.entrega.proceso_entrega) {
        return 'No disponible';
      }
      
      const fleteras = this.factura.entrega.proceso_entrega
        .map(entrega => entrega.fletera)
        .filter((fletera, index, arr) => arr.indexOf(fletera) === index); // Eliminar duplicados
      
      return fleteras.join(', ');
    },

    obtenerEstadoEnvio() {
      if (!this.factura.entrega || !this.factura.entrega.proceso_entrega) {
        return 'En proceso';
      }
      
      const estados = this.factura.entrega.proceso_entrega
        .map(entrega => entrega.estado)
        .filter((estado, index, arr) => arr.indexOf(estado) === index); // Eliminar duplicados
      
      return estados.join(', ');
    },

    async generarCotizacionExcel() {
      this.generandoCotizacion = true;
      try {
        // Validar que la factura tenga productos
        if (!this.factura.productos || this.factura.productos.length === 0) {
          alert('❌ Esta factura no tiene productos para generar la cotización.');
          console.log('Factura sin productos:', this.factura);
          return;
        }

        // Mostrar información de debug
        console.log('Estructura de la factura:', Object.keys(this.factura));
        console.log('Número de productos:', this.factura.productos.length);
        
        // Verificar si los productos tienen la estructura esperada
        if (this.factura.productos.length > 0) {
          console.log('Estructura del primer producto:', Object.keys(this.factura.productos[0]));
          console.log('Primer producto completo:', this.factura.productos[0]);
          
          // Verificar campos específicos
          const primerProducto = this.factura.productos[0];
          console.log('Campos específicos del primer producto:');
          console.log('- codigo:', primerProducto.codigo);
          console.log('- id:', primerProducto.id);
          console.log('- producto_id:', primerProducto.producto_id);
          console.log('- nombre:', primerProducto.nombre);
          console.log('- descripcion:', primerProducto.descripcion);
          console.log('- titulo:', primerProducto.titulo);
          console.log('- cantidad:', primerProducto.cantidad);
          console.log('- precio_unitario:', primerProducto.precio_unitario);
          console.log('- precio:', primerProducto.precio);
          console.log('- imagen:', primerProducto.imagen);
          console.log('- img_portada:', primerProducto.img_portada);
          console.log('- marca:', primerProducto.marca);
          console.log('- modelo:', primerProducto.modelo);
          
          // Verificar si el producto tiene algún campo de ID
          const tieneId = primerProducto.codigo || primerProducto.id || primerProducto.producto_id;
          console.log('¿Tiene algún campo de ID?:', !!tieneId);
          console.log('Valor del ID encontrado:', tieneId);
          
          // Si no tiene ID, mostrar advertencia
          if (!tieneId) {
            console.warn('⚠️ El primer producto no tiene ningún campo de ID válido');
            alert('⚠️ Advertencia: Los productos de esta factura no tienen códigos de identificación. Se usarán códigos temporales.');
          }
          
          // Continuar con la generación
          console.log('Continuando con la generación de la cotización...');
          
          const folio = this.$route.params.id;
          
          // Preparar los datos de la factura para la cotización
          const cotizacionData = {
            folio_factura: this.factura.folio_factura,
            fecha: this.factura.fecha,
            // No enviar direccion como objeto, enviar campos individuales
            productos: this.factura.productos ? this.factura.productos.map(producto => {
              console.log('Producto original:', producto);
              return {
                id: producto.cod_art || producto.codigo || producto.id || producto.producto_id || 'N/A',
                descripcion: producto.titulo || producto.nombre || producto.descripcion || 'Sin descripción',
                marca: producto.marca || '',
                modelo: producto.modelo || '',
                imagen: producto.imagen || producto.img_portada || '',
                cantidad: parseInt(producto.cantidad) || 1,
                precio_unitario: parseFloat(producto.precio_unitario) || parseFloat(producto.precio) || 0,
                precio_lista: parseFloat(producto.precio_lista) || parseFloat(producto.precio_oferta) || 0
              };
            }) : [],
            subtotal: parseFloat(this.factura.sub_total || this.factura.subtotal) || 0,
            iva: parseFloat(this.factura.iva) || 0,
            total: parseFloat(this.factura.total) || 0,
            estatus: this.factura.estatus,
            folio_pedido: this.factura.folio_pedido,
            forma_pago: this.factura.forma_pago || 'Transferencia',
            guias: this.factura.guias || [],
            fletera: this.obtenerFletera(),
            estado_envio: this.obtenerEstadoEnvio(),
            ejecutivo_nombre: 'Claudia Iby Domínguez Flores',
            ejecutivo_email: 'idominguez@syscom.mx',
            ejecutivo_extension: '7056',
            // Campos adicionales de la factura
            uuid: this.factura.uuid,
            fiscal: this.factura.fiscal,
            metodo_pago: this.factura.metodo_pago,
            metodo_txt: this.factura.metodo_txt,
            moneda: this.factura.moneda,
            iva_porcent: this.factura.iva_porcent,
            envio: this.factura.envio,
            // Campos de dirección individuales
            atencion_a: this.factura.atencion_a,
            calle_emb: this.factura.calle_emb,
            no_ext_emb: this.factura.no_ext_emb,
            no_int_emb: this.factura.no_int_emb,
            colonia_emb: this.factura.colonia_emb,
            cp_emb: this.factura.cp_emb,
            ciudad_emb: this.factura.ciudad_emb,
            estado_emb: this.factura.estado_emb,
            pais_emb: this.factura.pais_emb,
            // Campos del ejecutivo
            nom_vendedor: this.factura.nom_vendedor,
            mail_vendedor: this.factura.mail_vendedor,
            ext_vendedor: this.factura.ext_vendedor,
            // Agregar tipo de cambio (por defecto 18.50 si no está disponible)
            tipo_cambio: 18.50
          };

          console.log('Datos de factura originales:', this.factura);
          console.log('Datos de productos originales:', this.factura.productos);
          console.log('Datos de dirección originales:', this.factura.direccion);
          console.log('Estructura de dirección:', Object.keys(this.factura.direccion || {}));
          
          // Verificar campos específicos de dirección
          if (this.factura.direccion) {
            console.log('Campos específicos de dirección:');
            console.log('- atencion_a:', this.factura.direccion.atencion_a);
            console.log('- calle:', this.factura.direccion.calle);
            console.log('- colonia:', this.factura.direccion.colonia);
            console.log('- codigo_postal:', this.factura.direccion.codigo_postal);
            console.log('- ciudad:', this.factura.direccion.ciudad);
            console.log('- estado:', this.factura.direccion.estado);
            console.log('- pais:', this.factura.direccion.pais);
            console.log('- telefono:', this.factura.direccion.telefono);
          } else {
            console.log('⚠️ No hay datos de dirección en la factura');
            console.log('Estructura completa de la factura:', this.factura);
            console.log('Claves disponibles en la factura:', Object.keys(this.factura));
          }
          console.log('Datos de cotización preparados:', cotizacionData);
          console.log('Datos de dirección enviados:', {
            atencion_a: cotizacionData.atencion_a,
            calle_emb: cotizacionData.calle_emb,
            no_ext_emb: cotizacionData.no_ext_emb,
            no_int_emb: cotizacionData.no_int_emb,
            colonia_emb: cotizacionData.colonia_emb,
            cp_emb: cotizacionData.cp_emb,
            ciudad_emb: cotizacionData.ciudad_emb,
            estado_emb: cotizacionData.estado_emb,
            pais_emb: cotizacionData.pais_emb
          });
          
          // Validar que los productos tengan datos mínimos
          if (cotizacionData.productos.length > 0) {
            console.log('Primer producto mapeado:', cotizacionData.productos[0]);
          }

          const response = await fetch(`https://backend-laravel-o66e6.ondigitalocean.app/facturas/${folio}/cotizacion-excel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(cotizacionData)
          });

          if (response.ok) {
            const resultado = await response.json();
            const link = document.createElement('a');
            link.href = resultado.url;
            link.download = resultado.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert('✅ Cotización Excel de factura generada exitosamente: ' + resultado.filename);
          } else {
            let errorMessage = 'Error del servidor';
            try {
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                const error = await response.json();
                errorMessage = error.message || error.error || errorMessage;
              } else {
                errorMessage = 'Error del servidor. Verifica que el backend esté ejecutándose correctamente.';
              }
            } catch (parseError) {
              errorMessage = 'Error al procesar la respuesta del servidor';
            }
            alert('❌ Error al generar la cotización Excel: ' + errorMessage);
          }
        }
      } catch (error) {
        console.error('Error al generar cotización Excel:', error);
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          alert('❌ Error de conexión: No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en https://backend-laravel-o66e6.ondigitalocean.app');
        } else if (error.name === 'TypeError' && error.message.includes('Unexpected token')) {
          alert('❌ Error del servidor: El servidor devolvió HTML en lugar de JSON. Verifica que el backend esté funcionando correctamente.');
        } else {
          alert('❌ Error al generar la cotización Excel: ' + error.message);
        }
      } finally {
        this.generandoCotizacion = false;
      }
    }
  },
  
  mounted() {
    this.cargarFactura();
  },
  
  watch: {
    '$route.params.id'() {
      this.cargarFactura();
    }
  }
}
</script>

<style src="../assets/FacturaDetalle.css"></style>