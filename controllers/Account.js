const eventsHelper = require ('../scripts/helpers/eventsHelper');
const Usuario = require('../models/usuario');
const Compra  = require('../models/compra');
const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator');

exports.postRegistrarse = (req, res, next) => {
    const nombre             = req.body.nombre;
    const apellido           = req.body.apellido;
    const correo             = req.body.correo;
    const correoConfirmado   = req.body.correoConfirmado;
    const password           = req.body.password;
    const genero             = req.body.genero;
    const ciudad             = req.body.ciudad;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg);
        error.statusCode = 422;
        throw error;
    }
    
    if (correo !== correoConfirmado) {
        const error = new Error('Los correos ingresados no coinciden.');
        error.statusCode = 422;
        throw error;
    }

    bcrypt.hash(password, 10)
    .then(passwordCifrado => {
        const usuario = new Usuario({
            nombre   : nombre,
            apellido : apellido,
            correo   : correo,
            password : passwordCifrado,
            genero   : genero,
            ciudad   : ciudad
        });

        return usuario.save();
    })
    .then(result => {
        console.log(result);
        console.log('Usuario registrado');
        res.status(200).json({
            mensaje : 'Usuario registrado con éxito',
            success : true
        })
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.getUser = (req, res, next) => {
    var isAdmiUser = req.isAdmin;
    var idUsuario  = req.idUsuario;

    const idUserParam = req.params.idUser;

    // Si es un usuario administrador o si es el mismo usuario loggeado
    if (isAdmiUser || idUsuario === idUserParam) {
        Usuario.findById(idUserParam)
        .then(usuario => {
            if (!usuario) {
                const error = new Error('No se ha encontrado un usuario con el id especificado.');
                error.statusCode = 404;
                throw error;
            }

            res.status(200).json({
                usuario : usuario
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    } else {
        const error = new Error('No se ha podido encontrar el usuario solicitado');
        error.statusCode = 401; //Unauthorized
        return next(error);
    }
};

exports.getInfoAccount = (req, res, next) => {    
    var idUsuario  = req.idUsuario;

    Usuario.findById(idUsuario)
    .then(usuario => {
        if (!usuario) {
            const error = new Error('No se ha encontrado un usuario con el id especificado.');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            usuario : usuario
        });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });    
};

exports.postAgregarWishlist = (req, res, next) => {
    var idUsuario  = req.idUsuario;

    const idEvento = req.body.idEvento;

    if (idUsuario) {
        Usuario.findById(idUsuario)
        .then(usuario => {
            return usuario.agregarEventoWishlist(idEvento);
        })
        .then(result => {
            console.log(result);
            console.log('Evento añadido a la lista de favoritos exitosamente');
            res.status(200).json({
                mensaje : 'Evento añadido a la lista de favoritos exitosamente'
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    }
};


exports.postRemoveWishlist = (req, res, next) => {
    var idUsuario  = req.idUsuario;

    const idEvento = req.body.idEvento;

    if (idUsuario) {
        Usuario.findById(idUsuario)
        .then(usuario => {
            return usuario.eliminarEventoWishlist(idEvento);
        })
        .then(result => {
            console.log(result);
            console.log('Evento eliminado de la lista de favoritos exitosamente');
            res.status(200).json({
                mensaje : 'Evento eliminado de la lista de favoritos exitosamente'
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    }    
};

exports.postAgregarFoto = (req, res, next) => {
    var idUsuario  = req.idUsuario;

    const foto  = req.body.foto;

    if (idUsuario) {
        Usuario.findById(idUsuario)
        .then(usuario => {
            usuario.urlFoto = foto;
            return usuario.save();
        })
        .then(result => {
            console.log(result);
            res.status(200).json({
                mensaje : 'Foto añadida al usuario exitosamente.',
                user : result,
                success : true
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    }    
};

exports.postEditarInfoPersonal = (req, res, next) => {
    var idUsuario  = req.idUsuario;

    const nombre   = req.body.nombre;
    const apellido = req.body.apellido;
    const genero   = req.body.genero;
    const ciudad   = req.body.ciudad;

    if (idUsuario) {
        Usuario.findById(idUsuario)
        .then(usuario => {
            if (nombre) {
                usuario.nombre = nombre;
            }

            if (apellido) {
                usuario.apellido = apellido;
            }

            if (genero) {
                usuario.genero = genero;
            }

            if (ciudad) {
                usuario.ciudad = ciudad;
            }
            
            return usuario.save();
        })
        .then(result => {
            console.log(result);
            res.status(200).json({
                mensaje : 'Información personal actualizada exitosamente.',
                user : result,
                success : true
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    }    
};

exports.postEditarInformacionComplementaria = (req, res, next) => {
    var idUsuario  = req.idUsuario;

    const dni = req.body.dni;
    const fechaNacimiento = req.body.fechaNacimiento;

    if (idUsuario) {
        Usuario.findById(idUsuario)
        .then(usuario => {
            if (dni) {
                usuario.dni = dni;
            }

            if (fechaNacimiento) {
                usuario.fechaNacimiento = fechaNacimiento.toString();
            }
            
            return usuario.save();
        })
        .then(result => {
            console.log(result);
            res.status(200).json({
                mensaje : 'Información complementaria actualizada exitosamente.',
                user : result,
                success : true
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    }    
};

exports.postEditarInformacionContacto = (req, res, next) => {
    var idUsuario  = req.idUsuario;

    const correo  = req.body.correo;
    const celular = req.body.celular;

    if (idUsuario) {
        Usuario.findById(idUsuario)
        .then(usuario => {
            if (correo) {
                usuario.correo = correo;
            }

            if (celular) {
                usuario.celular = celular;
            }
            
            return usuario.save();
        })
        .then(result => {
            console.log(result);
            res.status(200).json({
                mensaje : 'Información de contacto actualizada exitosamente.',
                user : result,
                success : true
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    }    
};

exports.postCambiarPassword = (req, res, next) => {
    var idUsuario  = req.idUsuario;

    const nueva  = req.body.nueva;
    const errors = validationResult(req);

    if (idUsuario) {
        Usuario.findById(idUsuario)
        .then(usuario => {

            if (!errors.isEmpty()) {
                const error = new Error(errors.array()[0].msg);
                error.statusCode = 422;
                throw error;
            }

            bcrypt.hash(nueva, 10)
            .then(passwordCifrado => {
                usuario.password = passwordCifrado;

                return usuario.save();
            })
            .then(result => {
                console.log(result);
                res.status(200).json({
                    mensaje : 'Contraseña actualizada exitosamente.',
                    user : result,
                    success : true
                });
            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                next(err);
            });
        })        
    }
};

exports.getMisEntradas = (req, res, next) => {
    var idUsuario  = req.idUsuario;

    Usuario.findById(idUsuario)
    .then(usuarioEnc => {
        Compra.find({usuario: idUsuario})
        .populate({
            path: 'entradas',
            populate: [
                {
                    path: 'evento',
                    select: 'nombre fecha hora urlImagen lugar'
                },
                {
                    path: 'tipoEntrada',  // Poblamos el tipo de entrada
                    select: 'nombre'     // Seleccionamos el nombre del tipo de entrada
                }
            ]
        })
        .then (compras => {
            res.status(200).json({
                compras : compras
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    }) 
};
