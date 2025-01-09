const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const entradaSchema = new Schema({
    evento: { type: Schema.Types.ObjectId, ref: 'Evento', required: true },
    tipoEntrada: { type: Schema.Types.ObjectId, ref: 'TipoEntrada', required: true },
    precio: { type: Number, required: true },
    cantidad: { type: Number, required: true },
    fechaCompra: { type: Date, default: Date.now },
    estado: { type: String, enum: ['vigente', 'expirada'], default: 'vigente' }
});

module.exports = mongoose.model('Entrada', entradaSchema);