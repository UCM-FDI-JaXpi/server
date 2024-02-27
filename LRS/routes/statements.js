const express = require('express');
const router = express.Router();
const Record = require('../models/record');
const { checkAuthenticated } = require('../index');


// Getting all statements
router.get('/', checkAuthenticated, async (req, res) => {
	try {
		const statement = await Record.find(); 
		res.json(statement);
	} catch {
		res.status(500).json({ message: err.message });
	}
});

// Getting all statements of a user
router.get('/:uid', checkAuthenticated, async (req, res) => {
    const userId = req.params.uid;

    try {
        const statements = await Record.find({ user_id: userId });
        res.json(statements);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
});

// Getting one statement by its ID
router.get('/:stid', checkAuthenticated, getStatementByID, (req, res) => {
	res.send(res.statement);
});

// Creating one statement
router.post('/', async (req, res) => {
	const statement = req.body;
	const user_id = req.user._id; // obtains user id from authenticated session
	const record = new Record({
		user_id: user_id,
		statement: statement 
	});

	try {
		const newRecord = await record.save();
		res.status(201).json(newRecord); // 201 means succesfully created an object
	} catch(err) {
		res.status(400).json({ message: err.message }); 
	}
});

// Updating one statement
router.patch('/:id', checkAuthenticated, getStatementByID, async (req, res) => {
	if(req.body.name != stll) {
		res.user.name = req.body.name;
	}
	try {
		const updatedUser = await res.user.save();
		res.json(updatedUser);
	} catch(err) {
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
	} catch(err) {
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
	} catch(err) {
		return res.status(500).json({ message: err.message });
	}

	res.statement = statement;
	next();
}

module.exports = router;