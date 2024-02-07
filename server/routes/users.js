const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Getting all users
router.get('/', async (req, res) => {
	try {
		const users = await User.find(); 
		res.json(users);
	} catch {
		res.status(500).json({ message: err.message });
	}
});

// Getting one user
router.get('/:uid', getUser, (req, res) => {
	res.send(res.user);
});

// Creating one user
router.post('/', async (req, res) => {
	const record = new Record({
		user_id: req.body.user_id
	});
	try {
		const newUser = await user.save();
		res.status(201).json(newUser); // 201 means succesfully created an object
	} catch(err) {
		res.status(400).json({ message: err.message }); 
	}
});

// Updating one user
router.patch('/:uid', getUser, async (req, res) => {
	if(req.body.name != null) {
		res.user.name = req.body.name;
	}
	try {
		const updatedUser = await res.user.save();
		res.json(updatedUser);
	} catch(err) {
		res.status(400).json({ message: err.message });
	}
});

// Deleting one user
router.delete('/:uid', getUser, async (req, res) => {
	try {
		await res.user.deleteOne();
		res.json({ message: 'Deleted User' });
	} catch(err) {
		res.status(500).json({ message: err.message });
	}
});

// Middleware for specific user
async function getUser(req, res, next) {
	let user;
	try {
		user = await User.findById(req.params.uid);
		if (user == null) {
			return res.status(404).json({ message: 'Cannot find user' });
		}
	} catch(err) {
		return res.status(500).json({ message: err.message });
	}

	res.user = user;
	next();
}

module.exports = router;