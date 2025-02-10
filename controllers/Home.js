// Controlador para mostrar el Home
const moment = require('moment');
const { format } = require('date-fns');
const Evento = require('../models/evento');

exports.getHomeEvents = (req, res, next) => {
    const today = moment().toISOString(); 

    Evento
    .find({ fecha: { $gte: today } })
    .limit(2)
    .then(eventos => {

        const eventosConFechaParsed = eventos.map(evento => {
            return {
                ...evento.toObject(),
                fechaParsed: format(evento.fecha, 'dd/MM/yyyy')
            };
        });

        res.status(200).json({
            eventos : eventosConFechaParsed
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
