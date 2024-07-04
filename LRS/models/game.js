const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    developer: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    }
})