const request = require('supertest');
const app     = require('../app');

let server;

beforeAll(() => {
  server = app.listen(3002);
});

afterAll(() => {
  server.close();
});

// PRUEBAS GESTIÓN DE EVENTOS
describe ('Pruebas para registrar un evento con un usuario sin permisos suficientes', ()=> {
    let token;
    const body = { correo : 'roman.riquelme@example.com', password : '123456Aa' };

    beforeAll(async () => {
        const loginResponse = await request(app).post('/ingresar').send(body).expect(200);

        token = loginResponse.body.token;
    });

    it('No debería poder crear el evento por falta de permisos', async () => {

        const nuevoEvento = {
            nombre      : 'Evento prueba',
            urlImagen   : 'url',
            idCategoria : '671c873b54fe469c2de4e019',
            descripcion : 'Este es el evento de prueba',
            fecha       : new Date(),
            hora        : '08:00 PM',
            lugar       : 'Teatro de prueba',
            ciudad      : '29'
        }

        const response = await request(app)
        .post('/backoffice/eventos')
        .set('Authorization', `Bearer ${token}`)
        .send(nuevoEvento)
        .expect(401);

        expect(response.body).toHaveProperty('mensaje', 'No tiene los permisos necesarios para esta función.');    
    });
    
});

describe ('Pruebas para registrar un evento con un usuario administrador', ()=> {
    let token;
    const body = { correo : 'admin@example.com', password : '123456Aa' };

    beforeAll(async () => {
        const loginResponse = await request(app).post('/ingresar').send(body).expect(200);

        token = loginResponse.body.token;
    });

    it('Registrar correctamente', async () => {
        const nuevoEvento = {
            nombre      : 'Evento prueba',
            urlImagen   : 'url',
            idCategoria : '671c873b54fe469c2de4e019',
            descripcion : 'Este es el evento de prueba',
            fecha       : new Date(),
            hora        : '08:00 PM',
            lugar       : 'Teatro de prueba',
            ciudad      : '29'
        }

        const response = await request(app)
        .post('/backoffice/eventos')
        .set('Authorization', `Bearer ${token}`)
        .send(nuevoEvento)
        .expect(200);

        expect(response.body).toHaveProperty('mensaje', 'Se registró el evento exitosamente.');
    });
    
});