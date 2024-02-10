// get_users_test.js
const axios = require('axios');

const url = 'http://localhost:3000/record-jaxpi';

const getUsers = async () => {
    try {
        const response = await axios.get(url);
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error making GET request:', error.message);
    }
};

getUsers();