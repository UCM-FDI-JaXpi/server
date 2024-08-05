const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/user');
const { checkNotAuthenticated } = require('../index');

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

// Creating one user
router.post('/', async (req, res) => {
    const { name, email, pwd, rep_pwd, usr_type, institution } = req.body;

    // Verify passwords match
    if (pwd !== rep_pwd) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

	// Verify usr_type is valid
	if (usr_type !== 'student' && usr_type !== 'teacher' && usr_type !== 'dev') {
		return res.status(400).json({ message: 'Invalid user type' });
	}

    // Verify students cannot register themselves
    if (usr_type === 'student') {
        return res.status(400).json({ message: 'Students cannot register themselves' });
    }

    // Verify institution is required for teachers
    if (usr_type === 'teacher' && !institution) {
        return res.status(400).json({ message: 'Institution is required for teachers' });
    }

    try {
        // Verify if the user name already exists
        const existingUser = await User.findOne({ name });
        if (existingUser)
            return res.status(400).json({ message: 'User name already exists' });

        // Verify if email is already in use
        const existingEmail = await User.findOne({ email });
        if (existingEmail)
            return res.status(400).json({ message: 'Email already in use' });

		if (!validatePassword(pwd))
			return res.status(400).json({ message: 'Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, and one number' })


        // Create user
		const salt = Number(process.env.BCRYPT_SALT);
		const password = await bcrypt.hash(pwd, salt); 	
        const newUser = new User({ name, email, password, usr_type, 
			institution: usr_type === 'teacher' ? institution : undefined });
        await newUser.save();

		res.redirect('/login');

    } catch (error) {
		res.redirect('/register');
    }
});

module.exports = router;