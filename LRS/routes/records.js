if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Record = require('../models/record');
const Game = require('../models/game');
const GameSession = require('../models/gamesession');
const User = require('../models/user');
const Group = require('../models/group');
const { checkAuthenticated, getUserType } = require('../index');
const { io } = require('../index');

// Helper function to unhash session
async function unhashSession(sessionHash) {
    const salt = Number(process.env.SESSION_SALT);
    const sessionKeys = await GameSession.distinct('students.key');
    for (const sessionKey of sessionKeys) {
        const hashedSessionKey = crypto.createHash('sha256').update(sessionKey+salt+"que bella es la vida").digest('hex').substring(0, 6);
        if (hashedSessionKey === sessionHash) {
            return sessionKey;
        }
    }
    return null;
}

// Getting all statements
router.get('/', checkAuthenticated, async (req, res) => {
	const userType = getUserType(req);
	if (userType === 'student') {
		try {
			const mbox = 'mailto:' + req.user.email;
			// Gets all statements from a student
			const statements = await Record.find({
				$or: [
					{ 'actor.name': req.user.name },
					{ 'actor.mbox': mbox }
				]
			});

			for (const statement of statements) {
                if (statement.context && statement.context.extensions && statement.context.extensions["https://www.jaxpi.com/sessionKey"]) {
                    const sessionHash = statement.context.extensions["https://www.jaxpi.com/sessionKey"];
                    const sessionKey = await unhashSession(sessionHash);
                    if (sessionKey) {
                        statement.context.extensions["https://www.jaxpi.com/sessionKey"] = sessionKey;
                    }
                }
            }

			io.emit('studentData', statements);
			res.json(statements);
		} catch (err) {
			res.status(500).json({ message: err.message });
		}
	}
	else if (userType === 'teacher') {
		try {
			const mbox = 'mailto:' + req.user.email;

			/*
			Get all statements of a teacher grouped by context.contextActivities.parent. 
			Then it creates a field "actors", as a set ($addToSet) of all actor names, 
			and saves it in the array statements.
			*/
			const statements = await Record.aggregate([
				{
					$match: {
						$or: [
							{ 'context.instructor.name': req.user.name },
							{ 'context.instructor.mbox': mbox }
						]
					}
				},
				{
					$group: {
						_id: {
							parent: '$context.contextActivities.parent.id',
							session: {
								$getField: {
									field: "https://www.jaxpi.com/sessionKey",
									input: "$context.extensions"
								}
							}
						},
						statements: { $push: '$$ROOT' }
					}
				},
				{
					$group: {
						_id: '$_id.parent',
						actors: {
							$push: {
								session: '$_id.session',
								statements: '$statements'
							}
						}
					}
				},
				{
					$project: {
						_id: 0,
      					groupId: '$_id',
						actors: 1
					}
				}
			]);
			
			for (const statement of statements) {
				const group = await Group.findOne({ id: statement.groupId });
				statement.groupName = group.name; 
				for (const actor of statement.actors) {
					console.log(actor.session)
					const sessionKeyActor = await unhashSession(actor.session);
					actor.session = sessionKeyActor; 
					const user = await User.findOne({ session_keys: actor.session, usr_type: 'student' });
					actor.name = user.name;

					for (const record of actor.statements) {
						if (record.context && record.context.extensions && record.context.extensions["https://www.jaxpi.com/sessionKey"]) {
							const sessionHash = record.context.extensions["https://www.jaxpi.com/sessionKey"];
							const sessionKey = await unhashSession(sessionHash);
							if (sessionKey) {
								record.context.extensions["https://www.jaxpi.com/sessionKey"] = sessionKey;
							}
						}
					}
				}
            }
			io.emit('teacherData', statements);
			res.json(statements);
		} catch (err) {
			res.status(500).json({ message: err.message });
		}
	}
	else if (userType === 'dev') {
		try {
			// Generates a random 8 char pseudonym
			function generateRandomPseudonym() {
				const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
				let pseudonym = '';
				for (let i = 0; i < 8; i++) {
					pseudonym += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
				}
				return pseudonym;
			}

			const statements = await Record.aggregate([
				{
					$addFields: {
						'actor.pseudonym': generateRandomPseudonym(),
					}
				},
				{
					$unset: ["actor.name", "actor.mbox"]
				},
				{
					$group: {
						_id: {
							parent: '$context.contextActivities.parent',
							studentName: '$actor.pseudonym' // Group by pseudonym
						},
						statements: { $push: '$$ROOT' }
					}
				},
				{
					$group: {
						_id: '$_id.parent',
						actors: {
							$push: {
								studentName: '$_id.studentName',
								statements: '$statements'
							}
						}
					}
				},
				{
					$project: {
						_id: 1,
						actors: 1
					}
				}
			]);

			io.emit('devData', statements);
			res.json(statements);

		} catch (err) {
			res.status(500).json({ message: err.message });
		}
	}
	else {
		res.status(500).json({ message: 'Error finding user type' });
	}
});

// Getting all statements from a specific user
router.get('/:uname', checkAuthenticated, async (req, res) => {
	const userType = getUserType(req);
	if (userType === 'student') {
		if (uname === req.user.name) {
			try {
				// Gets all statements from a student
				const statements = await Record.find({ 'actor.name': uname });

				io.emit('studentData', statements);
				res.json(statements);
			} catch (err) {
				res.status(500).json({ message: err.message });
			}
		}
		else {
			res.status(403).json({ message: 'Forbidden' });
		}
	}
	if (userType === 'teacher') {
		if (uname === req.user.name) {
			try {
				const statements = await Record.find({
					$and: [
						{ 'context.instructor.name': req.user.name },
						{ 'actor.name': uname }
					]
				});

				io.emit('studentData', statements);
				res.json(statements);
			} catch (err) {
				res.status(500).json({ message: err.message });
			}
		}
		else {
			res.status(403).json({ message: 'Forbidden' });
		}
	}
	if (userType === 'dev') {
		res.status(403).json({ message: 'Forbidden' });
	}
});

// Post token verification middleware
const verifyToken = async (req, res, next) => {
    const token = req.headers['x-authentication'];
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }
    try {
        const game = await Game.findOne({ token: token });
        if (!game) {
            return res.status(401).json({ message: 'Token does not match any game' });
        }
        next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Creating one statement
router.post('/', verifyToken, async (req, res) => {
    const statement = req.body;
	const token = req.headers['x-authentication'];

    if (statement.context && statement.context.extensions && statement.context.extensions["https://www.jaxpi.com/sessionKey"]) {
        try {
            const sessionKey = statement.context.extensions["https://www.jaxpi.com/sessionKey"];
			const session = await GameSession.findOne({ 'students.key': sessionKey });
            if (!session) {
                return res.status(404).json({ message: 'Session not found' });
            }
			const game = await Game.findOne({ id: session.gameId });
			if (!game) {
				return res.status(404).json({ message: 'Game not found' });
			}
			if (game.token !== token) {
				return res.status(403).json({ message: 'Forbidden: Token does not match game' });
			}
            const group = await Group.findOne({ id: session.groupId });
            if (!group) {
                return res.status(404).json({ message: 'Group not found' });
            }
			const user = await User.findOne({ name: group.teacher });
			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}

            // Override context
            statement.context.instructor = { name: user.name, mbox: user.email };
			statement.context.extensions["https://www.jaxpi.com/gameId"] = game.id;
            statement.context.contextActivities.parent = { id: group.id.toString() };
            statement.context.contextActivities.grouping = { id: group.institution };

			// Emit new statement
			const newRecordUnhashed = new Record(statement);
			io.emit('newStatement', newRecordUnhashed);

            // Hash sessionKey
            const salt = Number(process.env.SESSION_SALT);
            const hashedSessionKey = crypto.createHash('sha256').update(sessionKey+salt+"que bella es la vida").digest('hex').substring(0, 6);
            statement.context.extensions["https://www.jaxpi.com/sessionKey"] = hashedSessionKey;

            // Store statement
            const newRecord = new Record(statement);
            await newRecord.save();
            
            res.status(201).json(newRecordUnhashed);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    } else {
        try {
            const newRecord = new Record(statement);
            await newRecord.save();

            io.emit('newStatement', newRecord);
            res.status(201).json(newRecord);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
});

module.exports = router;