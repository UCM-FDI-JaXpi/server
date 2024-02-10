const express = require('express');
const router = express.Router();
const Record = require('../models/record');

// Getting all statements
router.get('/', async (req, res) => {
	try {
		const statement = await Record.find(); 
		res.json(statement);
	} catch {
		res.status(500).json({ message: err.message });
	}
});

// Getting one statement by its ID
router.get('/:stid', getStatementByID, (req, res) => {
	res.send(res.statement);
});

// Creating one statement
router.post('/', async (req, res) => {
	const { user_id, statement } = req.body;
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
router.patch('/:id', getStatementByID, async (req, res) => {
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

router.patch('/:stid', getStatementByID, async (req, res) => {
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
router.delete('/:stid', getStatementByID, async (req, res) => {
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