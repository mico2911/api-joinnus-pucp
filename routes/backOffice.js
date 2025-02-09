const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

const backOfficeController = require('../controllers/BackOffice');
const officeEventController = require('../controllers/OfficeEvent');

// /backoffice
router.get('/eventos', isAuth, officeEventController.getListaEventos);
router.post('/eventos', isAuth, officeEventController.postCrearEvento);
router.post('/eventos-update', isAuth, officeEventController.postEditarEvento);
router.post('/eventos-delete', isAuth, officeEventController.postEliminarEvento);

router.get('/eventos/:idEvento', isAuth, officeEventController.getDetalleEvento);

router.post('/evento-entradas', isAuth, officeEventController.postCrearEntrada);
router.post('/evento-entradas-update', isAuth, officeEventController.postEditarEntrada);
router.post('/evento-entradas-delete', isAuth, officeEventController.postEliminarEntrada);

router.get('/categorias', backOfficeController.getListaCategorias);
router.post('/categorias', isAuth, backOfficeController.postCrearCategoria);
router.post('/categorias-delete', isAuth, backOfficeController.postEliminarCategoria);

module.exports = router;