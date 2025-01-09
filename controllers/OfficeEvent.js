const { format }   = require('date-fns');
const eventsHelper = require ('../scripts/helpers/eventsHelper');
const Evento       = require('../models/evento');
const TipoEntrada  = require('../models/tipoEntrada');
const Categoria    = require('../models/categoria');

exports.getListaEventos = async (req, res, next) => {
    var isAdmiUser = req.isAdmin;

    // Si no es un usuario administrador
    if (!isAdmiUser) {
        const error = new Error('No tiene los permisos necesarios para esta función.');
        error.statusCode = 401; //Unauthorized
        return next(error);
    }

    const ciudades = eventsHelper.getCitiesOptions();

    Evento
    .find().populate('categoria')
    .then(eventos => {
        const eventosFormateados = eventos.map(evento => {
            const ciudadFormateada = eventsHelper.parseCityId(ciudades, evento.ciudad);
            return {
                ...evento.toObject(),
                ciudad: ciudadFormateada
            };
        });

        res.status(200).json({
            eventos       : eventosFormateados,
            citiesOptions : ciudades
        });        
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.postCrearEvento = (req, res, next) => {
    var isAdmiUser = req.isAdmin;

    // Si no es un usuario administrador
    if (!isAdmiUser) {
        const error = new Error('No tiene los permisos necesarios para esta función.');
        error.statusCode = 401; //Unauthorized
        return next(error);
    }

    const nombre       = req.body.nombre;
    const urlImagen    = req.body.urlImagen;
    const idCategoria  = req.body.idCategoria;
    const descripcion  = req.body.descripcion;
    const fecha        = req.body.fecha;
    const hora         = req.body.hora;
    const lugar        = req.body.lugar;
    const ciudad       = req.body.ciudad;

    const evento = new Evento({
        nombre      : nombre, 
        descripcion : descripcion,
        categoria   : idCategoria,
        fecha       : fecha,
        hora        : hora,
        lugar       : lugar,
        ciudad      : ciudad,
        urlImagen   : urlImagen
    });

    evento
    .save()
    .then(result => {
        console.log('Evento Creado');
        console.log(result);
        res.status(200).json({            
            mensaje : 'Se registró el evento exitosamente.'
        }); 
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.postEditarEvento = (req, res, next) => {
    var isAdmiUser = req.isAdmin;

    // Si no es un usuario administrador
    if (!isAdmiUser) {
        const error = new Error('No tiene los permisos necesarios para esta función.');
        error.statusCode = 401; //Unauthorized
        return next(error);
    }

    const idEvento     = req.body.idEvento;
    const nombre       = req.body.nombre;
    const urlImagen    = req.body.urlImagen;
    const categoria    = req.body.idCategoria;
    const descripcion  = req.body.descripcion;
    const fecha        = req.body.fecha;
    const hora         = req.body.hora;
    const lugar        = req.body.lugar;
    const ciudad       = req.body.ciudad;

    Evento.findById(idEvento)
    .then(producto => {
        producto.nombre      = nombre;
        producto.urlImagen   = urlImagen;
        producto.categoria   = categoria;
        producto.descripcion = descripcion;
        producto.fecha       = fecha;
        producto.hora        = hora;
        producto.lugar       = lugar;
        producto.ciudad      = ciudad;
        return producto.save();
    })
    .then(result => {
        console.log('Evento actualizado');
        console.log(result);
        res.status(200).json({            
            mensaje : 'Se actualizó el evento exitosamente.'
        }); 
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.postEliminarEvento = (req, res, next) => {
    var isAdmiUser = req.isAdmin;

    // Si no es un usuario administrador
    if (!isAdmiUser) {
        const error = new Error('No tiene los permisos necesarios para esta función.');
        error.statusCode = 401; //Unauthorized
        return next(error);
    }

    const idEvento = req.body.idEvento;

    Evento.findByIdAndDelete(idEvento)
    .then(() => {
        console.log('Evento eliminado');
        res.status(200).json({            
            mensaje : 'Se eliminó el evento exitosamente.'
        }); 
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.getDetalleEvento = async (req, res, next) => {
    var isAdmiUser = req.isAdmin;

    // Si no es un usuario administrador
    if (!isAdmiUser) {
        const error = new Error('No tiene los permisos necesarios para esta función.');
        error.statusCode = 401; //Unauthorized
        return next(error);
    }

    const idEvento = req.params.idEvento;
    
    Evento.findById(idEvento).populate({
        path: 'catalogoEntradas',
        populate: {
            path: 'tipoEntrada',
            select: 'nombre'
        }
    })
    .then(evento => {
        if (!evento) {
            const error = new Error('No se ha encontrado un evento con el id especificado.');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({            
            evento : evento
        });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.postCrearEntrada = (req, res, next) => {
    var isAdmiUser = req.isAdmin;

    // Si no es un usuario administrador
    if (!isAdmiUser) {
        const error = new Error('No tiene los permisos necesarios para esta función.');
        error.statusCode = 401; //Unauthorized
        return next(error);
    }

    const idEvento      = req.body.idEvento;
    const idTipoEntrada = req.body.idTipoEntrada;
    const precio        = req.body.precio;
    const cantidad      = req.body.cantidad;

    Evento.findById(idEvento)
    .then(evento => {
        return evento.agregarEntrada(idTipoEntrada, precio, cantidad);
    })
    .then(result => {
        console.log(result);
        console.log('Entrada creada');
        res.status(200).json({            
            mensaje : 'Se creó la entrada para un evento exitosamente.'
        });        
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.postEditarEntrada = async (req, res, next) => {
    const idEvento  = req.body.idEvento;
    const idEntrada = req.body.idEntrada;
    const precio    = req.body.precio
    const cantidad  = req.body.cantidad;

    Evento.findById(idEvento)
    .then(evento => {
        return evento.modificarEntrada(idEntrada, precio, cantidad);
    })
    .then(result => {
        console.log(result);
        console.log('Entrada actualizada');
        res.status(200).json({            
            mensaje : 'Se modificó la entrada para un evento exitosamente.'
        });        
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.postEliminarEntrada = (req, res, next) => {
    const idEvento  = req.body.idEvento;
    const idEntrada = req.body.idEntrada;

    Evento.findById(idEvento)
    .then(evento => {
        return evento.eliminarEntrada(idEntrada);
    })
    .then(result => {
        console.log(result);
        console.log('Entrada eliminada');
        res.status(200).json({            
            mensaje : 'Se eliminó la entrada para un evento exitosamente.'
        });        
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}; 