// auth.js
const authenticateUser = (req, res, next) => {
    if (req.session && req.session.user_id && req.session.session_id) {
        // The user is authenticated successfully
        next();
    } else {
        res.status(401).send('Authentication failed. User not authenticated.');
    }
};

module.exports = { authenticateUser };
