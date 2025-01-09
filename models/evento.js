const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventoSchema = new Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    categoria: { type: Schema.Types.ObjectId, ref: 'Categoria' },
    fecha: { type: Date, required: true },
    hora: { type: String, required: true },
    lugar: { type: String, required: true },
    ciudad: { type: String, required: true },
    urlImagen: { type: String, required: true },
    catalogoEntradas: [{
        tipoEntrada: { type: Schema.Types.ObjectId, ref: 'TipoEntrada', required: true },
        precio: { type: Number, required: true },
        cantidadEntradasTotal: { type: Number, required: true },
        cantidadEntradasRestantes: { type: Number, required: true }
    }],
    activo: { type: Boolean, default: true }
});

eventoSchema.methods.agregarEntrada = function(tipoEntradaId, precio, cantidadEntradasTotal) {
    const nuevaEntrada = {
        tipoEntrada: tipoEntradaId,
        precio: precio,
        cantidadEntradasTotal: cantidadEntradasTotal,
        cantidadEntradasRestantes: cantidadEntradasTotal
    };

    this.catalogoEntradas.push(nuevaEntrada);
    return this.save();
};

eventoSchema.methods.modificarEntrada = function(entradaId, precio, cantidadEntradasTotal) {
    this.catalogoEntradas.forEach(entrada => {        
        if (entrada.id.toString() === entradaId.toString()) {
            entrada.precio = precio;
            entrada.cantidadEntradasTotal = cantidadEntradasTotal;
        }
    });
    
    return this.save();
};

eventoSchema.methods.eliminarEntrada = function(entradaId) {
    const entradasActualizadas = this.catalogoEntradas.filter(entrada => {        
        return entrada.id.toString() !== entradaId.toString();
    });

    this.catalogoEntradas = entradasActualizadas;
    return this.save();
};

module.exports = mongoose.model('Evento', eventoSchema);