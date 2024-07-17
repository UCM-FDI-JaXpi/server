const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
	id: {
		type: String,
        default: () => Math.random().toString(36).substring(2, 10),
		required: true,
		unique: true,
	},
    name: {
        type: String,
        required: true,
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

module.exports = mongoose.model('Game', gameSchema);