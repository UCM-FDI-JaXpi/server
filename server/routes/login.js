const express = require('express');
const passport = require('passport');
const router = express.Router();
const { checkNotAuthenticated } = require('../index');

router.get('/', checkNotAuthenticated, (req, res) => {
	res.render('login');
});

router.post('/', checkNotAuthenticated, passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}));

module.exports = router;