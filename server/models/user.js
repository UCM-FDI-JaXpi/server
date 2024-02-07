const mongoose = require('mongoose');
const { isEmail } = require('validator');

// Password validation function
function validatePassword(password) {
    // Verify its length >= 8
    if (password.length < 8)
        return false;

	// Verify it contains at least one lowercase letter
    if (!/[a-z]/.test(password))
        return false;

    // Verify it contains at least one capital letter
    if (!/[A-Z]/.test(password))
        return false;

    // Verify it contains at least one number
    if (!/\d/.test(password))
        return false;

    return true;
}

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		validate: [isEmail, 'Invalid email']
	},
	password: {
		type: String,
		required: true,
		minlength: 8,
		validate: {
            validator: validatePassword,
            message: 'Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, and one number'
        }
	},
	registerDate: {
		type: Date,
		required: true,
		default: Date.now
	}
})

module.exports = mongoose.mongoose.model('User', userSchema);