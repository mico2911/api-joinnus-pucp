const request = require('supertest');
const app     = require('../app');

let server;

beforeAll(() => {
  server = app.listen(3002);
});

afterAll(() => {
  server.close();
});

// PRUEBAS REGISTRO DE USUARIO
describe ('Pruebas para registrar un usuario', ()=> {    

    it('No debería registrar ante la falta de un dato requerido', async () => {
        const body = { nombre: '', apellido: 'Smith', correo : 'will.smith@example.com', correoConfirmado: 'will.smith@example.com', password : '123456Aa', ciudad : '18'};

        const response = await request(app)
        .post("/registrarse").send(body)
        .expect(422);
            
        expect(response.body).toHaveProperty('mensaje', 'Nombre es obligatorio');
    });

    it('No debería registrar ante un correo con formato inválido', async () => {
        const body = { nombre: 'Will', apellido: 'Smith', correo : 'will.smith', correoConfirmado: 'will.smith@example.com', password : '123456Aa', ciudad : '18'};

        const response = await request(app)
        .post("/registrarse").send(body)
        .expect(422);
            
        expect(response.body).toHaveProperty('mensaje', 'Formato de correo electrónico inválido');
    });

    it('No debería registrar ante un correo ya inscrito', async () => {
        const body = { nombre: 'Will', apellido: 'Smith', correo : 'roman.riquelme@example.com', correoConfirmado: 'will.smith@example.com', password : '123456Aa', ciudad : '18'};
        
        const response = await request(app)
        .post("/registrarse").send(body)
        .expect(422);
            
        expect(response.body).toHaveProperty('mensaje', 'Correo ya registrado.');
    });

    it('No debería registrar ante una contraseña con menos de 5 caracteres', async () => {
        const body = { nombre: 'Will', apellido: 'Smith', correo : 'will.smith@example.com', correoConfirmado: 'will.smith@example.com', password : '123', ciudad : '18'};

        const response = await request(app)
        .post("/registrarse").send(body)
        .expect(422);
            
        expect(response.body).toHaveProperty('mensaje', 'Password inválido. Debe tener solo letras y números y no menos de 5 caracteres');
    });

    it('No debería registrar si los campos correo y correoConfirmado son diferentes', async () => {
        const body = { nombre: 'Will', apellido: 'Smith', correo : 'will.smith@example.com', correoConfirmado: 'smith@example.com', password : '123456Aa', ciudad : '18'};

        const response = await request(app)
        .post("/registrarse").send(body)
        .expect(422);
            
        expect(response.body).toHaveProperty('mensaje', 'Los correos ingresados no coinciden.');
    });

    it('Registro exitoso con datos correctos', async () => {
        const body = { nombre: 'Will', apellido: 'Smith', correo : 'will.smith@example.com', correoConfirmado: 'will.smith@example.com', password : '123456Aa', ciudad : '18'};
        
        const response = await request(app)
        .post("/registrarse").send(body)
        .expect(200);
            
        expect(response.body).toHaveProperty('mensaje', 'Usuario registrado con éxito');
    });
});