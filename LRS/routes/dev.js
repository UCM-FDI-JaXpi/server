const express = require('express');
const router = express.Router();
const Game = require('../models/game'); // Asegúrate de que la ruta sea correcta

// Funciones existentes...

// Obtener todos los juegos del desarrollador
router.get('/games', async (req, res) => {
    try {
        const games = await Game.find();
        res.json(games);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener un juego específico
router.get('/games/:id', getGame, (req, res) => {
    res.json(res.game);
});

// Crear un nuevo juego
router.post('/games', async (req, res) => {
    const game = new Game({
        name: req.body.name,
        description: req.body.description || '',
        token: generateRandomToken(),
    });
    try {
        const newGame = await game.save();
        res.status(201).json(newGame);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Actualizar un juego
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

// Eliminar un juego
router.delete('/games/:id', getGame, async (req, res) => {
    try {
        await res.game.remove();
        res.json({ message: 'Deleted Game' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware para obtener un juego específico
async function getGame(req, res, next) {
    let game;
    try {
        game = await Game.findById(req.params.id);
        if (game == null) {
            return res.status(404).json({ message: 'Cannot find game' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.game = game;
    next();
}

module.exports = router;