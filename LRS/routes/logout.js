const express = require('express');
const passport = require('passport');
const router = express.Router();
const { checkAuthenticated } = require('../index');

router.get('/', checkAuthenticated, (req, res) => {
	res.render('logout');
});

router.post('/', checkAuthenticated, passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}));

router.delete('/', checkAuthenticated, (req, res) => {
	req.logOut();
	req.redirect('/login');
})

module.exports = router;