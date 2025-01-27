// Controlador para mostrar el Home
const Evento = require('../models/evento');

exports.getHomeEvents = (req, res, next) => {
    Evento
    .find()
    .then(eventos => {
        const eventsHome = eventos.length > 8 ? eventos.slice(0, 8) : eventos;

        res.status(200).json({
            eventos : eventsHome
        });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
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
