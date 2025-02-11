const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt    = require('jsonwebtoken');
const {validationResult} = require('express-validator');

require('dotenv').config();

const CIFRADO_LLAVE = process.env.CIFRADO_LLAVE;

exports.postIngresar = (req, res, next) => {
    const correo = req.body.correo;
    const password = req.body.password;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg);
        error.statusCode = 422; //Unprocesable content
        throw error;
    }

    Usuario.findOne({ correo: correo })
    .then(usuario => {
        if (!usuario) {
            const error = new Error('No se encontró un usuario con el correo especificado.');
            error.statusCode = 404; //Not Found
            throw error;
        }
        bcrypt.compare(password, usuario.password)
        .then(hayCoincidencia => {
            if (!hayCoincidencia) {
                const error = new Error('Las credenciales ingresadas son inválidas.');
                error.statusCode = 401; //Unauthorized
                throw error;
            }

            const userData = {
                correo    : usuario.correo,
                idUsuario : usuario._id.toString(),
                isAdmin   : usuario.isAdmin
            }

            const token = jwt.sign(userData, CIFRADO_LLAVE, {expiresIn : '2h'});

            res.cookie('token', token, {
              sameSite: 'None'
            });

            res.status(200).json({
                mensaje   : 'Sesión iniciada con éxito',
                success   : true,
                user      : usuario,
                idUsuario : usuario._id.toString()
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.verifyToken = (req, res, next) => {
    const {token} = req.cookies;

    if (!token) {
        return res.status(401).json({ mensaje : 'Unauthorized' });
    }

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

    Usuario.findById(decodedToken.idUsuario)
    .then(usuario => {
        if (!usuario) {
            const error = new Error('No se ha encontrado un usuario con el id especificado.');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            user : usuario
        });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.postSalir = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/tienda');
  });
};

exports.postReinicio = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reinicio');
    }
    const token = buffer.toString('hex');
    Usuario.findOne({ correo: req.body.correo })
      .then(usuario => {
        if (!usuario) {
          req.flash('error', 'No se encontro usuario con dicho correo');
          return res.redirect('/reinicio');
        }
        usuario.tokenReinicio = token;
        usuario.expiracionTokenReinicio = Date.now() + 3600000; // + 1 hora
        return usuario.save();
      })
      .then(result => {
        res.redirect('/tienda');
        /*transporter.sendMail({
          to: req.body.email,
          from: 'jcabelloc@itana.pe',
          subject: 'Reinicio de Password',
          html: `
            <p>Tu has solicitado un reinicio de password</p>
            <p>Click aqui <a href="http://localhost:3000/reinicio/` + token + `">link</a> para establecer una nuevo password.</p>
          `
        });*/
      })
      .catch(err => {
        console.log(err);
      });
  });
};

exports.postNuevoPassword = (req, res, next) => {
  const nuevoPassword = req.body.password;
  const idUsuario = req.body.idUsuario;
  const tokenPassword = req.body.tokenPassword;
  let usuarioParaActualizar;

  Usuario.findOne({
    tokenReinicio: tokenPassword,
    expiracionTokenReinicio: { $gt: Date.now() },
    _id: idUsuario
  })
    .then(usuario => {
      usuarioParaActualizar = usuario;
      return bcrypt.hash(nuevoPassword, 12);
    })
    .then(hashedPassword => {
      usuarioParaActualizar.password = hashedPassword;
      usuarioParaActualizar.tokenReinicio = undefined;
      usuarioParaActualizar.expiracionTokenReinicio = undefined;
      return usuarioParaActualizar.save();
    })
    .then(result => {
      res.redirect('/ingresar');
    })
    .catch(err => {
      console.log(err);
    });
};