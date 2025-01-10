const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

const homeController = require ('../controllers/Home');
const storeEventController = require('../controllers/StoreEvent');
const purchaseController = require('../controllers/Purchase');

router.get ('/', homeController.getIndex);
router.get('/eventos/:idEvento', storeEventController.getDetalleEventoTienda);

router.post('/realizar-compra', isAuth, purchaseController.postRealizarCompra);
router.get('/detalle-compra/:idCompra', isAuth, purchaseController.getDetalleCompra);
router.get('/entradas/:idCompra', isAuth, purchaseController.getDetalleEntradasCompra);

router.get('/buscar-eventos', storeEventController.getListadoEventos);

module.exports = router;