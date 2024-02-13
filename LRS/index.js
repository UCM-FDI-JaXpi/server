// index.js
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const passport = require('passport');
const User = require('./models/user');

// JUST FOR LEARNING PURPOSES, to be deleted
// const users[];

// Server config
const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.set('view engine', 'ejs');

// Express sessions config
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false
}));

// Passport config
const initializePassport = require('./passport-config');
const getUserByEmail = async (email) => {
    try {
        const user = await User.findOne({ email: email });
        return user;
    } catch (error) {
        console.error('Error finding user by email:', error);
        return null;
    }
};

const getUserById = async (id) => {
    try {
        const user = await User.findById(id);
        return user;
    } catch (error) {
        console.error('Error finding user by ID:', error);
        return null;
    }
};

initializePassport(passport, getUserByEmail, getUserById);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

function checkAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	res.redirect('login');
}

function checkNotAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		res.redirect('/');
	}

	return next();
}

module.exports.checkAuthenticated = checkAuthenticated;
module.exports.checkNotAuthenticated = checkNotAuthenticated;

// Mongo config
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;

// If cannot connect, show error
db.on('error', (error) => console.error(error));

// If connected, show message at console
db.once('open', () => console.log('Connected to Jaxpi Database'));

// Make our app accept json
app.use(express.json());

// Routers

// Router for user petitions
const recordsRouter = require('./routes/users');
app.use('/users', recordsRouter);

// Router for statement petitions
const statementsRouter = require('./routes/statements');
app.use('/statements', statementsRouter);

// Router for login
const loginRouter = require('./routes/login');
app.use('/login', loginRouter);

// Router for logout
const logoutRouter = require('./routes/logout');
app.use('/logout', logoutRouter);

// Router for register
const registerRouter = require('./routes/register');
app.use('/register', registerRouter);

// ejs
app.get('/', checkAuthenticated, (req, res) => {
	res.render('index.ejs', { name: req.user.name });
});

app.listen(port, () => {
	console.log(`The application is listening at http://localhost:${port}`);
});

// Not-handled errors controller
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something went wrong!');
});
