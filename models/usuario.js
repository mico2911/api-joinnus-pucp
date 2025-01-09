const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    tokenReinicio: String,
    expiracionTokenReinicio: Date,
    dni: { type: String, required: false },
    fechaNacimiento: { type: String, required: false },
    genero: { type: String, required: false },
    celular: { type: String, required: false },
    correo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    ciudad: { type: String, required: false },
    urlFoto: { type: String, required: false },
    eventosFavoritos: [{ type: Schema.Types.ObjectId, ref: 'Evento' }]
});

usuarioSchema.methods.agregarEventoWishlist = function(eventoId) {
    this.eventosFavoritos.push(eventoId);
    return this.save();
};

usuarioSchema.methods.eliminarEventoWishlist = function(eventoId) {    
    const wishlistActualizado = this.eventosFavoritos.filter(idEvento => {        
        return idEvento.toString() !== eventoId.toString();
    });

    this.eventosFavoritos = wishlistActualizado;
    
    return this.save();
};

module.exports = mongoose.model('Usuarios', usuarioSchema);