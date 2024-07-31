const express = require('express');
const GameSession = require('../models/gamesession');
const { checkAuthenticated } = require('..');
const router = express.Router();

router.get('/:key', async (req, res) => {
	try {
		const session = await GameSession.findOne({ 'students.key': req.params.key });
		if (session) {
			res.status(200).json({ exists: true });
		} else {
			res.status(404).json({ error: 'Resource not found' });
		}
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

// Use to send user data to the frontend
router.get('/session', checkAuthenticated, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;