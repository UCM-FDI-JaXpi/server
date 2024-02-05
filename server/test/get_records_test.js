// get_records_test.js
const axios = require('axios');

const url = 'http://localhost:3000/record-jaxpi/';

const getRecords = async (user_id) => {
    try {
        const response = await axios.get(url + user_id);
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error making GET request:', error.message);
    }
};

getRecords("123");
getRecords("456");
getRecords("456");
