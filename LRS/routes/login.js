if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const { checkNotAuthenticated } = require('../index');

router.post('/', checkNotAuthenticated, async (req, res, next) => {
    const { email, password, sessionKey } = req.body;

    try {
        let user;

        if (sessionKey) {
            // Authenticate student using session keys
            user = await User.findOne({ session_keys: sessionKey, usr_type: 'student' });
            if (user) {
                req.logIn(user, (err) => {
                    if (err) {
                        return next(err);
                    }
                    return res.status(200).json({ message: 'Authentication successful' });
                });
            } else {
                return res.status(401).json({ message: 'Authentication failed' });
            }
        } else {
            // Authenticate other users using email and password
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
                    return res.status(200).json({ message: 'Authentication successful' });
                });
            })(req, res, next);
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports = router;