if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const passport = require('passport');
const router = express.Router();
const { checkNotAuthenticated } = require('../index');

router.post('/', checkNotAuthenticated, passport.authenticate('local', {
	successRedirect: 'http://localhost:8080',
	failureRedirect: 'http://localhost:8080/login',
	failureFlash: true
}));

module.exports = router;