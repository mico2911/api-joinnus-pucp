const request = require('supertest');
const app     = require('../app');

let server;

beforeAll(() => {
  server = app.listen(3003);
});

afterAll(() => {
  server.close();
});

// PRUEBAS PARA USAR API CON TOKEN JWT
describe ('Pruebas con autorización por token', ()=> {
    let token;
    const body = { correo : 'roman.riquelme@example.com', password : '123456Aa' };

    beforeAll(async () => {
        const loginResponse = await request(app).post('/ingresar').send(body).expect(200);

        token = loginResponse.body.token;
    });

    it('Debería acceder a la información personal con un token válido', async () => {
        const response = await request(app)
        .get('/perfil/info-account')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
            
        expect(response.body).toHaveProperty('usuario');
    });

    it('No debería acceder a la información personal sin un token', async () => {
        const response = await request(app)
        
        .get('/perfil/info-account')
        .expect(401);
            
        expect(response.body).toHaveProperty('mensaje', 'Se necesita autenticación');
    });
});
