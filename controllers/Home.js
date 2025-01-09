// Controlador para mostrar el Home
const { format, parseISO } = require('date-fns');
const { es } = require('date-fns/locale');
const Evento = require('../models/evento');

exports.getIndex = (req, res, next) => {
    console.log('Ruta raíz alcanzada');
    var autenticado = req.session.autenticado;
    var dataUser    = null;

    if (autenticado) {
        dataUser    = req.session.usuario;
    }

    Evento
    .find()
    .then(eventos => {
        const eventosFormateados = eventos.map(evento => {
            const fechaFormateada = format(evento.fecha, 'dd/MM/yyyy');
            return {
                ...evento.toObject(),
                fecha: fechaFormateada
            };
        });

        res.render('tienda/home', {
            ev          : eventosFormateados,
            titulo      : "Bienvenido a Joinnus",
            autenticado : req.session.autenticado,
            usuario     : dataUser,
            path        : "/"
        });
    })
    .catch(err => console.log(err));
};

exports.getEvento = (req, res) => {
    const codigoEvento = req.params.codigoEvento;
    Evento.findByCode(codigoEvento, (evento)=>{
        res.render('tienda/events/detalle-producto', {
            ev : evento,
            titulo: evento.nombre,
            path: '/eventos',
        });
    })
}

// Posiblemente se elimine
exports.getEventos = (req, res, next) => {
    Evento
    .find()
    .then(eventos => {
        res.render('lista-eventos', {
            ev     : eventos,
            titulo : "Nuestros Eventos", 
            path   : "/eventos"
        });
    })
    .catch(err => console.log(err));
};
