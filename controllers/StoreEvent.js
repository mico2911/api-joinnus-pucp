// Controlador para ver el detalle de un evento desde la tienda
const Evento       = require('../models/evento');
const Usuario      = require('../models/usuario');
const Categoria    = require('../models/categoria');
const eventsHelper = require ('../scripts/helpers/eventsHelper');
const { format } = require('date-fns');

const ITEMS_POR_PAGINA = 8;

exports.getDetalleEventoTienda = async (req, res, next) => {
    const idEvento = req.params.idEvento;
    var isWishlisted = false;

    Evento.findById(idEvento).populate({
        path: 'catalogoEntradas',
        populate: {
            path: 'tipoEntrada',
            select: 'nombre'
        }
    })
    .then(evento => {
        if (!evento) {
            const error = new Error('No se encontró un evento con el id especificado.');
            error.statusCode = 404;
            throw error;
        }

        const citiesOptions   = eventsHelper.getCitiesOptions();

        const eventoCamposAdicionales = {
            ...evento.toObject(),
            fechaFormateada  : format(evento.fecha, 'dd/MM/yyyy'),
            ciudadFormateada : citiesOptions.find(city => city.id == evento.ciudad).nombre || 'Ciudad desconocida'
        };

        res.status(200).json({
            evento          : eventoCamposAdicionales,
            mensaje         : 'Se encontró el evento exitosamente.',
            isWishlisted    : isWishlisted
        });     
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
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

        res.json(
            {
                eventos                 : eventosFormateados,
                mensaje                 : 'Procesado exitosamente',
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
            }
        );        
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);        
    });
}

exports.getEventosPlp = async (req, res, next) => {
    const categorySelected = req.query.idCategoria;
    const citySelected = req.query.ciudad;
    const dateStart = req.query.dateStart;
    const dateEnd = req.query.dateEnd;

    const categorias = await Categoria.find();
    const citiesOptions = eventsHelper.getCitiesOptions();

    const filter = {};

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

        res.json(
            {
                eventos                 : eventosFormateados,
                mensaje                 : 'Procesado exitosamente',
                categoriaSeleccionada   : categorySelected,
                ciudadSeleccionada      : citySelected,
                fechaInicioSeleccionada : dateStart, 
                fechaFinSeleccionada    : dateEnd,
                paginaActual         : pagina,
                tienePaginaSiguiente : ITEMS_POR_PAGINA * pagina < nroEventos,
                tienePaginaAnterior  : pagina > 1,
                paginaSiguiente      : pagina + 1,
                paginaAnterior       : pagina - 1,
                ultimaPagina         : Math.ceil(nroEventos / ITEMS_POR_PAGINA)
            }
        );        
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);        
    });
}