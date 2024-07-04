// index.js
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const http = require('http');
const mongoose = require('mongoose');
const passport = require('passport');
const User = require('./models/user');

// Server config
const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: false }));
app.use(flash());

// CORS config
// Configuración CORS permisiva para /records y /api/session
// Se realiza a traves de middleware ya que es necesario para permitir todos los orígenes
const corsOptionsApi = (req, res, next) => {
	res.header('Access-Control-Allow-Origin', req.headers.origin);
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.header('Access-Control-Allow-Credentials', 'true');
	next();
};

// Configuración CORS para el resto de rutas
const corsOptionsRest = {
    origin: [`http://localhost:${port}`, 'http://localhost:8080'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

// Socket.io config
const server = http.createServer(app);
const io = socketIo(server, {
	cors: {
		origin: 'http://localhost:8080',
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		credentials: true,
	}
});

io.on('connection', (socket) => {
	console.log('A user connected');

	console.log('Sockets size: ', io.sockets.sockets.size);
	console.log('Sockets: ', io.sockets.sockets);

	socket.on('authenticate', (actorName) => {
		console.log('actorName:', actorName);
		socket.username = actorName;
		console.log('socket.username:', socket.username);
        console.log(`User ${actorName} authenticated`);

		console.log('Sockets size: ', io.sockets.sockets.size);
		console.log('Sockets: ', io.sockets.sockets);
	});

	socket.on('message', (data) => {
        console.log('Message received:', data);
        io.emit('message', 'Message received by server');
    });

	socket.on('disconnect', () => {
		console.log('User disconnected');
	});
});

module.exports.io = io;

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

	console.log('User not authenticated');
	res.redirect('http://localhost:8080/login');
}

function checkNotAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		res.redirect('http://localhost:8080');
	}

	return next();
}

function checkAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        const user = req.user;
        if (user.usr_type === 'admin') {
            return next();
        } else {
            return res.status(403).send('Forbidden');
        }
    } else {
        res.redirect('http://localhost:8080/login');
    }
}

function checkTeacher(req, res, next) {
	if (req.isAuthenticated()) {
		const user = req.user;
		if (user.usr_type === 'teacher') {
			return next();
		} else {
			return res.status(403).send('Forbidden');
		}
	} else {
		res.redirect('http://localhost:8080/login');
	}
}

function checkDev(req, res, next) {	
	if (req.isAuthenticated()) {
		const user = req.user;
		if (user.usr_type === 'dev') {
			return next();
		}
		else {
			return res.status(403).send('Forbidden');
		}
	}
	else {
		res.redirect('http://localhost:8080/login');
	}
}

function getUserType(req) {
    if (req.isAuthenticated()) {
        const user = req.user;
        const userType = user.usr_type;
        return userType;
    } else {
        return 'guest';
    }
}

// Use to send user data to the frontend
app.get('/api/session', corsOptionsApi, (req, res) => {
    res.json({ user: req.user });
});

module.exports.checkAuthenticated = checkAuthenticated;
module.exports.checkNotAuthenticated = checkNotAuthenticated;
module.exports.checkAdmin = checkAdmin;
module.exports.getUserType = getUserType;

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

// Router for statement petitions
const recordsRouter = require('./routes/records');
app.use('/records', corsOptionsApi, recordsRouter);
app.use(cors(corsOptionsRest));

// Router for user petitions
const usersRouter = require('./routes/users');
app.use('/admin/users', checkAdmin, usersRouter);

// Router for login
const loginRouter = require('./routes/login');
app.use('/login', loginRouter);

// Router for logout
const logoutRouter = require('./routes/logout');
app.use('/logout', logoutRouter);

// Router for register
const registerRouter = require('./routes/register');
app.use('/admin/register', checkAdmin, registerRouter);

const studentsRouter = require('./routes/students');
app.use('/students', checkTeacher, studentsRouter);

const developersRouter = require('./routes/dev');
app.use('/dev', checkDev, developersRouter);

server.listen(port, () => {
	console.log(`The application is listening at http://localhost:${port}`);
});

// Not-handled errors controller
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something went wrong!');
});
