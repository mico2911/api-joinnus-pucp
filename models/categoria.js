const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoriaSchema = new Schema({
    nombre: { type: String, required: true, unique: true },
    descripcion: { type: String }
});

module.exports = mongoose.model('Categoria', categoriaSchema);