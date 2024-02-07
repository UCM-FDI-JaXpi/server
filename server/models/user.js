const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	registerDate: {
		type: Date,
		required: true,
		default: Date.now
	}
})

module.exports = mongoose.mongoose.model('User', userSchema);