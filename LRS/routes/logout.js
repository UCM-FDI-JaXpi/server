const express = require('express');
const passport = require('passport');
const router = express.Router();

router.delete('/', (req, res, next) => {
    req.logOut(function(err) {
        if (err) {
            return next(err);
        }
        else 
            return res.status(200).json({ message: 'Logout successful' });
    });
});

module.exports = router;