const express = require('express');

const router = express.Router();
const User = require('../models/user');
const GameSession = require('../models/gamesession');
const Group = require('../models/group');
const Game = require('../models/game');

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

router.get('/get-game-sessions/:studentName', async (req, res) => {
    const { studentName } = req.params;
	try {
		const gamesessions = await GameSession.find({
            'students.name': studentName
        }).select(' sessionId sessionName gameId groupId createdAt students.$'); // Usamos proyeccion
        if (gamesessions.length === 0) {
            return res.status(404).json({ message: 'No game sessions found for this student' });
        }
        // Devolver a student solo datos necesarios
        const gameSessionsWithSomeDetails = await Promise.all(gamesessions.map(async (session) => {
            const game = await Game.findOne({ id: session.gameId }).select('name'); 
            const student = session.students[0];
            return {
                sessionId: session.sessionId,
                sessionName: session.sessionName,
                key: student.key,
                gameName: game ? game.name : 'Unknown Game',
                createdAt: session.createdAt
            };
        }));
		res.status(200).json(gameSessionsWithSomeDetails);
	} catch (error) {
		res.status(500).json({ message: error.message });
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
        console.log('studenttttttt',student)
		if (!student) {
			throw new Error('Student not found');
		}
		return student;
	}	catch (err) {
		throw new Error(err.message);
	}
}

module.exports = router;