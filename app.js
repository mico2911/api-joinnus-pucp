const express    = require('express');
const path       = require('path');
const bodyParser = require('body-parser');

const mongoose     = require('mongoose');

const MONGODB_URI = 'mongodb+srv://mactperu2911:vo7OzZA73rx5LSjX@cluster0.1vyjt.mongodb.net/joinnusweb?retryWrites=true&w=majority&appName=Cluster0';

const backOfficeRoutes = require('./routes/backOffice');
const tiendaRoutes = require('./routes/tienda');
const authRoutes = require('./routes/auth');
const perfilRoutes = require('./routes/perfil');

const errorController = require('./controllers/Error');

const app = express();

app.use(bodyParser.json());

app.use('/backoffice', backOfficeRoutes);
app.use('/tienda', tiendaRoutes);
app.use('/perfil', perfilRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const mensaje = error.message;
    res.status(status).json({
        mensaje: mensaje
    });
});

mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(3000, () => {
            console.log('Se inició el servidor backend del proyecto JOINNUS...')
        });
    })
    .catch(err => {
        console.log(err);
    });
