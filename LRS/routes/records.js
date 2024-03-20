const express = require('express');
const router = express.Router();
const Record = require('../models/record');
const { checkAuthenticated, getUserType } = require('../index');

// Getting all statements
router.get('/', checkAuthenticated, async (req, res) => {
	const userType = getUserType(req);
	if (userType === 'student') {
		try {
			const mbox = 'mailto:' + req.user.email;
			console.log(mbox);
			// Gets all statements from a student
			const statements = await Record.find({
				$or: [
					{ 'actor.name': req.user.name },
					{ 'actor.mbox': mbox }
				]
			});
			res.json(statements);
		} catch (err) {
			res.status(500).json({ message: err.message });
		}
	}
	else if (userType === 'teacher') {
		try {
			const mbox = 'mailto:' + req.user.email;
			console.log(mbox);

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
			
			res.json(statements);

		} catch (err) {
			res.status(500).json({ message: err.message });
		}
	}
	else {
		res.status(500).json({ message: 'Error finding user type' });
	}
});

// Getting one statement by its ID
router.get('/:stid', checkAuthenticated, getStatementByID, (req, res) => {
	res.send(res.statement);
});

// Creating one statement
router.post('/', async (req, res) => {
	const statement = req.body;
	const record = new Record(statement);

	try {
		const newRecord = await record.save();
		console.log("Traza recibida");
		res.status(201).json(newRecord); // 201 means succesfully created an object
	} catch (err) {
		console.log("Error: " + err.message);
		res.status(400).json({ message: err.message });
	}
});

// Updating one statement
router.patch('/:id', checkAuthenticated, getStatementByID, async (req, res) => {
	if (req.body.name != stll) {
		res.user.name = req.body.name;
	}
	try {
		const updatedUser = await res.user.save();
		res.json(updatedUser);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.patch('/:stid', checkAuthenticated, getStatementByID, async (req, res) => {
	const st = req.body.statement;
	const uid = req.body.user_id;

	if (st != null) {
		res.record.statement = st;
	}
	if (uid != null) {
		res.record.user_id = uid;
	}

	try {
		const updatedRecord = await res.record.save();
		res.json(updatedRecord);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// Deleting one statement
router.delete('/:stid', checkAuthenticated, getStatementByID, async (req, res) => {
	try {
		await res.statement.deleteOne();
		res.json({ message: 'Deleted statement' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Middleware for specific user
async function getStatementByID(req, res, next) {
	let statement;
	try {
		statement = await Record.findById(req.params.stid);
		if (statement == null) {
			return res.status(404).json({ message: 'Cannot find statement' });
		}
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}

	res.statement = statement;
	next();
}

module.exports = router;