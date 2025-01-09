const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const compraSchema = new Schema({
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    entradas: [{ type: Schema.Types.ObjectId, ref: 'Entrada' }],
    total: { type: Number, required: true },
    fechaCompra: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Compra', compraSchema);