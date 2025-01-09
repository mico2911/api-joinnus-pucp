// Controlador para ver el detalle de un evento desde la tienda
const Evento       = require('../models/evento');
const Usuario      = require('../models/usuario');
const Categoria    = require('../models/categoria');
const eventsHelper = require ('../scripts/helpers/eventsHelper');
const { format } = require('date-fns');

const ITEMS_POR_PAGINA = 8;

exports.getDetalleEventoTienda = async (req, res, next) => {
    const idEvento = req.params.idEvento;

    var autenticado  = req.session.autenticado;
    var dataUser     = null;
    var isWishlisted = false;

    if (autenticado) {
        dataUser    = req.session.usuario;
    }

    try {
        Evento.findById(idEvento).populate({
            path: 'catalogoEntradas',
            populate: {
                path: 'tipoEntrada',
                select: 'nombre'
            }
        })
        .then(evento => {
            if (!evento) {
                return res.status(404).render('error', {
                    mensaje: "Evento no encontrado."
                });
            }

            const fechaFormateada = format(evento.fecha, 'dd/MM/yyyy');

            if (!autenticado) {
                return res.render('tienda/events/detalle-evento', {
                    titulo          : evento.nombre,
                    evento          : evento,
                    autenticado     : false,
                    isAdmiUser      : false,
                    isWishlisted    : false,
                    usuario         : null,
                    fechaFormateada : fechaFormateada, 
                    opcion          : 'detalleEvento'
                })
            } else {
                Usuario.findById(dataUser._id)
                .then(usuario => {

                    if (usuario.eventosFavoritos && usuario.eventosFavoritos.length > 0) {
                        const index = usuario.eventosFavoritos.findIndex(evento => evento._id == idEvento);

                        isWishlisted = index > -1;                        
                    }

                    var isAdmiUser = dataUser.isAdmin;

                    return res.render('tienda/events/detalle-evento', {
                        titulo          : evento.nombre,
                        evento          : evento,
                        autenticado     : autenticado,
                        isAdmiUser      : isAdmiUser,
                        isWishlisted    : isWishlisted,
                        usuario         : dataUser,
                        fechaFormateada : fechaFormateada, 
                        opcion          : 'detalleEvento'
                    })
                })
            }        
        })
        .catch(err => {
            console.log(err);
        });
    } catch (e) {
        console.log(e);
        const error = new Error(e);
        error.httpStatusCode = 500;
        return next(error);
    }
}

exports.getListadoEventos = async (req, res, next) => {
    const searchTerm = req.query.searchTerm || '';

    const priceMin = req.query.priceMin;
    const priceMax = req.query.priceMax;
    const categorySelected = req.query.idCategoria;
    const citySelected = req.query.ciudad;
    const dateStart = req.query.dateStart;
    const dateEnd = req.query.dateEnd;

    const categorias = await Categoria.find();
    const citiesOptions = eventsHelper.getCitiesOptions();

    const filter = {};

    var autenticado  = req.session.autenticado;
    var dataUser     = null;

    if (autenticado) {
        dataUser   = req.session.usuario;
    }

    if (searchTerm) {
        filter.nombre = { $regex: searchTerm, $options: 'i' };
    }

    if (priceMin || priceMax) {
        filter.catalogoEntradas = [];

        if (priceMin) {
            filter.catalogoEntradas.push({ precio: { $gte: priceMin } });
        }

        if (priceMax) {
            filter.catalogoEntradas.push({ precio: { $lte: priceMax } });
        }
    }

    if (categorySelected) { filter.categoria = categorySelected; }


    if (citySelected) { filter.ciudad = citySelected; }

    if (dateStart || dateEnd) {
        filter.fecha = {};

        if (dateStart) {
            filter.fecha.$gte = dateStart;
        }

        if (dateEnd) {
            filter.fecha.$lte = dateEnd;
        }
    }

    const pagina = +req.query.pagina || 1;
    let nroEventos;

    Evento.find(filter).countDocuments()
    .then(nroDocs => {
        nroEventos = nroDocs;

        return Evento.find(filter)
        .skip((pagina - 1) * ITEMS_POR_PAGINA)
        .limit(ITEMS_POR_PAGINA)        
    })
    .then(eventos => {

        const eventosFormateados = eventos.map(evento => {
            const fechaFormateada = format(evento.fecha, 'dd/MM/yyyy');
            return {
                ...evento.toObject(),
                fecha: fechaFormateada
            };
        });

        const querySinPagina = { ...req.query };
        delete querySinPagina.pagina;

        res.render('tienda/events/listado-eventos', {
            eventos       : eventosFormateados,
            categorias    : categorias,
            citiesOptions : citiesOptions,
            titulo        : "Encuentra eventos", 
            opcion        : 'listadoEventos',
            autenticado   : autenticado,
            usuario       : autenticado ? dataUser : null,
            precioMinSeleccionado   : priceMin,
            precioMaxSeleccionado   : priceMax,
            categoriaSeleccionada   : categorySelected,
            ciudadSeleccionada      : citySelected,
            fechaInicioSeleccionada : dateStart, 
            fechaFinSeleccionada    : dateEnd,
            direccionActual      : '/tienda/buscar-eventos?' + new URLSearchParams(querySinPagina).toString(),
            paginaActual         : pagina,
            tienePaginaSiguiente : ITEMS_POR_PAGINA * pagina < nroEventos,
            tienePaginaAnterior  : pagina > 1,
            paginaSiguiente      : pagina + 1,
            paginaAnterior       : pagina - 1,
            ultimaPagina         : Math.ceil(nroEventos / ITEMS_POR_PAGINA)
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}