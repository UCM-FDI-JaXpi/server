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
		const student = await User.findOne({ name: req.params.username });
		if (!student) {
			return res.status(404).json({ message: 'Student not found' });
		}
		res.status(200).json(student);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;