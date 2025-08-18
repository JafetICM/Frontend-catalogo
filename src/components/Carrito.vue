<template>
  <!--frontend-vue/src/components\Carrito.vue -->
  <div class="carrito-container">
    <header class="carrito-header">
      <h1 class="titulo-principal">
        <i class="fas fa-shopping-cart"></i>
        Carrito de Compras
      </h1>
      <div v-if="carrito.length > 0" class="items-count">
        {{ carrito.length }} {{ carrito.length === 1 ? 'producto' : 'productos' }}
      </div>
    </header>

    <!-- Carrito vacío -->
    <div v-if="carrito.length === 0" class="carrito-vacio">
      <div class="vacio-content">
        <div class="vacio-icono">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <h2>Tu carrito está vacío</h2>
        <p>¡Descubre nuestros productos y encuentra lo que necesitas!</p>
        <button @click="navegarACatalogo" class="btn-catalogo">
          <i class="fas fa-store"></i>
          Explorar Catálogo
        </button>
      </div>
    </div>

    <!-- Productos en el carrito -->
    <div v-else class="carrito-layout">
      <!-- Contenedor principal dividido en dos columnas -->
      <div class="carrito-main">
        <!-- Columna izquierda: Resumen de compra -->
        <div class="resumen-column">
          <div class="resumen-compra">
            <div class="resumen-header">
              <h3>Resumen</h3>
              <div class="numero-pedido">{{ numeroPedido }}</div>
              <div class="resumen-controls">
                <div class="moneda-selector">
                  <button 
                    @click="cambiarMoneda('USD')" 
                    :class="['moneda-btn', { active: monedaSeleccionada === 'USD' }]"
                  >
                    USD
                  </button>
                  <button 
                    @click="cambiarMoneda('MXN')" 
                    :class="['moneda-btn', { active: monedaSeleccionada === 'MXN' }]"
                  >
                    MXN
                  </button>
                </div>
                <button @click="actualizarResumen" class="btn-actualizar-resumen" :disabled="!puedeActualizarResumen">
                  <i class="fas fa-sync-alt"></i>
                  Actualizar
                </button>
              </div>
            </div>
        
            <div class="tipo-cambio">
              <span>Tipo de Cambio:</span>
              <span>${{ tipoCambio }} MXN/USD</span>
              <div class="tipo-cambio-info">
              </div>
            </div>
            
            <div class="peso-total">
              <span>Peso Total:</span>
              <span>{{ pesoTotal }} Kg.</span>
            </div>

            <div class="resumen-detalles">
              <div class="linea-resumen">
                <span>Subtotal:</span>
                <span>{{ formatearMoneda(subtotal) }}</span>
              </div>

              <div v-if="metodoPagoSeleccionado && metodoPagoSeleccionado.descuento > 0" class="linea-resumen descuento">
                <span>Descuento ({{ metodoPagoSeleccionado.descuento }}%):</span>
                <span>-{{ formatearMoneda(descuentoAplicado) }}</span>
              </div>

              <div class="linea-resumen">
                <span>Envío:</span>
                <span>{{ formatearMoneda(costoEnvio) }}</span>
              </div>

              <div class="linea-resumen">
                <span>IVA 16%:</span>
                <span>{{ formatearMoneda(iva) }}</span>
              </div>

              <div class="linea-resumen total">
                <span>TOTAL:</span>
                <span>{{ formatearMoneda(total) }}</span>
              </div>
            </div>
              </div>
            </div>
            
        <!-- Columna derecha: Tabla de productos -->
        <div class="productos-column">
          <div class="productos-tabla">
            <table>
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Producto</th>
                  <th>Precio Lista</th>
                  <th>Precio Unitario</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(producto, index) in carrito" :key="producto.producto_id">
                  <td class="producto-imagen">
                    <img :src="producto.img_portada" :alt="producto.titulo" />
                  </td>
                  <td class="producto-info">
                    <h3 class="producto-titulo">{{ producto.titulo }}</h3>
                    <div class="producto-codigo">Código: {{ producto.producto_id }}</div>
                    <div class="producto-descuento" v-if="producto.descuento">
                      {{ producto.descuento }}
                    </div>
                  </td>
                  <td class="precio-lista">
                    {{ formatearMoneda(parseFloat(producto.precios.precio_lista)) }}
                  </td>
                  <td class="precio-unitario">
                    <span v-if="producto.precios.precio_descuento && parseFloat(producto.precios.precio_descuento) < parseFloat(producto.precios.precio_lista)">
                      <span class="precio-descuento">{{ formatearMoneda(parseFloat(producto.precios.precio_descuento)) }}</span>
                      <span class="precio-lista-tachado">{{ formatearMoneda(parseFloat(producto.precios.precio_lista)) }}</span>
                    </span>
                    <span v-else>
                      <span class="precio-normal">{{ formatearMoneda(parseFloat(producto.precios.precio_lista)) }}</span>
                    </span>
                  </td>
                  <td class="cantidad-control">
                    <div class="cantidad-wrapper">
                      <button @click="disminuirCantidad(index)" class="btn-cantidad" :disabled="producto.cantidad <= 1">
                        <i class="fas fa-minus"></i>
                      </button>
                      <input 
                        type="number" 
                        v-model.number="producto.cantidad" 
                        min="1" 
                        @change="actualizarCarrito" 
                        class="input-cantidad"
                      />
                      <button @click="aumentarCantidad(index)" class="btn-cantidad">
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                  </td>
                  <td class="subtotal">
                    {{ formatearMoneda(calcularSubtotalProducto(producto)) }}
                  </td>
                  <td class="acciones">
            <button @click="eliminarProducto(index)" class="btn-eliminar" title="Eliminar producto">
              <i class="fas fa-trash"></i>
            </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Sección inferior: Formularios y detalles -->
      <div class="carrito-detalles">
        <div class="detalles-grid">
                    <!-- Método de Pago -->
          <div class="seccion-pedido">
            <div class="seccion-header">
              <h3>Método de Pago</h3>
              <button class="btn-cambiar" @click="mostrarDialogoMetodoPago = true">CAMBIAR</button>
            </div>
            <div class="metodo-pago-content">
              <div v-if="metodoPagoSeleccionado" class="metodo-pago-actual">
                <div class="metodo-pago-info">
                  <div class="metodo-pago-header">
                    <i class="fas fa-credit-card"></i>
                    <strong>{{ metodoPagoSeleccionado.titulo }}</strong>
                    <span class="estado-seleccionada">✓ Seleccionado</span>
                  </div>
                  <p v-if="metodoPagoSeleccionado.categoria">{{ metodoPagoSeleccionado.categoria }}</p>
                  <p v-if="metodoPagoSeleccionado.descuento">Descuento: {{ metodoPagoSeleccionado.descuento }}%</p>
                  <p v-if="metodoPagoSeleccionado.plazo">Plazo: {{ metodoPagoSeleccionado.plazo }} día{{ metodoPagoSeleccionado.plazo > 1 ? 's' : '' }}</p>
                  <p v-if="metodoPagoSeleccionado.tipo_cambio">Tipo de cambio: {{ metodoPagoSeleccionado.tipo_cambio }}</p>
                </div>
              </div>
              <button v-else class="btn-seleccionar-metodo-pago" @click="mostrarDialogoMetodoPago = true">
                <i class="fas fa-credit-card"></i>
                Seleccionar Método de Pago
                <span class="requerido">* Requerido</span>
              </button>
              
              <div class="forma-pago-selector">
                <span>Forma de pago</span>
                <div class="radio-group">
                  <label class="radio-button">
                    <input type="radio" v-model="formaPago" value="PUE" name="formaPago">
                    <span class="radio-label">PUE</span>
                  </label>
                  <label class="radio-button">
                    <input type="radio" v-model="formaPago" value="PPD" name="formaPago">
                    <span class="radio-label">PPD</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Diálogo de Método de Pago -->
          <div v-if="mostrarDialogoMetodoPago" class="dialogo-overlay">
            <div class="dialogo-content">
              <div class="dialogo-header">
                <h3>Seleccionar Método de Pago</h3>
                <button class="btn-cerrar" @click="cerrarDialogoMetodoPago">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="dialogo-body">
                <!-- Filtro de búsqueda -->
                <div class="filtro-busqueda">
                  <input 
                    type="text" 
                    v-model="filtroMetodoPago" 
                    class="form-control"
                    placeholder="Buscar método de pago..."
                    @input="filtrarMetodosPago"
                  >
                  <div class="contador-metodos">
                    {{ metodosPagoFiltrados.length }} categorías encontradas
                  </div>
                </div>
                
                <div class="metodos-pago-lista">
                  <div v-for="categoria in metodosPagoFiltrados" :key="categoria.nombre" class="categoria-metodo">
                    <h4 class="categoria-titulo">{{ categoria.nombre }}</h4>
                    <div class="metodos-categoria">
                      <div v-for="(metodo, codigo) in categoria.metodo" :key="codigo" class="metodo-item" :class="{ 'seleccionado': metodoPagoSeleccionado && metodoPagoSeleccionado.codigo === codigo }">
                        <div class="metodo-info">
                          <div class="metodo-header">
                            <i class="fas fa-credit-card"></i>
                            <strong>{{ metodo.titulo }}</strong>
                          </div>
                          <div class="metodo-details">
                            <p v-if="metodo.descuento">
                              <i class="fas fa-percentage"></i>
                              Descuento: {{ metodo.descuento }}%
                            </p>
                            <p v-if="metodo.plazo">
                              <i class="fas fa-calendar"></i>
                              Plazo: {{ metodo.plazo }} día{{ metodo.plazo > 1 ? 's' : '' }}
                            </p>
                            <p v-if="metodo.tipo_cambio">
                              <i class="fas fa-exchange-alt"></i>
                              Tipo de cambio: {{ metodo.tipo_cambio }}
                            </p>
                            <p v-if="metodo.forma">
                              <i class="fas fa-list"></i>
                              Formas: {{ Object.keys(metodo.forma).join(', ') }}
                            </p>
                          </div>
                        </div>
                        <div class="metodo-actions">
                          <button @click="seleccionarMetodoPago(codigo, metodo, categoria.nombre)" class="btn-seleccionar" :class="{ 'seleccionado': metodoPagoSeleccionado && metodoPagoSeleccionado.codigo === codigo }">
                            <i class="fas fa-check-circle"></i>
                            {{ metodoPagoSeleccionado && metodoPagoSeleccionado.codigo === codigo ? 'Deseleccionar' : 'Seleccionar' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="metodosPagoFiltrados.length === 0" class="no-metodos">
                    <p>No hay métodos de pago disponibles.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Dirección de Envío -->
          <div class="seccion-pedido">
            <div class="seccion-header">
              <h3>Dirección de Envío</h3>
              <button class="btn-cambiar" @click="mostrarDialogoDireccion = true">CAMBIAR</button>
            </div>
            <div class="direccion-selector">
              <div v-if="direccionSeleccionada" class="direccion-actual">
                <div class="direccion-info">
                  <div class="direccion-header">
                    <i class="fas fa-map-marker-alt"></i>
                    <strong>{{ direccionSeleccionada.atencion_a }}</strong>
                    <span class="estado-seleccionada">✓ Seleccionada</span>
                  </div>
                  <p>{{ direccionSeleccionada.calle }} {{ direccionSeleccionada.num_ext }}{{ direccionSeleccionada.num_int ? `, Int. ${direccionSeleccionada.num_int}` : '' }}</p>
                  <p>{{ direccionSeleccionada.colonia }}, {{ direccionSeleccionada.codigo_postal }}</p>
                  <p>{{ direccionSeleccionada.ciudad }}, {{ direccionSeleccionada.estado }}, {{ direccionSeleccionada.pais }}</p>
                  <p>Tel: {{ direccionSeleccionada.telefono }}</p>
                </div>
              </div>
              <button v-else class="btn-seleccionar-direccion" @click="mostrarDialogoDireccion = true">
                <i class="fas fa-map-marker-alt"></i>
                Seleccionar Dirección de Envío
                <span class="requerido">* Requerido</span>
              </button>
            </div>
            </div>

          <!-- Diálogo de Dirección -->
          <div v-if="mostrarDialogoDireccion" class="dialogo-overlay">
            <div class="dialogo-content">
              <div class="dialogo-header">
                <h3>{{ direccionEditar ? 'Editar Dirección' : 'Nueva Dirección' }}</h3>
                <button class="btn-cerrar" @click="cerrarDialogoDireccion">
                  <i class="fas fa-times"></i>
                </button>
            </div>

              <div class="dialogo-body">
                <div v-if="!mostrarFormDireccion" class="direcciones-lista">
                  <div v-for="dir in direcciones" :key="dir.id" class="direccion-item" :class="{ 'seleccionada': direccionSeleccionada && direccionSeleccionada.id === dir.id }">
                    <div class="direccion-info">
                      <strong>{{ dir.atencion_a }}</strong>
                      <p>{{ dir.calle }} {{ dir.num_ext }}{{ dir.num_int ? `, Int. ${dir.num_int}` : '' }}</p>
                      <p>{{ dir.colonia }}, {{ dir.codigo_postal }}</p>
                      <p>{{ dir.ciudad }}, {{ dir.estado }}, {{ dir.pais }}</p>
                      <p>Tel: {{ dir.telefono }}</p>
                    </div>
                    <div class="direccion-actions">
                      <button @click="seleccionarDireccion(dir)" class="btn-seleccionar" :class="{ 'seleccionada': direccionSeleccionada && direccionSeleccionada.id === dir.id }">
                        <i class="fas fa-check-circle"></i>
                        {{ direccionSeleccionada && direccionSeleccionada.id === dir.id ? 'Deseleccionar' : 'Seleccionar' }}
                      </button>
                      <button @click="editarDireccion(dir)" class="btn-editar">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="eliminarDireccion(dir.id)" class="btn-eliminar">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>

                  <button @click="mostrarFormDireccion = true" class="btn-nueva-direccion">
                    <i class="fas fa-plus"></i>
                    Agregar Nueva Dirección
                  </button>
                </div>

                <DireccionForm
                  v-else
                  :direccion-editar="direccionEditar"
                  :editando="!!direccionEditar"
                  @guardado="onDireccionGuardada"
                  @cancelar="cancelarFormDireccion"
                />
              </div>
            </div>
          </div>

          <!-- Método de Entrega -->
          <div class="seccion-pedido">
            <div class="seccion-header">
              <h3>Método de Entrega</h3>
              <button class="btn-cambiar" @click="mostrarDialogoFleteras = true">CAMBIAR</button>
            </div>
            <div class="entrega-selector">
              <div v-if="fleteraSeleccionada" class="fletera-actual">
                <div class="fletera-info">
                  <strong>{{ fleteraSeleccionada.nombre }}</strong>
                  <p v-if="fleteraSeleccionada.tiempo_entrega">Tiempo de entrega: {{ fleteraSeleccionada.tiempo_entrega }}</p>
                  <p v-if="fleteraSeleccionada.costo">Costo: ${{ fleteraSeleccionada.costo }}</p>
                </div>
              </div>
              <button v-else class="btn-seleccionar-entrega" @click="mostrarDialogoFleteras = true">
                <i class="fas fa-truck"></i>
                Seleccionar Método de Entrega
              </button>
            </div>
          </div>

          <!-- Diálogo de Fleteras -->
          <div v-if="mostrarDialogoFleteras" class="dialogo-overlay">
            <div class="dialogo-content">
              <div class="dialogo-header">
                <h3>Seleccionar Fletera</h3>
                <button class="btn-cerrar" @click="cerrarDialogoFleteras">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="dialogo-body">
                <!-- Filtro de búsqueda -->
                <div class="filtro-busqueda">
                  <input 
                    type="text" 
                    v-model="filtroFleteras" 
                    class="form-control"
                    placeholder="Buscar fletera..."
                    @input="filtrarFleteras"
                  >
                  <div class="contador-fleteras">
                    {{ fleterasFiltradas.length }} de {{ fleteras.length }} fleteras
                  </div>
                </div>
                
                <div class="fleteras-lista">
                  <div v-for="fletera in fleterasFiltradas" :key="fletera.id || fletera" class="fletera-item">
                    <div class="fletera-info">
                      <div class="fletera-header">
                        <i class="fas fa-truck"></i>
                        <strong>{{ fletera.nombre || fletera }}</strong>
                      </div>
                      <div class="fletera-details">
                        <p v-if="fletera.tiempo_entrega">
                          <i class="fas fa-clock"></i>
                          Tiempo de entrega: {{ fletera.tiempo_entrega }}
                        </p>
                        <p v-if="fletera.costo">
                          <i class="fas fa-dollar-sign"></i>
                          Costo: ${{ fletera.costo }}
                        </p>
                        <p v-if="fletera.descripcion">
                          <i class="fas fa-info-circle"></i>
                          {{ fletera.descripcion }}
                        </p>
                      </div>
                    </div>
                    <div class="fletera-actions">
                      <button @click="seleccionarFletera(fletera)" class="btn-seleccionar">
                        <i class="fas fa-check-circle"></i>
                        Seleccionar
                      </button>
                    </div>
                  </div>

                  <div v-if="fleteras.length === 0" class="no-fleteras">
                    <p>No hay fleteras disponibles en este momento.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        <!-- Información Adicional -->
          <div class="seccion-pedido">
            <div class="seccion-header">
              <h3>Información Adicional</h3>
            </div>
            <div class="info-adicional-content">
              <!-- Folio Interno -->
          <div class="form-group">
                <label>Folio Interno / Orden de compra (Opcional):</label>
                <input 
                  type="text" 
                  v-model="folio" 
                  class="form-control"
                  placeholder="Ingrese el folio interno"
                >
          </div>

          <!-- Opciones adicionales -->
              <div class="opciones-adicionales">
                <label class="checkbox-container">
                  <input type="checkbox" v-model="envioDirecto">
                  <span class="checkbox-text">
                    Envío directo a cliente. No incluir factura ni información de SYSCOM.
                  </span>
                </label>
                <label class="checkbox-container">
                  <input type="checkbox" v-model="utilizarSaldo">
                  <span class="checkbox-text">
                    Utilizar Saldo a Favor. Se utilizará el saldo positivo que esté disponible en su cuenta.
                  </span>
                </label>
          </div>

              <!-- Comentarios -->
          <div class="form-group">
                <label>Comentarios a Vendedor</label>
                <textarea 
                  v-model="comentarios" 
                  class="form-control"
                  rows="4"
                ></textarea>
          </div>

              <!-- Uso del CFDI -->
              <div class="cfdi-section">
                <label>Uso del CFDI *</label>
                <div v-if="cfdiSeleccionado" class="cfdi-seleccionado">
                  <span class="cfdi-seleccionado-label">CFDI seleccionado:</span>
                  <span class="cfdi-seleccionado-valor">{{ cfdiSeleccionado }}</span>
                </div>
                <div class="cfdi-grid">
                  <button 
                    v-for="opcion in cfdiOpciones" 
                    :key="opcion.codigo || opcion.valor || opcion"
                    :class="['cfdi-option', { active: cfdiSeleccionado === (opcion.codigo || opcion.valor || opcion) }]"
                    @click="seleccionarCFDI(opcion.codigo || opcion.valor || opcion)"
                  >
                    <div class="cfdi-codigo">{{ opcion.codigo || 'N/A' }}</div>
                    <div class="cfdi-nombre">{{ opcion.nombre || opcion.texto || opcion }}</div>
                  </button>
                </div>
                <button class="btn-predeterminado" @click="establecerPredeterminado">
                  <i class="fas fa-star"></i>
                  Establecer como predeterminado
                </button>
              </div>
          </div>
          </div>
        </div>

        <!-- Botón de acción -->
        <div class="acciones-pedido">
          <button class="btn-generar-pedido" @click="generarPedido" :disabled="!puedeGenerarPedido">
            <i class="fas fa-check-circle"></i>
            Generar Pedido
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DireccionForm from './DireccionForm.vue'

export default {
  name: 'CarritoAll',
  components: {
    DireccionForm
  },
  data() {
    return {
      carrito: JSON.parse(localStorage.getItem('carrito')) || [],
      tipoCambio: null, // Para almacenar el tipo de cambio
      direcciones: [],
      direccionSeleccionada: null,
      direccionEditar: null,
      mostrarFormDireccion: false,
      mostrarDialogoDireccion: false,
      mostrarDialogoFleteras: false,
      fleteras: [],
      fleterasFiltradas: [],
      fleteraSeleccionada: null,
      filtroFleteras: '',
      mostrarDialogoMetodoPago: false,
      metodosPago: [],
      metodosPagoFiltrados: [],
      metodoPagoSeleccionado: null,
      filtroMetodoPago: '',
      comentarios: '',
      folio: '',  // Folio de orden de compra
      envioDirecto: false,  // Opción de envío directo
      utilizarSaldo: false,  // Opción de utilizar saldo a favor
      cfdiSeleccionado: '',
      cfdiOpciones: [],
      costoEnvio: 0, // Costo de envío base (ajustable)
      monedaSeleccionada: 'USD', // Moneda seleccionada (USD o MXN)
      numeroPedido: '', // Este número debería venir del backend
      formaPago: 'PUE',
    };
  },
  computed: {
    subtotal() {
      return this.carrito.reduce((acc, producto) => {
        const precio = (producto.precios && producto.precios.precio_descuento && parseFloat(producto.precios.precio_descuento) < parseFloat(producto.precios.precio_lista))
          ? parseFloat(producto.precios.precio_descuento)
          : parseFloat(producto.precios.precio_lista);
        return acc + precio * (producto.cantidad || 1);
      }, 0);
    },
    iva() {
      return this.subtotal * 0.16;
    },
    descuentoAplicado() {
      if (this.metodoPagoSeleccionado && this.metodoPagoSeleccionado.descuento > 0) {
        return (this.subtotal * this.metodoPagoSeleccionado.descuento) / 100;
      }
      return 0;
    },
    total() {
      return this.subtotal - this.descuentoAplicado + this.iva + this.costoEnvio;
    },
    puedeGenerarPedido() {
      return this.carrito.length > 0 &&
             this.direccionSeleccionada &&
             this.fleteraSeleccionada &&
             this.metodoPagoSeleccionado &&
             this.cfdiSeleccionado
    },
    puedeActualizarResumen() {
      return this.carrito.length > 0 &&
             this.direccionSeleccionada &&
             this.fleteraSeleccionada &&
             this.metodoPagoSeleccionado &&
             this.cfdiSeleccionado
    },
    pesoTotal() {
      if (!this.carrito || this.carrito.length === 0) return '0.00';
      return this.carrito.reduce((total, prod) => {
        const peso = prod.peso ? parseFloat(prod.peso) : 0;
        return total + peso * (prod.cantidad || 1);
      }, 0).toFixed(2);
    }
  },
  methods: {
    eliminarProducto(index) {
      this.carrito.splice(index, 1);
      localStorage.setItem('carrito', JSON.stringify(this.carrito));
    },
    actualizarCarrito() {
      localStorage.setItem('carrito', JSON.stringify(this.carrito));
    },
    navegarACatalogo() {
      this.$router.push({ name: 'productos' });
    },
    async obtenerTipoCambio() {
      try {
        const response = await fetch('https://backend-laravel-o66e6.ondigitalocean.app/tipocambio');
        const data = await response.json();
        
        // Verificar la estructura de la respuesta
        console.log('Respuesta completa del tipo de cambio:', data);
        
        // Intentar obtener el tipo de cambio de diferentes formas posibles
        if (data.normal) {
          this.tipoCambio = parseFloat(data.normal);
        } else if (data.tipo_cambio) {
          this.tipoCambio = parseFloat(data.tipo_cambio);
        } else if (data.valor) {
          this.tipoCambio = parseFloat(data.valor);
        } else if (typeof data === 'number') {
          this.tipoCambio = parseFloat(data);
        } else {
          console.warn('Estructura de tipo de cambio no reconocida:', data);
          this.tipoCambio = 18.50; // Valor por defecto
        }
        
        console.log('Tipo de cambio establecido:', this.tipoCambio);
      } catch (error) {
        console.error('Error al obtener tipo de cambio:', error);
        // Establecer un tipo de cambio por defecto en caso de error
        this.tipoCambio = 18.50;
      }
    },
    async cargarDirecciones() {
      try {
        const response = await fetch('https://backend-laravel-o66e6.ondigitalocean.app/carrito/direcciones')
        this.direcciones = await response.json()
      } catch (error) {
        console.error('Error al cargar direcciones:', error)
      }
    },
    async cargarFleteras() {
      try {
        const response = await fetch('https://backend-laravel-o66e6.ondigitalocean.app/carrito/fleteras')
        const data = await response.json()
        console.log('Fleteras cargadas:', data) // Para debugging
        
        // Asegurarnos de que las fleteras tengan el formato correcto
        this.fleteras = Array.isArray(data) ? data.map(fletera => {
          // Si es un string, convertirlo a objeto
          if (typeof fletera === 'string') {
            return { codigo: fletera, nombre: fletera }
          }
          // Si es un objeto, asegurarnos de que tenga las propiedades necesarias
          return {
            codigo: fletera.codigo || fletera.id || fletera.nombre,
            nombre: fletera.nombre || fletera.codigo || fletera
          }
        }) : []
        
        this.fleterasFiltradas = [...this.fleteras]
      } catch (error) {
        console.error('Error al cargar fleteras:', error)
        this.fleteras = []
        this.fleterasFiltradas = []
      }
    },

    filtrarFleteras() {
      if (!this.filtroFleteras.trim()) {
        this.fleterasFiltradas = [...this.fleteras]
      } else {
        const filtro = this.filtroFleteras.toLowerCase()
        this.fleterasFiltradas = this.fleteras.filter(fletera => {
          const nombre = (fletera.nombre || fletera).toLowerCase()
          const descripcion = (fletera.descripcion || '').toLowerCase()
          return nombre.includes(filtro) || descripcion.includes(filtro)
        })
      }
    },

    seleccionarFletera(fletera) {
      // Asegurarnos de que la fletera tenga el formato correcto
      this.fleteraSeleccionada = {
        codigo: fletera.codigo || fletera.id || fletera.nombre || fletera,
        nombre: fletera.nombre || fletera.codigo || fletera
      }
      console.log('Fletera seleccionada:', this.fleteraSeleccionada) // Para debugging
      this.cerrarDialogoFleteras()
    },

    cerrarDialogoFleteras() {
      this.mostrarDialogoFleteras = false
      this.filtroFleteras = ''
      this.fleterasFiltradas = [...this.fleteras]
    },

    mostrarMensaje(mensaje) {
      // Crear un elemento de mensaje temporal
      const mensajeElement = document.createElement('div')
      mensajeElement.className = 'mensaje-temp'
      mensajeElement.textContent = mensaje
      mensajeElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-success);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-weight: 500;
        animation: slideIn 0.3s ease;
      `
      
      document.body.appendChild(mensajeElement)
      
      // Remover el mensaje después de 3 segundos
      setTimeout(() => {
        if (mensajeElement.parentNode) {
          mensajeElement.style.animation = 'slideOut 0.3s ease'
          setTimeout(() => {
            if (mensajeElement.parentNode) {
              document.body.removeChild(mensajeElement)
            }
          }, 300)
        }
      }, 3000)
    },
    async cargarMetodosPago() {
      try {
        const response = await fetch('https://backend-laravel-o66e6.ondigitalocean.app/carrito/pago')
        this.metodosPago = await response.json()
        this.metodosPagoFiltrados = [...this.metodosPago] // Inicializar métodos filtrados
      } catch (error) {
        console.error('Error al cargar métodos de pago:', error)
      }
    },

    filtrarMetodosPago() {
      if (!this.filtroMetodoPago.trim()) {
        this.metodosPagoFiltrados = [...this.metodosPago]
      } else {
        const filtro = this.filtroMetodoPago.toLowerCase()
        this.metodosPagoFiltrados = this.metodosPago.filter(categoria => {
          // Filtrar por nombre de categoría
          if (categoria.nombre.toLowerCase().includes(filtro)) {
            return true
          }
          
          // Filtrar por métodos dentro de la categoría
          const metodosFiltrados = Object.entries(categoria.metodo).filter(([codigo, metodo]) => {
            return metodo.titulo.toLowerCase().includes(filtro) ||
                   codigo.toLowerCase().includes(filtro)
          })
          
          if (metodosFiltrados.length > 0) {
            // Crear una nueva categoría con solo los métodos filtrados
            const categoriaFiltrada = {
              ...categoria,
              metodo: Object.fromEntries(metodosFiltrados)
            }
            return categoriaFiltrada
          }
          
          return false
        })
      }
    },

    seleccionarMetodoPago(codigo, metodo, categoriaNombre) {
      // Si el método ya está seleccionado, lo deseleccionamos
      if (this.metodoPagoSeleccionado && this.metodoPagoSeleccionado.codigo === codigo) {
        this.metodoPagoSeleccionado = null
        this.mostrarMensaje('Método de pago deseleccionado')
      } else {
        this.metodoPagoSeleccionado = {
          codigo: codigo,
          categoria: categoriaNombre,
          titulo: metodo.titulo,
          descuento: metodo.descuento,
          plazo: metodo.plazo,
          tipo_cambio: metodo.tipo_cambio,
          forma: metodo.forma
        }
        // Cerrar el diálogo automáticamente
        this.cerrarDialogoMetodoPago()
        // Mostrar mensaje de confirmación
        this.mostrarMensaje('Método de pago seleccionado correctamente')
      }
    },

    cerrarDialogoMetodoPago() {
      this.mostrarDialogoMetodoPago = false
      this.filtroMetodoPago = ''
      this.metodosPagoFiltrados = [...this.metodosPago]
    },
    async cargarCFDI() {
      try {
        const response = await fetch('https://backend-laravel-o66e6.ondigitalocean.app/carrito/cfdi')
        const data = await response.json()
        
        // Verificar que los datos sean válidos
        if (Array.isArray(data)) {
          this.cfdiOpciones = data
          
          // Establecer CFDI predeterminado (G01 - Adquisición de mercancías)
          if (data.length > 0) {
            const cfdiPredeterminado = data.find(cfdi => cfdi.codigo === 'G01') || data[0]
            this.cfdiSeleccionado = cfdiPredeterminado.codigo
          }
        } else {
          console.error('Formato de datos CFDI inválido:', data)
          this.cfdiOpciones = []
        }
      } catch (error) {
        console.error('Error al cargar opciones CFDI:', error)
        this.cfdiOpciones = []
      }
    },
    seleccionarDireccion(direccion) {
      // Si la dirección ya está seleccionada, la deseleccionamos
      if (this.direccionSeleccionada && this.direccionSeleccionada.id === direccion.id) {
        this.direccionSeleccionada = null
        this.mostrarMensaje('Dirección deseleccionada')
      } else {
        this.direccionSeleccionada = direccion
        // Cerrar el diálogo de direcciones automáticamente
        this.cerrarDialogoDireccion()
        // Mostrar mensaje de confirmación
        this.mostrarMensaje('Dirección seleccionada correctamente')
      }
    },
    editarDireccion(direccion) {
      this.direccionEditar = direccion
      this.mostrarFormDireccion = true
    },
    async eliminarDireccion(id) {
      if (confirm('¿Está seguro de eliminar esta dirección?')) {
        try {
          const response = await fetch(`https://backend-laravel-o66e6.ondigitalocean.app/carrito/direcciones/${id}`, {
            method: 'DELETE'
          })
          if (response.ok) {
            this.direcciones = this.direcciones.filter(d => d.id !== id)
            if (this.direccionSeleccionada?.id === id) {
              this.direccionSeleccionada = null
            }
          }
        } catch (error) {
          console.error('Error al eliminar dirección:', error)
        }
      }
    },
    onDireccionGuardada(direccion) {
      if (this.direccionEditar) {
        const index = this.direcciones.findIndex(d => d.id === direccion.id)
        if (index !== -1) {
          this.direcciones[index] = direccion
        }
      } else {
        this.direcciones.push(direccion)
      }
      this.seleccionarDireccion(direccion);
      this.cerrarDialogoDireccion()
      this.mostrarMensaje('Dirección guardada y seleccionada correctamente')
    },
    cancelarFormDireccion() {
      this.mostrarFormDireccion = false
      this.direccionEditar = null
    },
    cerrarDialogoDireccion() {
      this.mostrarDialogoDireccion = false;
      this.mostrarFormDireccion = false;
      this.direccionEditar = null;
    },
    async obtenerResumenCarrito() {
      try {
        const resumenData = {
          tipo_entrega: "domicilio",
          direccion: this.direccionSeleccionada,
          metodo_pago: this.metodoPagoSeleccionado ? this.metodoPagoSeleccionado.codigo : null,
          fletera: this.fleteraSeleccionada,
          productos: this.carrito.map(item => ({
            id: item.producto_id,
            tipo: "nuevo",
            cantidad: item.cantidad
          })),
          moneda: "mxn",
          uso_cfdi: this.cfdiSeleccionado,
          tipo_pago: this.formaPago.toLowerCase(),
          orden_compra: this.folio,
          ordenar: false,
          iva_frontera: true,
          forzar: false,
          testmode: true
        }

        const response = await fetch('https://backend-laravel-o66e6.ondigitalocean.app/carrito/resumen', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(resumenData)
        })

        if (response.ok) {
          const resumen = await response.json()
          // Aquí puedes actualizar los valores del resumen con los datos reales de la API
          console.log('Resumen del carrito:', resumen)
          return resumen
        }
      } catch (error) {
        console.error('Error al obtener resumen del carrito:', error)
      }
    },

    async actualizarResumen() {
      try {
        const resumen = await this.obtenerResumenCarrito()
        if (resumen) {
          // Actualizar los valores del resumen con los datos reales de la API
          // Aquí puedes mapear los campos según la respuesta de la API
          console.log('Resumen actualizado:', resumen)
          // Por ejemplo:
          // this.subtotal = resumen.subtotal
          // this.costoEnvio = resumen.costo_envio
          // this.iva = resumen.iva
          // this.total = resumen.total
        }
      } catch (error) {
        console.error('Error al actualizar resumen:', error)
      }
    },



    async generarCotizacionExcel() {
      try {
        // Validar que el carrito no esté vacío
        if (this.carrito.length === 0) {
          alert('El carrito está vacío. Agrega productos antes de generar la cotización.')
          return
        }

        // Validar que se haya seleccionado una dirección
        if (!this.direccionSeleccionada) {
          alert('Por favor selecciona una dirección de envío.')
          return
        }

        // Validar que se haya seleccionado un CFDI
        if (!this.cfdiSeleccionado) {
          alert('Por favor selecciona un uso de CFDI.')
          return
        }

        console.log('Iniciando generación de cotización Excel...')

        const cotizacionData = {
          tipo_entrega: "domicilio",
          direccion: this.direccionSeleccionada,
          metodo_pago: this.metodoPagoSeleccionado ? this.metodoPagoSeleccionado.codigo : null,
          fletera: this.fleteraSeleccionada,
          productos: this.carrito.map(item => ({
            id: item.producto_id,
            descripcion: item.titulo,
            cantidad: item.cantidad,
            precio_unitario: parseFloat(item.precios.precio_descuento || item.precios.precio_lista),
            imagen: item.imagen || item.imagenes?.[0] || '', // Incluir la imagen del producto
            marca: item.marca || '',
            modelo: item.modelo || ''
          })),
          moneda: "mxn",
          uso_cfdi: this.cfdiSeleccionado,
          tipo_pago: this.formaPago.toLowerCase(),
          orden_compra: this.folio,
          subtotal: this.subtotal,
          iva: this.iva,
          costo_envio: this.costoEnvio,
          total: this.total,
          comentarios: this.comentarios,
          tipo_cambio: this.tipoCambio // Agregar el tipo de cambio
        }

        console.log('Datos de cotización Excel:', cotizacionData)

        const response = await fetch('https://backend-laravel-o66e6.ondigitalocean.app/carrito/cotizacion-excel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(cotizacionData)
        })

        console.log('Respuesta del servidor Excel:', response.status, response.statusText)

        if (response.ok) {
          const resultado = await response.json()
          console.log('Resultado exitoso Excel:', resultado)
          
          // Crear un enlace temporal para descargar el archivo
          const link = document.createElement('a')
          link.href = resultado.url
          link.download = resultado.filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          // Mostrar mensaje de éxito
          alert('✅ Cotización Excel generada exitosamente: ' + resultado.filename)
        } else {
          let errorMessage = `Error del servidor: ${response.status} ${response.statusText}`
          
          try {
            const contentType = response.headers.get('content-type')
            if (contentType && contentType.includes('application/json')) {
              const error = await response.json()
              errorMessage = error.message || error.error || errorMessage
            } else {
              // Si es HTML, mostrar un mensaje genérico
              errorMessage = 'Error del servidor. Verifica que el backend esté ejecutándose correctamente.'
            }
          } catch (parseError) {
            console.error('Error al parsear respuesta de error:', parseError)
            errorMessage = 'Error al procesar la respuesta del servidor'
          }
          
          alert('❌ Error al generar la cotización Excel: ' + errorMessage)
        }
      } catch (error) {
        console.error('Error al generar cotización Excel:', error)
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          alert('❌ Error de conexión: No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en https://backend-laravel-o66e6.ondigitalocean.app')
        } else if (error.name === 'TypeError' && error.message.includes('Unexpected token')) {
          alert('❌ Error del servidor: El servidor devolvió HTML en lugar de JSON. Verifica que el backend esté funcionando correctamente.')
        } else {
          alert('❌ Error al generar la cotización Excel: ' + error.message)
        }
      }
    },

    async generarPedido() {
      try {
        // Validar datos requeridos
        if (!this.direccionSeleccionada) {
          alert('Por favor selecciona una dirección de envío');
          return;
        }

        if (!this.metodoPagoSeleccionado) {
          alert('Por favor selecciona un método de pago');
          return;
        }

        if (!this.fleteraSeleccionada) {
          alert('Por favor selecciona una fletera');
          return;
        }

        if (!this.cfdiSeleccionado) {
          alert('Por favor selecciona un uso de CFDI');
          return;
        }

        // Preparar productos
        const productos = this.carrito.map(item => ({
          id: item.producto_id.toString(), // Asegurar que el ID sea string
          tipo: "nuevo",
          cantidad: parseInt(item.cantidad) || 1 // Asegurar que la cantidad sea número
        }));

        // Preparar dirección
        const direccion = {
          atencion_a: this.direccionSeleccionada.atencion_a,
          calle: this.direccionSeleccionada.calle,
          num_ext: this.direccionSeleccionada.num_ext,
          num_int: this.direccionSeleccionada.num_int || '',
          colonia: this.direccionSeleccionada.colonia,
          codigo_postal: this.direccionSeleccionada.codigo_postal,
          ciudad: this.direccionSeleccionada.ciudad,
          estado: this.direccionSeleccionada.estado,
          pais: this.direccionSeleccionada.pais,
          telefono: this.direccionSeleccionada.telefono
        };

        // Preparar datos del pedido
        const pedidoData = {
          tipo_entrega: "domicilio",
          direccion: direccion,
          metodo_pago: this.metodoPagoSeleccionado.codigo,
          fletera: this.fleteraSeleccionada.codigo,
          productos: productos,
          moneda: this.monedaSeleccionada.toLowerCase(),
          uso_cfdi: this.cfdiSeleccionado,
          tipo_pago: this.formaPago.toLowerCase(),
          orden_compra: this.folio || '',
          envio_directo: this.envioDirecto,
          usar_saldo: this.utilizarSaldo,
          comentarios: this.comentarios || '',
          ordenar: true, // Cambiar a true para generar el pedido real
          iva_frontera: true,
          forzar: false
        }

        console.log('Enviando datos del pedido:', pedidoData);

        const response = await fetch('https://backend-laravel-o66e6.ondigitalocean.app/carrito/generar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(pedidoData)
        });

        const resultado = await response.json();
        console.log('Respuesta del servidor:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: resultado
        });

        if (response.ok) {
          // Validar la respuesta
          if (resultado.error) {
            throw new Error(resultado.message || resultado.error);
          }

          // Limpiar carrito después de generar el pedido
          this.carrito = [];
          localStorage.setItem('carrito', JSON.stringify([]));

          // Mostrar mensaje de éxito con detalles
          let mensaje = '¡Pedido generado exitosamente!';
          if (resultado.id) {
            mensaje += `\nID del pedido: ${resultado.id}`;
          }
          if (resultado.datos?.folio) {
            mensaje += `\nFolio: ${resultado.datos.folio}`;
          }
          if (resultado.datos?.total) {
            mensaje += `\nTotal: $${resultado.datos.total}`;
          }
          mensaje += '\n\nEl pedido se ha generado correctamente.';

          alert(mensaje);
          
          // Limpiar el formulario y restablecer estados
          this.folio = '';
          this.comentarios = '';
          this.envioDirecto = false;
          this.utilizarSaldo = false;
          this.metodoPagoSeleccionado = null;
          this.fleteraSeleccionada = null;
          this.direccionSeleccionada = null;
        } else {
          // Construir mensaje de error detallado
          let errorMessage = 'Error al generar el pedido:\n';
          
          if (resultado.message && resultado.message !== 'An error occurred.') {
            errorMessage += resultado.message;
          } else if (resultado.error) {
            errorMessage += resultado.error;
          } else {
            errorMessage += `Error ${response.status}: ${response.statusText}`;
            
            // Agregar detalles adicionales si están disponibles
            if (resultado.datos) {
              errorMessage += '\n\nDetalles adicionales:\n';
              errorMessage += JSON.stringify(resultado.datos, null, 2);
            }
          }

          // Agregar sugerencia de acción
          errorMessage += '\n\nPor favor verifica:';
          errorMessage += '\n1. Que todos los datos estén completos';
          errorMessage += '\n2. Que el método de pago sea válido';
          errorMessage += '\n3. Que la dirección de envío sea correcta';
          errorMessage += '\n4. Que los productos estén disponibles';

          alert(errorMessage);
          
          // Log para debugging
          console.error('Error detallado:', {
            status: response.status,
            statusText: response.statusText,
            resultado: resultado,
            pedidoData: pedidoData
          });
        }
      } catch (error) {
        console.error('Error al generar pedido:', error)
      }
    },
    aumentarCantidad(index) {
      this.carrito[index].cantidad++;
      this.actualizarCarrito();
    },
    disminuirCantidad(index) {
      if (this.carrito[index].cantidad > 1) {
        this.carrito[index].cantidad--;
        this.actualizarCarrito();
      }
    },
    formatearMonto(monto) {
      return monto.toFixed(2);
    },
    formatearMoneda(monto) {
      if (this.monedaSeleccionada === 'MXN' && this.tipoCambio) {
        // Convertir de USD a MXN multiplicando por el tipo de cambio
        const montoMXN = monto * this.tipoCambio;
        return `$${montoMXN.toFixed(2)} MXN`;
      } else {
        // Mantener en USD
        return `$${monto.toFixed(2)} USD`;
      }
    },
    calcularSubtotalProducto(producto) {
      const precio = (producto.precios && producto.precios.precio_descuento && parseFloat(producto.precios.precio_descuento) < parseFloat(producto.precios.precio_lista))
        ? parseFloat(producto.precios.precio_descuento)
        : parseFloat(producto.precios.precio_lista);
      return precio * (producto.cantidad || 1);
    },
    cambiarMoneda(moneda) {
      this.monedaSeleccionada = moneda;
      // Guardar preferencia en localStorage
      localStorage.setItem('moneda_preferida', moneda);
      this.mostrarMensaje(`Moneda cambiada a ${moneda}`);
      
      // Mostrar ejemplo de conversión en consola para debugging
      if (this.tipoCambio && this.subtotal > 0) {
        console.log('Ejemplo de conversión:');
        console.log(`Subtotal USD: $${this.subtotal.toFixed(2)}`);
        console.log(`Tipo de cambio: ${this.tipoCambio} MXN/USD`);
        console.log(`Subtotal MXN: $${(this.subtotal * this.tipoCambio).toFixed(2)}`);
        console.log('Resumen completo con conversión:');
        console.log(`- Subtotal: ${this.formatearMoneda(this.subtotal)}`);
        console.log(`- IVA: ${this.formatearMoneda(this.iva)}`);
        console.log(`- Envío: ${this.formatearMoneda(this.costoEnvio)}`);
        console.log(`- Total: ${this.formatearMoneda(this.total)}`);
      }
    },
    finalizarPedido() {
      // Implementar la lógica de finalización del pedido
      this.generarPedido();
    },
    seleccionarCFDI(valor) {
      this.cfdiSeleccionado = valor;
    },
    establecerPredeterminado() {
      if (this.cfdiSeleccionado) {
        // Guardar en localStorage para futuras sesiones
        localStorage.setItem('cfdi_predeterminado', this.cfdiSeleccionado)
        
        // Mostrar mensaje de confirmación
        alert(`CFDI "${this.cfdiSeleccionado}" establecido como predeterminado`)
        
        console.log('CFDI predeterminado establecido:', this.cfdiSeleccionado)
      } else {
        alert('Por favor selecciona un CFDI antes de establecerlo como predeterminado')
      }
    },
  },
  mounted() {
    this.cargarDirecciones()
    this.cargarFleteras()
    this.cargarMetodosPago()
    this.cargarCFDI()
    this.obtenerTipoCambio() // Obtener el tipo de cambio al montar el componente
    
    // Cargar moneda preferida guardada
    const monedaPreferida = localStorage.getItem('moneda_preferida')
    if (monedaPreferida) {
      this.monedaSeleccionada = monedaPreferida
    }

    // Cargar CFDI predeterminado guardado
    const cfdiPredeterminado = localStorage.getItem('cfdi_predeterminado')
    if (cfdiPredeterminado) {
      this.cfdiSeleccionado = cfdiPredeterminado
    }
  },
};
</script>

<style src="../assets/Carrito.css"></style>