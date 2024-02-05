// get_users_test.js
const axios = require('axios');

const url = 'http://localhost:3000/traza-jaxpi';

const getUsers = async () => {
    try {
        const response = await axios.get(url);
        console.log('Respuesta:', response.data);
    } catch (error) {
        console.error('Error al realizar la petición GET:', error.message);
    }
};

getUsers();
