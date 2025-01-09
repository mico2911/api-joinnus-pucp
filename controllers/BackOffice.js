const Categoria = require('../models/categoria');

exports.getListaCategorias = async (req, res, next) => {
    var isAdmiUser = req.isAdmin;

    // Si no es un usuario administrador
    if (!isAdmiUser) {
        const error = new Error('No tiene los permisos necesarios para esta función.');
        error.statusCode = 401; //Unauthorized
        return next(error);
    }
    
    Categoria
    .find()
    .then(categorias => {
        res.status(200).json({
            categorias : categorias
        });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.postCrearCategoria = async (req, res, next) => {
    var isAdmiUser = req.isAdmin;

    // Si no es un usuario administrador
    if (!isAdmiUser) {
        const error = new Error('No tiene los permisos necesarios para esta función.');
        error.statusCode = 401; //Unauthorized
        return next(error);
    }

    const nombre = req.body.nombreCategoria;

    const categoria = new Categoria({
        nombre : nombre
    });

    categoria.save()
    .then(result => {
        console.log(result);
        console.log('Categoría creada');
        res.status(200).json({
            mensaje : 'Se creó la categoría exitosamente.'
        });        
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.postEliminarCategoria = async (req, res, next) => {
    var isAdmiUser = req.isAdmin;

    // Si no es un usuario administrador
    if (!isAdmiUser) {
        const error = new Error('No tiene los permisos necesarios para esta función.');
        error.statusCode = 401; //Unauthorized
        return next(error);
    }

    const idCategoria = req.body.idCategoria;
    Categoria.findByIdAndDelete(idCategoria)
    .then(() => {        
        console.log('Categoría eliminada');
        res.status(200).json({
            mensaje : 'Se eliminó la categoría exitosamente.'
        });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};