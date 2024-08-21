const express = require('express');

const router = express.Router();
const User = require('../models/user');

// GET request to retrieve students by session key
router.get('/:sessionKey', async (req, res) => {
    try {
        const student = await User.findOne({ session_keys: req.params.sessionKey });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET request to retrieve student by username
router.get('/:username', async (req, res) => {
    try {
        const student = await getStudentByUsername(req.params.username);
        res.status(200).json(student);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

async function getStudentByUsername(username) {
    try {
        const student = await User.findOne({ name: username });
        if (!student) {
            throw new Error('Student not found');
        }
        return student;
    } catch (err) {
        throw new Error(err.message);
    }
}

async function getStudentBySessionKey(sessionKey) {
	try {
		const student = await User.findOne({ session_keys: sessionKey });
		if (!student) {
			throw new Error('Student not found');
		}
		return student;
	}	catch (err) {
		throw new Error(err.message);
	}
}

module.exports = { router, getStudentBySessionKey, getStudentByUsername };