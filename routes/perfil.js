const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');
const accountController = require('../controllers/Account');
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const {body} = require('express-validator');

router.get('/', isAuth, accountController.getMiPerfil);
router.get('/seguridad', isAuth, accountController.getSeguridadPage);
router.get('/wishlist', isAuth, accountController.getWishlistPage);

router.post('/add-to-wishlist', isAuth, accountController.postAgregarWishlist);
router.post('/remove-to-wishlist', isAuth, accountController.postRemoveWishlist);

router.post('/agregar-foto', isAuth, accountController.postAgregarFoto);
router.post('/editar-info-personal', isAuth, accountController.postEditarInfoPersonal);
router.post('/editar-info-complementaria', isAuth, accountController.postEditarInformacionComplementaria);
router.post('/guardar-info-contacto', isAuth, accountController.postEditarInformacionContacto);

router.post('/cambiar-password', [
    body('actual').notEmpty().withMessage('Llenar todos los campos del formulario'),
    body('nueva').notEmpty().withMessage('Llenar todos los campos del formulario'),
    body('actual').custom((value, {req})=> {
        var userId = req.body.idUsuario;
        return Usuario.findById(userId).then(usuarioDoc => {
            if (usuarioDoc) {
                return bcrypt.compare(value, usuarioDoc.password)
                .then(hayCoincidencia => {
                    if(!hayCoincidencia) {
                        throw new Error('La contraseña actual ingresada es incorrecta.');
                    }
                    return true;
                })             
            }
        });
    })
], accountController.postCambiarPassword);

router.get('/mis-entradas', isAuth, accountController.getMisEntradas);
router.get('/historialEventos', isAuth, accountController.getHistorialCompras);

module.exports = router;