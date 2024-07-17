const mongoose = require('mongoose');
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		unique: true,
		validate: [isEmail, 'Invalid email']
	},
	password: {
		type: String,
		minlength: 8
	},
	registerDate: {
		type: Date,
		required: true,
		default: Date.now
	},
	usr_type: {
		type: String,
		required: true
	},
	institution: {
		type: String,
	},
	session_keys: {
		type: [String],
		default: []
	}
})

module.exports = mongoose.mongoose.model('User', userSchema);