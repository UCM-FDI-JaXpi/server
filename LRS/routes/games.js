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

module.exports = router;