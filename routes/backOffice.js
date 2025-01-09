const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

const backOfficeController = require('../controllers/BackOffice');
const officeEventController = require('../controllers/OfficeEvent');

// /backoffice
router.get('/', isAuth, backOfficeController.getMenuPrincipal);

router.get('/listado-eventos', isAuth, officeEventController.getListaEventos);

router.get('/creacion-evento', isAuth, officeEventController.getCrearEvento);
router.post('/creacion-evento', isAuth, officeEventController.postCrearEvento);

router.get('/editar-evento/:idEvento', isAuth, officeEventController.getEditarEvento);
router.post('/editar-evento', isAuth, officeEventController.postEditarEvento);

router.post('/eliminar-evento', isAuth, officeEventController.postEliminarEvento);

router.get('/listado-entradas-eventos', isAuth, officeEventController.getListaEntradasEventos);

router.get('/creacion-entradas-eventos', isAuth, officeEventController.getCrearEntradasEventos);
router.post('/creacion-entrada', isAuth, officeEventController.postCrearEntrada);

router.get('/entradas-evento/:idEvento', isAuth, officeEventController.getEditarEntradasEventos);
router.post('/editar-entrada', isAuth, officeEventController.postEditarEntrada);

router.post('/eliminar-entrada', isAuth, officeEventController.postEliminarEntrada);

router.get('/categorias', isAuth, backOfficeController.getListaCategorias);
router.post('/crear-categoria', isAuth, backOfficeController.postCrearCategoria);
router.post('/eliminar-categoria', isAuth, backOfficeController.postEliminarCategoria);

module.exports = router;