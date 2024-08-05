const express = require('express');
const router = express.Router();
const Game = require('../models/game');

// Get all games from the developer
router.get('/games', async (req, res) => {
	try {
		const games = await Game.find({ developer: req.user.name });
		res.json(games);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Get a specific game
router.get('/games/:id', getGame, (req, res) => {
	res.json(res.game);
});

// Create a new game
router.post('/games', async (req, res) => {
	const gameID = generateRandomId();
	const gameName = req.body.name;
	const gameDesc = req.body.description || '';
	const gameDev = req.user.name;
	const gameToken = generateRandomToken(gameName);
	const game = new Game({
		id: gameID,
		name: gameName,
		description: gameDesc,
		developer: gameDev,
		token: gameToken,
	});
	try {
		const newGame = await game.save();
		res.status(201).json(newGame);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// Update a game
router.patch('/games/:id', getGame, async (req, res) => {
	if (req.body.name != null) {
		res.game.name = req.body.name;
	}
	if (req.body.description != null) {
		res.game.description = req.body.description;
	}
	try {
		const updatedGame = await res.game.save();
		res.json(updatedGame);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// Delete a game
router.delete('/games/:id', getGame, async (req, res) => {
	try {
		await res.game.deleteOne();
		res.status(200).json({ message: 'Deleted Game' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Middleware to get a specific game
async function getGame(req, res, next) {
	let game;
	try {
		game = await Game.findOne({ id: req.params.id});
		if (game == null) {
			return res.status(404).json({ message: 'Cannot find game' });
		}
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}

	res.game = game;
	next();
}

// Function to generate a random ID
function generateRandomId() {
	return Math.floor(Math.random() * Date.now()).toString(36);
}

// Function to generate a random token
function generateRandomToken() {
	const characters = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ023456789';
    token = "";
	for (let i = 0; i < 5; i++) {
		for (let j = 0; j < 5; j++) {
			token += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		if (i < 4) {
			token += '-';
		}
	}
	return token;
}

module.exports = router;