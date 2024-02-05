// client.js
const axios = require('axios');

const url = 'http://localhost:3000/traza-jaxpi/';

const getTrazas = async (user_id) => {
    try {
        const response = await axios.get(url + user_id);
        console.log('Respuesta:', response.data);
    } catch (error) {
        console.error('Error al realizar la petición GET:', error.message);
    }
};

getTrazas("123");
getTrazas("456");
getTrazas("456");
