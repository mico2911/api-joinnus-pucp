const { format }   = require('date-fns');
const eventsHelper = require ('../scripts/helpers/eventsHelper');
const Evento       = require('../models/evento');
const TipoEntrada  = require('../models/tipoEntrada');
const Categoria    = require('../models/categoria');

exports.getListaEventos = async (req, res, next) => {
    const ciudades = eventsHelper.getCitiesOptions();

    var autenticado = req.session.autenticado;
    var dataUser    = null;
    var isAdmiUser  = false;

    if (autenticado) {
        dataUser   = req.session.usuario;
        isAdmiUser = dataUser.isAdmin;
    }

    // Si no es un usuario administrador, renderizará 404
    if (!isAdmiUser) {
        return res.status(404).render('404', {
            titulo: 'Pagina No Encontrada', 
            path: ''
        });
    }

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

        res.render('backoffice/events/listar-eventos', {
            eventos       : eventosFormateados,
            citiesOptions : ciudades,
            titulo        : "Administracion de eventos", 
            tituloSeccion : 'Listado de eventos',
            opcion        : 'listadoEventos'
        });
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.getCrearEvento = (req, res, next) => {
    const horariosForm = eventsHelper.getHoursOptions();
    const ciudades = eventsHelper.getCitiesOptions();

    var autenticado = req.session.autenticado;
    var dataUser    = null;
    var isAdmiUser  = false;

    if (autenticado) {
        dataUser   = req.session.usuario;
        isAdmiUser = dataUser.isAdmin;
    }

    // Si no es un usuario administrador, renderizará 404
    if (!isAdmiUser) {
        return res.status(404).render('404', {
            titulo: 'Pagina No Encontrada', 
            path: ''
        });
    }

    Categoria
    .find()
    .then(categorias => {
        res.render('backoffice/events/detalle-evento', { 
            titulo        : 'Creación Evento', 
            tituloSeccion : 'Creación de eventos',
            opcion        : 'creacionEvento',
            categorias    : categorias,
            citiesOptions : ciudades,
            horariosForm  : horariosForm,
            modoEdicion   : false
        })
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.postCrearEvento = (req, res, next) => {
    const nombre       = req.body.nombre;
    const urlImagen    = req.body.urlImagen;
    const idCategoria = req.body.idCategoria;
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
        res.redirect('/backoffice/listado-eventos');
      })
      .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.getEditarEvento = (req, res, next) => {
    const idEvento = req.params.idEvento;
    const horariosForm = eventsHelper.getHoursOptions();
    const ciudades = eventsHelper.getCitiesOptions();

    var autenticado = req.session.autenticado;
    var dataUser    = null;
    var isAdmiUser  = false;

    if (autenticado) {
        dataUser   = req.session.usuario;
        isAdmiUser = dataUser.isAdmin;
    }

    // Si no es un usuario administrador, renderizará 404
    if (!isAdmiUser) {
        return res.status(404).render('404', {
            titulo: 'Pagina No Encontrada', 
            path: ''
        });
    }

    Categoria
    .find()
    .then(categorias => {
        Evento.findById(idEvento)
        .then(evento => {
            if (!evento) {
                return res.redirect('/backoffice/listado-eventos');
            }

            res.render('backoffice/events/detalle-evento', { 
                titulo        : 'Editar Producto',             
                tituloSeccion : 'Edición de eventos',
                opcion        : 'listadoEventos',
                categorias    : categorias,
                horariosForm  : horariosForm,
                citiesOptions : ciudades,
                evento        : evento,
                fechaEvento   : format(evento.fecha, 'yyyy-MM-dd'),
                categoriaSeleccionada : evento.categoria, 
                modoEdicion   : true,
            })
        })
        .catch(err => {
            console.log(err);
            return res.redirect('/backoffice/listado-eventos');
        });
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postEditarEvento = (req, res, next) => {
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
      res.redirect('/backoffice/listado-eventos');
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.postEliminarEvento = (req, res, next) => {
    const idEvento = req.body.idEvento;
    Evento.findByIdAndDelete(idEvento)
      .then(() => {
        res.redirect('/backoffice/listado-eventos');
      })
      .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
}; 

exports.getListaEntradasEventos = async (req, res, next) => {
    var autenticado = req.session.autenticado;
    var dataUser    = null;
    var isAdmiUser  = false;

    if (autenticado) {
        dataUser   = req.session.usuario;
        isAdmiUser = dataUser.isAdmin;
    }

    // Si no es un usuario administrador, renderizará 404
    if (!isAdmiUser) {
        return res.status(404).render('404', {
            titulo: 'Pagina No Encontrada', 
            path: ''
        });
    }

    Evento
    .find()
    .then(eventos => {
        res.render('backoffice/entradas/listar-entradas-eventos', {
            eventos       : eventos,
            titulo        : "Administracion de entradas de eventos", 
            tituloSeccion : 'Listado de entradas de eventos',
            opcion        : 'entradas'
        });
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.getCrearEntradasEventos = async (req, res, next) => {
    var autenticado = req.session.autenticado;
    var dataUser    = null;
    var isAdmiUser  = false;

    if (autenticado) {
        dataUser   = req.session.usuario;
        isAdmiUser = dataUser.isAdmin;
    }

    // Si no es un usuario administrador, renderizará 404
    if (!isAdmiUser) {
        return res.status(404).render('404', {
            titulo: 'Pagina No Encontrada', 
            path: ''
        });
    }

    Evento
    .find()
    .then(eventos => {
        TipoEntrada.find()
        .then(tiposEntradas => {
            res.render('backoffice/entradas/crear-entrada-evento', {
                eventos       : eventos,
                tiposEntradas : tiposEntradas,
                titulo        : "Creación entradas", 
                tituloSeccion : 'Creación de entradas para eventos',
                opcion        : 'creacionEntrada'
            });
        })
        .catch(err => console.log(err));        
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.postCrearEntrada = (req, res, next) => {
    const idEvento      = req.body.idEvento;
    const idTipoEntrada = req.body.idTipoEntrada;
    const precio        = req.body.precio
    const cantidad      = req.body.cantidad;

    Evento.findById(idEvento)
      .then(evento => {
        return evento.agregarEntrada(idTipoEntrada, precio, cantidad);
      })
      .then(result => {
        console.log(result);
        res.redirect('/backoffice/listado-entradas-eventos');
      });
};

exports.getEditarEntradasEventos = async (req, res, next) => {
    const idEvento = req.params.idEvento;

    var autenticado = req.session.autenticado;
    var dataUser    = null;
    var isAdmiUser  = false;

    if (autenticado) {
        dataUser   = req.session.usuario;
        isAdmiUser = dataUser.isAdmin;
    }

    // Si no es un usuario administrador, renderizará 404
    if (!isAdmiUser) {
        return res.status(404).render('404', {
            titulo: 'Pagina No Encontrada', 
            path: ''
        });
    }
    
    Evento.findById(idEvento).populate({
        path: 'catalogoEntradas',
        populate: {
            path: 'tipoEntrada',
            select: 'nombre'
        }
    })
    .then(evento => {
        if (!evento) {
            return res.redirect('/backoffice/listado-entradas-eventos');
        }

        res.render('backoffice/entradas/detalle-entradas-evento', { 
            titulo        : 'Entradas para evento',             
            tituloSeccion : 'Entradas para: ' + evento.nombre,
            opcion        : 'entradas',
            evento        : evento            
        })
    })
    .catch(err => {
        console.log(err);
        return res.redirect('/backoffice/listado-entradas-eventos');
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
        res.redirect('/backoffice/listado-entradas-eventos');
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
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
        res.redirect('/backoffice/listado-entradas-eventos');
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}; 