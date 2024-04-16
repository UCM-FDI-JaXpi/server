const express = require('express');
const router = express.Router();
const Record = require('../models/record');
const { Server } = require('socket.io');
const { checkAuthenticated, getUserType } = require('../index');

const io = new Server();

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
							parent: '$context.contextActivities.parent',
							studentName: '$actor.name'
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

// Creating one statement
router.post('/', async (req, res) => {
	const statement = req.body;
	const record = new Record(statement);

	try {
		const newRecord = await record.save();
		console.log("Traza recibida");

		io.emit('newData', newRecord);
		res.status(201).json(newRecord); // 201 means succesfully created an object
	} catch (err) {
		console.log("Error: " + err.message);
		res.status(400).json({ message: err.message });
	}
});

module.exports = router;