const express = require('express');
const {check, body} = require('express-validator');
const router = express.Router();

const accountController = require('../controllers/Account');
const loginController = require('../controllers/Login');
const Usuario = require('../models/usuario');

router.post('/ingresar', [
    body('correo').notEmpty().withMessage('Llenar todos los campos del formulario'),
    body('password').notEmpty().withMessage('Llenar todos los campos del formulario')
], loginController.postIngresar);

router.post('/salir', loginController.postSalir);

router.post('/registrarse', [
    body('nombre').notEmpty().withMessage('Nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('Apellido es obligatorio'),
    body('correo').notEmpty().withMessage('Correo es obligatorio'),
    body('password').notEmpty().withMessage('Contraseña es obligatorio'),

    check('correo').isEmail().withMessage('Formato de correo electrónico inválido').custom((value, {req})=> {
        return Usuario.findOne({correo: value}).then(usuarioDoc => {
            if (usuarioDoc) {
                return Promise.reject('Correo ya registrado.');
            }
        });
    }),
    body('password', 'Password inválido. Debe tener solo letras y números y no menos de 5 caracteres').isLength({min:5}).isAlphanumeric(),
    /*body('passwordConfirmado').custom((value, {req})=> {
        if (value !== req.body.password) {
            throw new Error('Contraseñas no coinciden');
        }
        return true; // Para indicar que pasó la validación
    })*/
], accountController.postRegistrarse);

router.post('/reinicio', loginController.postReinicio);
router.post('/nuevo-password', loginController.postNuevoPassword);

module.exports = router;