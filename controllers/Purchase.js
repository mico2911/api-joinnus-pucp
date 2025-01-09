const Compra      = require('../models/compra');
const Entrada     = require('../models/entrada');
const TipoEntrada = require('../models/tipoEntrada');

// Controlador para la compra
exports.postRealizarCompra = async (req, res, next) => {
    const idEvento  = req.body.idEvento;
    const idUser    = req.body.idUser;

    let entradas = {};

    Object.keys(req.body).forEach(key => {
        if (key.startsWith('tipoEntrada-')) {
            const id = key.replace('tipoEntrada-', '');
            if (!entradas[id]) {
                entradas[id] = {};
            }
            entradas[id].tipoEntrada = req.body[key];
        }

        if (key.startsWith('qtyEntrada-')) {
            const id = key.replace('qtyEntrada-', '');
            if (!entradas[id]) {
                entradas[id] = {};
            }
            entradas[id].qtyEntrada = req.body[key];
        }

        if (key.startsWith('precioEntrada-')) {
            const id = key.replace('precioEntrada-', '');
            if (!entradas[id]) {
                entradas[id] = {};
            }
            entradas[id].precioEntrada = req.body[key];
        }
    });

    const entradasArray = Object.keys(entradas).map(id => ({
        tipoEntradaId: entradas[id].tipoEntrada,
        qtyEntrada: parseInt(entradas[id].qtyEntrada),
        precioEntrada: parseFloat(entradas[id].precioEntrada)
    }));

    let totalCompra = 0;
    const entradasGuardadas = [];

    for (let entradaData of entradasArray) {
        // Encuentra el tipo de entrada
        const tipoEntrada = await TipoEntrada.findById(entradaData.tipoEntradaId);

        if (!tipoEntrada) {
            return res.status(400).json({ message: 'Tipo de entrada no encontrado' });
        }

        if (entradaData.qtyEntrada > 0) {
            const nuevaEntrada = new Entrada({
                evento: idEvento,
                tipoEntrada: tipoEntrada._id,
                precio: entradaData.precioEntrada,
                cantidad: entradaData.qtyEntrada
            });
    
            const entradaGuardada = await nuevaEntrada.save();
            entradasGuardadas.push(entradaGuardada._id);
    
            totalCompra += entradaData.precioEntrada * entradaData.qtyEntrada;
        }        
    }

    const nuevaCompra = new Compra({
        usuario: idUser,
        entradas: entradasGuardadas,
        total: totalCompra
    });

    // Guardamos la compra
    try {
        const compraGuardada = await nuevaCompra.save();
        console.log('Compra guardada:', compraGuardada);
        // Redirigimos al detalle de la compra
        res.redirect(`/tienda/detalle-compra/${compraGuardada._id}`);
    } catch (error) {
        console.error('Error al guardar la compra:', error);
        res.status(500).json({ message: 'Error al procesar la compra' });
    }
};

exports.getDetalleCompra = (req, res, next) => {
    const idCompra = req.params.idCompra;

    var autenticado  = req.session.autenticado;
    var dataUser     = null;

    if (autenticado) {
        dataUser    = req.session.usuario;
    }

    Compra.findById(idCompra)
    .populate({
        path: 'entradas',
        populate: [
            {
                path: 'evento',
                select: 'nombre fecha hora urlImagen'
            },
            {
                path: 'tipoEntrada',  // Poblamos el tipo de entrada
                select: 'nombre'     // Seleccionamos el nombre del tipo de entrada
            }
        ]
    })
    .then (compra => {
        if (!compra) {
            return res.status(404).send('Compra no encontrada');
        }

        // Si no es propietario de esa compra
        if (!compra.usuario.equals(dataUser._id)) {
            return res.status(404).render('404', {
                titulo: 'Pagina No Encontrada', 
                path: ''
            });
        }

        const evento = compra.entradas[0].evento;
        
        res.render('tienda/compra/resumen-compra', {
            titulo      : 'Detalle de compra',
            autenticado : autenticado,
            usuario     : dataUser,
            idCompra    : idCompra,
            compra      : compra,
            evento      : evento
        })
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.getDetalleEntradasCompra = (req, res, next) => {
    const idCompra = req.params.idCompra;

    var autenticado  = req.session.autenticado;
    var dataUser     = null;

    if (autenticado) {
        dataUser    = req.session.usuario;
    }

    Compra.findById(idCompra)
    .populate({
        path: 'entradas',
        populate: [
            {
                path: 'evento',
                select: 'nombre fecha hora urlImagen'
            },
            {
                path: 'tipoEntrada',  // Poblamos el tipo de entrada
                select: 'nombre'     // Seleccionamos el nombre del tipo de entrada
            }
        ]
    })
    .then (compra => {
        if (!compra) {
            return res.status(404).send('Compra no encontrada');
        }

        // Si no es propietario de esa compra
        if (!compra.usuario.equals(dataUser._id)) {
            return res.status(404).render('404', {
                titulo: 'Pagina No Encontrada', 
                path: ''
            });
        }

        const evento = compra.entradas[0].evento;
        
        res.render('tienda/compra/detalle-entradas', {
            titulo      : 'Detalle de compra',
            autenticado : autenticado,
            usuario     : dataUser,
            idCompra    : idCompra,
            compra      : compra,
            evento      : evento
        })
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};