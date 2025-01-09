const jwt = require('jsonwebtoken');
const CIFRADO_LLAVE = 'llavedecifradolacualessecreta';

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
        const error = new Error('Se necesita autenticación');
        error.statusCode = 401; //Unauthorized
        throw error;
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, CIFRADO_LLAVE);
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }

    if (!decodedToken) {
        const error = new Error('Autenticación fallida');
        error.statusCode = 401; //Unauthorized
        throw error;
    }

    req.idUsuario = decodedToken.idUsuario;
    req.isAdmin   = decodedToken.isAdmin;
    next();
}