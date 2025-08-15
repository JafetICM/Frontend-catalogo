// nombre-proyecto\frontend-vue/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import InicioSYSCOM from '../components/InicioSYSCOM.vue';
import CategoriaList from '../components/Categoria.vue';
import CategoriaDetail from '../components/CategoriaDetail.vue';
import Carrito from '../components/Carrito.vue';
import Marcas from '../components/MarcasList.vue';
import MarcaDetail from '../components/MarcaDetail.vue';
import MarcaProductos from  '../components/MarcaProductos.vue';
import ProductoDetail from '../components/ProductoDetail.vue';
import Productos from '../components/Productos.vue';
import ProductoForm from '../components/ProductSearchForm.vue';
import FacturasComponent from '../components/Facturas.vue';
import FacturaDetalleComponent from '../components/FacturaDetalle.vue';

const routes = [
  {
    path: '/',
    component: InicioSYSCOM
  },
  {
    path: '/categorias',
    component: CategoriaList,
    name: 'categorias'
  },
  {
    path: '/categorias/:id',  // Ruta para los detalles de la categoría
    component: CategoriaDetail,
    name: 'CategoriaDetail'
  },
  {
    path: '/carrito',
    component: Carrito,
    name: 'Carrito'
  },
  {
    path: '/marcas',
    component: Marcas
  },
  {
    path: '/marcas/:id',  // Ruta para los detalles de la marca
    component: MarcaDetail,
    name: 'MarcaDetail'
  },
  {
    path: '/marcas/:id/productos',
    component: MarcaProductos,
    name: 'MarcaProductos'
  },
  
  {
    path: '/productos/:id',  // Ruta para los detalles del producto
    component: ProductoDetail,
    name: 'ProductoDetail'
  },
  {
    path: '/productos',
    component: Productos,
    name: 'productos'
  },
  {
    path: '/productos/:id/productos',
    component: ProductoForm,
    name: 'ProductoList'
  },
  {
    path: '/facturas',
    component: FacturasComponent,
    name: 'facturas'
  },
  {
    path: '/facturas/:id',
    component: FacturaDetalleComponent,
    name: 'factura-detalle'
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
