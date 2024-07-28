const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        default: () => Math.random().toString(36).substring(2, 10),
        required: true,
        unique: true,
    },
	sessionName: {
		type: String,
	},
    gameId: {
        type: String ,
        ref: 'Game',
        required: true,
    },
    groupId: {
        type: String,
        ref: 'Group',
        required: true,
    },
    students: [{
        name: { type: String, required: true },
        key: { type: String, required: true },
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('GameSession', sessionSchema);