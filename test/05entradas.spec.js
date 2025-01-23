const request = require('supertest');
const app     = require('../app');

let server;

beforeAll(() => {
  server = app.listen(3005);
});

afterAll(() => {
  server.close();
});

// PRUEBAS GESTIÓN DE ENTRADAS
describe ('Pruebas para registrar entradas a un evento con un usuario administrador', ()=> {
    let token;
    const body = { correo : 'admin@example.com', password : '123456Aa' };

    beforeAll(async () => {
        const loginResponse = await request(app).post('/ingresar').send(body).expect(200);

        token = loginResponse.body.token;
    });

    it('Registrar correctamente', async () => {
        const nuevaEntradaEvento = {
            idEvento      : '671eba5ad70b519404075fdd',
            idTipoEntrada : '671c87fa27ef18eb2002239e',
            precio        : 100,
            cantidad      : 20
        }

        const response = await request(app)
        .post('/backoffice/evento-entradas')
        .set('Authorization', `Bearer ${token}`)
        .send(nuevaEntradaEvento)
        .expect(200);

        expect(response.body).toHaveProperty('mensaje', 'Se creó la entrada para un evento exitosamente.');  
    });
    
});