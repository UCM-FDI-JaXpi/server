// auth.js
const authenticateUser = (req, res, next) => {
    if (req.session && req.session.user_id && req.session.session_id) {
        // El usuario está autenticado correctamente
        next();
    } else {
        res.status(401).send('Autenticación fallida. Usuario no autenticado.');
    }
};

module.exports = { authenticateUser };
