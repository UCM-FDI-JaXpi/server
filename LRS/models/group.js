const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
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
    teacher: {
        type: String,
        required: true,
    },
    institution: {
        type: String,
        required: true,
    },
    students: {
        type: [String],
    },
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;