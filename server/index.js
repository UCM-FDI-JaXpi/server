// index.js
require('dotenv').config()

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');

// JUST FOR LEARNING PURPOSES, to be deleted
// const users[];

// Server config
const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

// Passport config
const initializePassport = require('./passport-config');
initializePassport(passport);

// Express sessions config
app.use(session({
	secret: 'yc8v94jdij!1blfyt=v=)@70z7r1#gsu@nf5*)c_06ddy=+$9',
	resave: false,
	saveUninitialized: true,
}));

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

// Router for register
const registerRouter = require('./routes/register');
app.use('/register', registerRouter);

// ejs
app.get('/', (req, res) => {
	res.render('index.ejs', { name: 'Kyle'});
});

app.listen(port, () => {
	console.log(`The application is listening at http://localhost:${port}`);
});

// Not-handled errors controller
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something went wrong!');
});
