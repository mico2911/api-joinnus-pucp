const Categoria = require('../models/categoria');

exports.getMenuPrincipal = (req, res) => {
    res.render('backoffice/menu-principal', { 
        titulo: 'Modulo de administrador', 
        path: "/"
    })
};

exports.getListaCategorias = async (req, res, next) => {
    var autenticado = req.session.autenticado;
    var dataUser    = null;
    var isAdmiUser  = false;

    if (autenticado) {
        dataUser   = req.session.usuario;
        isAdmiUser = dataUser.isAdmin;
    }

    // Si no es un usuario administrador, renderizará 404
    if (!isAdmiUser) {
        return res.status(404).render('404', {
            titulo: 'Pagina No Encontrada', 
            path: ''
        });
    }
    
    Categoria
    .find()
    .then(categorias => {
        res.render('backoffice/categories/listar-categorias', { 
            titulo        : 'Categorías', 
            tituloSeccion : 'Gestión de categorías',
            opcion        : 'categorias',
            categorias    : categorias
        })
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.postCrearCategoria = async (req, res, next) => {
    const nombre = req.body.nombreCategoria;

    const categoria = new Categoria({
        nombre : nombre
    });

    categoria.save()
    .then(result => {
        console.log('Categoría creada');
        res.redirect('categorias');
      })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.postEliminarCategoria = async (req, res, next) => {
    const idCategoria = req.body.idCategoria;
    Categoria.findByIdAndDelete(idCategoria)
    .then(() => {
        res.redirect('categorias');
      })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};