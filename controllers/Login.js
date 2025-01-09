const Usuario = require('../models/usuario')
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const {validationResult} = require('express-validator');

exports.getIngresar = (req, res, next) => {
    let mensaje = req.flash('error');
    if (mensaje.length > 0) {
      mensaje = mensaje[0];
    } else {
      mensaje = null;
    }
    res.render('auth/ingresar', {
      path: '/ingresar',
      titulo: 'Ingresar',
      autenticado: false,
      mensajeError: mensaje
    });
};

exports.postIngresar = (req, res, next) => {
    const correo = req.body.correo;
    const password = req.body.password;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/ingresar', {
            ath: '/ingresar',
            titulo: 'Ingresar',
            autenticado: false,
            mensajeError  : errors.array()[0].msg
        })
    }

    Usuario.findOne({ correo: correo })
    .then(usuario => {
      if (!usuario) {
        req.flash('error', 'El correo no está registrado')
        return res.redirect('/ingresar');
      }
      bcrypt.compare(password, usuario.password)
        .then(hayCoincidencia => {
          if(hayCoincidencia) {
            req.session.autenticado = true;
            req.session.usuario = usuario;
            return req.session.save(err => {
              console.log(err);
              if (usuario.isAdmin) {
                res.redirect('/backoffice/listado-eventos')
              } else {
                res.redirect('/tienda')
              }              
            })
          }
          req.flash('error', 'Las credenciales son invalidas')
          res.redirect('/ingresar');
        })
        .catch(err => {
          console.log(err);
          const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
        });
    })
};

exports.postSalir = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/tienda');
  });
};

exports.getReinicio = (req, res, next) => {
  let mensaje = req.flash('error');
  if (mensaje.length > 0) {
    mensaje = mensaje[0];
  } else {
    mensaje = null;
  }
  res.render('auth/reinicio', {
    path: '/reinicio',
    titulo: 'Reinicio Password',
    mensajeError: mensaje
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

exports.getNuevoPassword = (req, res, next) => {
  const token = req.params.token;
  Usuario.findOne({ tokenReinicio: token, expiracionTokenReinicio: { $gt: Date.now() } })
    .then(usuario => {
      let mensaje = req.flash('error');
      if (mensaje.length > 0) {
        mensaje = mensaje[0];
      } else {
        mensaje = null;
      }
      res.render('auth/reinicio-password', {
        path: '/reinicio-password',
        titulo: 'Nueva Contraseña',
        mensajeError: mensaje,
        nombreUsuario: usuario.nombre,
        idUsuario: usuario._id.toString(),
        tokenPassword: token
      });
    })
    .catch(err => {
      console.log(err);
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