const express = require('express');
const router = express.Router();
const Game = require('../models/game');

router.get('/', async (req, res) => {
    try {
        const games = await Game.find();
        res.json(games);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', async (req, res) => {
	try {
		const game = await Game.findOne({ id: req.params.id });
		if (!game) {
			return res.status(404).json({ message: 'Game not found' });
		}
		res.json(game);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;