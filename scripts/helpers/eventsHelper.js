const Evento = require('../../models/evento');
const Categoria = require('../../models/categoria');

function obtenerEventosConCategorias() {
    return Promise.all([Evento.fetchAllEvents(), Categoria.fetchAllCategories()])
        .then(([eventos, categorias]) => {            
            const categoriasMapa = {};
            categorias.forEach(categoria => {                
                categoriasMapa[categoria.codigo] = categoria.nombre;
            });

            return eventos.map(evento => ({
                ...evento,
                nombreCategoria: categoriasMapa[evento.codCategoria] || 'Categoría desconocida'
            }));
        })
        .catch(error => {
            throw new Error('No se pudieron cargar los eventos o categorías: ' + error.message);
        });
}

function getHoursOptions() {
    return [
        '08:00 AM',
        '09:00 AM',
        '10:00 AM',
        '11:00 AM',
        '12:00 PM',
        '01:00 PM',
        '02:00 PM',
        '03:00 PM',
        '04:00 PM',
        '05:00 PM',
        '06:00 PM',
        '07:00 PM',
        '08:00 PM',
        '09:00 PM',
        '10:00 PM'
    ]
}

function getCitiesOptions() {
    const cities = [
        { id: 1, nombre: "Lima" },
        { id: 2, nombre: "Arequipa" },
        { id: 3, nombre: "Ayacucho" },
        { id: 4, nombre: "Apurimac" },
        { id: 5, nombre: "Callao" },
        { id: 6, nombre: "Chachapoyas" },
        { id: 7, nombre: "Chiclayo" },
        { id: 8, nombre: "Chimbote" },
        { id: 9, nombre: "Huacho" },
        { id: 10, nombre: "Huánuco" },
        { id: 11, nombre: "Huancayo" },
        { id: 12, nombre: "Ica" },
        { id: 13, nombre: "Iquitos" },
        { id: 14, nombre: "Jaen" },
        { id: 15, nombre: "Juliaca" },
        { id: 16, nombre: "Julcan" },
        { id: 17, nombre: "Junín" },
        { id: 18, nombre: "Loreto" },
        { id: 19, nombre: "Moquegua" },
        { id: 20, nombre: "Oxapampa" },
        { id: 21, nombre: "Pacasmayo" },
        { id: 22, nombre: "Piura" },
        { id: 23, nombre: "Pucallpa" },
        { id: 24, nombre: "Puno" },
        { id: 25, nombre: "Tacna" },
        { id: 26, nombre: "Tarapoto" },
        { id: 27, nombre: "Tumbes" },
        { id: 28, nombre: "Trujillo" },
        { id: 29, nombre: "Cusco" },
        { id: 30, nombre: "Cajamarca" }
    ];

    return cities;
}

function parseCityId (cities, cityId) {
    var citySearched = cities.find(city => city.id == cityId);

    if (citySearched) {
        return citySearched.nombre;
    }

    return 'Ciudad no encontrada';
}

module.exports = {
    obtenerEventosConCategorias : obtenerEventosConCategorias,
    getHoursOptions             : getHoursOptions,
    getCitiesOptions            : getCitiesOptions,
    parseCityId                 : parseCityId
};