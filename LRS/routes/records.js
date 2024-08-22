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
const { getStudentByUsername } = require('./student');

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
			const group = await Group.findOne({ students: { $in: [req.user.name] } }, { id:1, name: 1, teacher: 1, _id: 0 }); // `group` aquí será un objeto con los campos id, name y teacher
			if (group){ // Agrupa los statements del estudiante usando el groupId y el teacherName
                const statements = await Record.aggregate([
                    {
                        $match: {
                            'context.contextActivities.parent.id': group.id,
                            'context.instructor.name': group.teacher
                        }
                    },
					{
						$group: {
							_id: {
								parent: '$context.contextActivities.parent.id',
								sessionKey: {
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
									sessionKey: '$_id.sessionKey',
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
					statement.groupName = group.name;
					statement.teacherName = group.teacher;

					for (const actor of statement.actors) {
						const sessionKeyActor = await unhashSession(actor.sessionKey);
						actor.sessionKey = sessionKeyActor;
						
						const user = await User.findOne({ session_keys: sessionKeyActor, usr_type: 'student' }, { name: 1, _id: 0 });
						if (user) {
							actor.name = user.name;
						} else {
							return res.status(404).json({ message: 'User not found' });
						}
	
						for (const record of actor.statements) {
							if (record.context && record.context.extensions && record.context.extensions["https://www.jaxpi.com/sessionKey"]) {
								const sessionHash = record.context.extensions["https://www.jaxpi.com/sessionKey"];
								const sessionKey = await unhashSession(sessionHash);
								if (sessionKey) {
									record.context.extensions["https://www.jaxpi.com/sessionKey"] = sessionKey;
								}
							}
						}
						actor.gameId = actor.statements[0].context.extensions["https://www.jaxpi.com/gameId"];
						const game = await Game.findOne({ id: actor.gameId }, { name: 1, _id: 0 });
						if (game){
							actor.gameName = game.name;
						} else {
							return res.status(404).json({ message: 'Game not found' });
						}
						
						actor.sessionId = actor.statements[0].context.extensions["https://www.jaxpi.com/sessionId"];
						const gameSession = await GameSession.findOne({ sessionId: actor.sessionId  }, { sessionName: 1, _id: 0 });
						if (gameSession){
							actor.sessionName = gameSession.sessionName;
						} else {
							return res.status(404).json({ message: 'Game session not found' });
						}
					}
					statement.actors = statement.actors.filter(actor => actor.name === req.user.name); // Nos quedamps con los que se llamen req.user.name
				}
				io.emit('studentData', statements);
				res.json(statements);
			} else {
				return res.status(404).json({ message: 'Group not found' });
			}
		} catch (err) {
			res.status(500).json({ message: err.message });
		}
	}
	else if (userType === 'teacher') {
		try {
			/*
			Get all statements of a teacher grouped by context.contextActivities.parent. 
			Then it creates a field "actors", as a set ($addToSet) of all actor names, 
			and saves it in the array statements.
			*/
			const statements = await Record.aggregate([
				{
					$match: {
						$or: [
							{ 'context.instructor.name': req.user.name }
						]
					}
				},
				{
					$group: {
						_id: {
							parent: '$context.contextActivities.parent.id',
							sessionKey: {
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
								sessionKey: '$_id.sessionKey',
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
				// Consulta con proyección para obtener solo el campo `name`
				const group = await Group.findOne({ id: statement.groupId }, { name: 1, _id: 0 }); // `group` aquí será un objeto con solo el campo `name`
				if (group){
					statement.groupName = group.name;
				} else {
					return res.status(404).json({ message: 'Group not found' });
				}

				for (const actor of statement.actors) {
					const sessionKeyActor = await unhashSession(actor.sessionKey);
					actor.sessionKey = sessionKeyActor;
					
					const user = await User.findOne({ session_keys: sessionKeyActor, usr_type: 'student' }, { name: 1, _id: 0 });
					if (user) {
						actor.name = user.name;
					} else {
						return res.status(404).json({ message: 'User not found' });
					}

					for (const record of actor.statements) {
						if (record.context && record.context.extensions && record.context.extensions["https://www.jaxpi.com/sessionKey"]) {
							const sessionHash = record.context.extensions["https://www.jaxpi.com/sessionKey"];
							const sessionKey = await unhashSession(sessionHash);
							if (sessionKey) {
								record.context.extensions["https://www.jaxpi.com/sessionKey"] = sessionKey;
							}
						}
					}
					actor.gameId = actor.statements[0].context.extensions["https://www.jaxpi.com/gameId"];
					const game = await Game.findOne({ id: actor.gameId }, { name: 1, _id: 0 });
					if (game){
						actor.gameName = game.name;
					} else {
						return res.status(404).json({ message: 'Game not found' });
					}
					
					actor.sessionId = actor.statements[0].context.extensions["https://www.jaxpi.com/sessionId"];
					const gameSession = await GameSession.findOne({ sessionId: actor.sessionId  }, { sessionName: 1, _id: 0 });
					if (gameSession){
						actor.sessionName = gameSession.sessionName;
					} else {
						return res.status(404).json({ message: 'Game session not found' });
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
			statement.context.extensions["https://www.jaxpi.com/sessionId"] = session.sessionId;
            statement.context.contextActivities.parent = { id: group.id.toString() };
            statement.context.contextActivities.grouping = { id: group.institution };

            // Hash sessionKey
            const salt = Number(process.env.SESSION_SALT);
            const hashedSessionKey = crypto.createHash('sha256').update(sessionKey+salt+"que bella es la vida").digest('hex').substring(0, 6);
            statement.context.extensions["https://www.jaxpi.com/sessionKey"] = hashedSessionKey;

            // Store statement
            const newRecord = new Record(statement);
            await newRecord.save();

			// To front
			statement.context.extensions["https://www.jaxpi.com/sessionKey"] = sessionKey;
			statement.context.extensions["https://www.jaxpi.com/gameName"] = game.name;
			statement.context.extensions["https://www.jaxpi.com/sessionName"] = session.sessionName;

			const student = await User.findOne({ session_keys: sessionKey }, { name: 1, _id: 0 });
			if (!student) {
				return res.status(404).json({ message: 'Student not found' });
			}
			statement.context.extensions["https://www.jaxpi.com/studentName"] = student.name;

            // Emit new statement
			// console.log(statement);
			console.log("Group name del statement posteado: ", group.name);
			const newRecordUnhashed = new Record(statement);
			io.emit('newStatement', newRecordUnhashed);

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