const express = require('express');
const passport = require('passport');
const router = express.Router();
const { checkAuthenticated } = require('../index');

router.delete('/', checkAuthenticated, (req, res) => {
	req.logOut();
	res.redirect('/login');
})

module.exports = router;