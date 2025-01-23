const request = require('supertest');
const app     = require('../app');

let server;

beforeAll(() => {
  server = app.listen(3002);
});

afterAll(() => {
  server.close();
});

// PRUEBAS INICIO DE SESIÓN
describe ('Pruebas para iniciar sesión', ()=> {

    it('No debería iniciar sesión ante la falta de un dato requerido', async () => {
        const body = { correo : 'roman.riquelme@example.com', password : ''};

        const response = await request(app)
        .post("/ingresar").send(body)
        .expect(422);
            
        expect(response.body).toHaveProperty('mensaje', 'Llenar todos los campos del formulario');
    });

    it('No debería iniciar sesión ante un correo inexistente', async () => {
        const body = { correo : 'correo.inexistente@example.com', password : 'password'};

        const response = await request(app)
        .post("/ingresar").send(body)
        .expect(404);
            
        expect(response.body).toHaveProperty('mensaje', 'No se encontró un usuario con el correo especificado.');
    });

    it('No debería iniciar sesión ante credenciales inválidas', async () => {
        const body = { correo : 'roman.riquelme@example.com', password : 'incorrecto'};
        
        const response = await request(app)
        .post("/ingresar").send(body)
        .expect(401);
            
        expect(response.body).toHaveProperty('mensaje', 'Las credenciales ingresadas son inválidas.');
    });

    it('Inicio de sesión exitoso', async () => {
        const body = { correo : 'roman.riquelme@example.com', password : '123456Aa'};
        
        const response = await request(app)
        .post("/ingresar").send(body)
        .expect(200);
            
        expect(response.body).toHaveProperty('mensaje', 'Sesión iniciada con éxito');
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('idUsuario');
    });
});