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
            mensaje   : 'Usuario registrado con éxito'
        })
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.getMiPerfil = (req, res, next) => {
    const citiesOptions = eventsHelper.getCitiesOptions();

    var autenticado = req.session.autenticado;
    var dataUser    = null;

    if (autenticado) {
        dataUser    = req.session.usuario;
    }

    Usuario.findById(dataUser._id)
    .then(usuario => {
        return res.render('tienda/profile/mi-perfil', {
            titulo        : 'Mi Perfil',
            tituloSeccion : 'Información de mi cuenta',
            opcion        : 'infoPersonal',
            autenticado   : req.session.autenticado,
            citiesOptions : citiesOptions,
            editingEvent  : false,
            usuario       : usuario,
            tieneFoto     : usuario.urlFoto
        });
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.getSeguridadPage = (req, res, next) => {
    var autenticado = req.session.autenticado;
    var dataUser    = null;

    if (autenticado) {
        dataUser    = req.session.usuario;
    }

    Usuario.findById(dataUser._id)
    .then(usuario => {
        return res.render('tienda/profile/seguridad-page', {
            titulo        : 'Mi Perfil',
            tituloSeccion : 'Seguridad y contraseña',
            opcion        : 'seguridad',
            mensajeError  : '',
            autenticado   : req.session.autenticado,
            usuario       : usuario,
            tieneFoto     : usuario.urlFoto
        });
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.getWishlistPage = (req, res, next) => {
    var autenticado = req.session.autenticado;
    var dataUser    = null;

    if (autenticado) {
        dataUser    = req.session.usuario;
    }

    Usuario.findById(dataUser._id)
    .populate('eventosFavoritos', 'nombre urlImagen')
    .then(usuario => {

        var eventosFavoritos    = [];
        var hayEventosFavoritos = false;


        if (usuario.eventosFavoritos && usuario.eventosFavoritos.length > 0) {
            eventosFavoritos    = usuario.eventosFavoritos;
            hayEventosFavoritos = true;
        }                    

        return res.render('tienda/profile/wishlist-page', {
            titulo        : 'Mi Perfil',
            tituloSeccion : 'Eventos favoritos',
            opcion        : 'wishlist',
            autenticado   : req.session.autenticado,
            usuario       : usuario,
            tieneFoto     : usuario.urlFoto,
            hayEventosFavoritos : hayEventosFavoritos,
            eventosFavoritos    : eventosFavoritos
        });
    })
};

exports.postAgregarWishlist = (req, res, next) => {
    const idEvento = req.body.idEvento;

    var autenticado = req.session.autenticado;
    var dataUser    = null;

    if (autenticado) {
        dataUser = req.session.usuario;

        Usuario.findById(dataUser._id)
        .then(usuario => {
            return usuario.agregarEventoWishlist(idEvento);
        })
        .then(result => {
            console.log(result);
            res.redirect('/tienda/detalle-evento/' + idEvento);
        });
    }    
};


exports.postRemoveWishlist = (req, res, next) => {
    const idEvento      = req.body.idEvento;
    const isFromProfile = req.body.isFromProfile;

    var autenticado = req.session.autenticado;
    var dataUser    = null;

    if (autenticado) {
        dataUser = req.session.usuario;

        Usuario.findById(dataUser._id)
        .then(usuario => {
            return usuario.eliminarEventoWishlist(idEvento);
        })
        .then(result => {
            console.log(result);
            if (isFromProfile) {
                res.redirect('/perfil/wishlist/');
            } else {
                res.redirect('/tienda/detalle-evento/' + idEvento);
            }            
        });
    }    
};

exports.postAgregarFoto = (req, res, next) => {
    const foto  = req.body.foto;

    var autenticado = req.session.autenticado;
    var dataUser    = null;

    if (autenticado) {
        dataUser = req.session.usuario;

        Usuario.findById(dataUser._id)
        .then(usuario => {            
            usuario.urlFoto = foto;
            return usuario.save();
        })
        .then(result => {          
            res.redirect('/perfil');
        })
        .catch(err => {
              console.log(err);
              const error = new Error(err);
              error.httpStatusCode = 500;
              return next(error);
        });
    }    
};

exports.postEditarInfoPersonal = (req, res, next) => {
    const nombre   = req.body.nombre;
    const apellido = req.body.apellido;
    const genero   = req.body.genero;
    const ciudad   = req.body.ciudad;

    var autenticado = req.session.autenticado;
    var dataUser    = null;

    if (autenticado) {
        dataUser = req.session.usuario;

        Usuario.findById(dataUser._id)
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
            res.redirect('/perfil');
        })
        .catch(err => {
              console.log(err);
              const error = new Error(err);
              error.httpStatusCode = 500;
              return next(error);
        });
    }    
};

exports.postEditarInformacionComplementaria = (req, res, next) => {
    const dni = req.body.dni;
    const fechaNacimiento = req.body.fechaNacimiento;    

    var autenticado = req.session.autenticado;
    var dataUser    = null;

    if (autenticado) {
        dataUser = req.session.usuario;

        Usuario.findById(dataUser._id)
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
            res.redirect('/perfil');
        })
        .catch(err => {
              console.log(err);
              const error = new Error(err);
              error.httpStatusCode = 500;
              return next(error);
        });
    }    
};

exports.postEditarInformacionContacto = (req, res, next) => {
    const correo  = req.body.correo;
    const celular = req.body.celular;

    var autenticado = req.session.autenticado;
    var dataUser    = null;

    if (autenticado) {
        dataUser = req.session.usuario;

        Usuario.findById(dataUser._id)
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
            res.redirect('/perfil');
        })
        .catch(err => {
              console.log(err);
              const error = new Error(err);
              error.httpStatusCode = 500;
              return next(error);
        });
    }    
};

exports.postCambiarPassword = (req, res, next) => {
    const nueva  = req.body.nueva;

    var autenticado = req.session.autenticado;
    var dataUser    = null;

    const errors = validationResult(req);    

    if (autenticado) {
        dataUser = req.session.usuario;

        Usuario.findById(dataUser._id)
        .then(usuario => {

            if (!errors.isEmpty()) {

                return res.status(422).render('tienda/profile/seguridad-page', {
                    titulo        : 'Mi Perfil',
                    tituloSeccion : 'Seguridad y contraseña',
                    opcion        : 'seguridad',
                    mensajeError  : errors.array()[0].msg,
                    autenticado   : req.session.autenticado,
                    usuario       : usuario,
                    tieneFoto     : usuario.urlFoto
                });
            }

            bcrypt.hash(nueva, 10)
            .then(passwordCifrado => {
                usuario.password = passwordCifrado;                        

                return usuario.save();
            })
            .then(result => {
                res.redirect('/perfil/seguridad');
            })
            .catch(err => {
                console.log(err);
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
        })        
    }
};

exports.getMisEntradas = (req, res, next) => {
    var autenticado = req.session.autenticado;
    var dataUser    = null;

    if (autenticado) {
        dataUser    = req.session.usuario;
    }

    Usuario.findById(dataUser._id)
    .then(usuarioEnc => {
        Compra.find({usuario: dataUser._id})
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
            var hayCompras = false;

            if (compras.length > 0) {
                hayCompras = true;
            }

            return res.render('tienda/profile/listado-compras', {
                titulo        : 'Mi Perfil',
                tituloSeccion : 'Mis entradas',
                opcion        : 'misEntradas',
                autenticado   : req.session.autenticado,
                usuario       : usuarioEnc,
                tieneFoto     : usuarioEnc.urlFoto,
                hayCompras    : hayCompras,
                soloVigentes  : true,
                hoy           : new Date (),
                compras       : compras
            });
        })
        .catch(err => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    }) 
};


exports.getHistorialCompras = (req, res, next) => {
    var autenticado = req.session.autenticado;
    var dataUser    = null;

    if (autenticado) {
        dataUser    = req.session.usuario;
    }

    Usuario.findById(dataUser._id)
    .then(usuarioEnc => {
        Compra.find({usuario: dataUser._id})
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
            var hayCompras = false;

            if (compras.length > 0) {
                hayCompras = true;
            }

            return res.render('tienda/profile/listado-compras', {
                titulo        : 'Mi Perfil',
                tituloSeccion : 'Mis entradas',
                opcion        : 'historialEntradas',
                autenticado   : req.session.autenticado,
                usuario       : usuarioEnc,
                tieneFoto     : usuarioEnc.urlFoto,
                hayCompras    : hayCompras,
                soloVigentes  : false,
                hoy           : new Date (),
                compras       : compras
            });
        })
        .catch(err => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    })    
};