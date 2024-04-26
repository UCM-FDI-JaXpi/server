if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { checkNotAuthenticated } = require('../index');

router.post('/', checkNotAuthenticated, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
			console.log('Error:', err);
			console.log('Passport info:', info);
            return next(err);
        }
        if (!user) {
			console.log('User not found');
            return res.status(401).json({ message: 'Authentication failed' });
        }
        req.logIn(user, (err) => {
            if (err) {
				console.log('Error:', err);
				console.log('Passport info:', info);
                return next(err);
            }
            const token = jwt.sign({ username: user.username }, process.env.SESSION_SECRET, { expiresIn: '1h' });
            return res.json({ token });
        });
    })(req, res, next);
});

module.exports = router;