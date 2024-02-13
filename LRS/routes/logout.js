const express = require('express');
const passport = require('passport');
const router = express.Router();

router.delete('/', (req, res, next) => {
    req.logOut(function(err) {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});

module.exports = router;