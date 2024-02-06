// index.js
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const fs = require('fs');

const app = express();
const port = 3000;

// Express sessions config
app.use(express.json());
app.use(session({
	secret: 'yc8v94jdij!1blfyt=v=)@70z7r1#gsu@nf5*)c_06ddy=+$9',
	resave: false,
	saveUninitialized: true,
}));

// Mongo config
console.log(process.env);
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;

// If cannot connect, show error
db.on('error', (error) => console.error(error));

// If connected, show message at console
db.once('open', () => console.log('Connected to Jaxpi Database'));

// Route for login
app.post('/login', (req, res) => {
	const { username, password } = req.body;

	// Verify the username and password (you should store this information securely, such as in a database)
	if (username === 'user' && password === 'password') {
		// Successful authentication, set the session
		req.session.user_id = username;
		req.session.session_id = 'session123'; // You can generate a unique session ID here

		res.status(200).send('Login successful.');
	} else {
		res.status(401).send('Login failed. Incorrect username or password.');
	}
});

// Route for registration
app.post('/register', (req, res) => {
	const { username, password, repeat_password } = req.body;

	// Implement registration logic here (e.g., validate email address, etc.)

	// For example purposes only, check if passwords match
	if (password !== repeat_password) {
		res.status(400).send('Passwords do not match.');
	} else {
		// Register the user (you should store this information securely, such as in a database)
		res.status(200).send('Registration successful.');
	}
});

app.post('/record-jaxpi', (req, res) => {
	const { user_id, session_id, record } = req.body;
	let dir;
	let filepath;

	if (!user_id) {
		res.status(400).send('User_id not found');
		return;
	}
	if (!session_id) {
		res.status(400).send('Session_id not found');
		return;
	}
	if (!record) {
		res.status(400).send('Record not found');
		return;
	}

	dir = `fs/${user_id}/${session_id}`;

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	let nextFileNumber = fs.readdirSync(dir).length;

	filepath = `${dir}/record${nextFileNumber}.json`;

	fs.writeFile(filepath, JSON.stringify(record, null, 2), (err) => {
		if (err) {
			console.error('Error writing record to file: ', err);
			res.status(500).send('Internal server error while saving the record.');
		} else {
			console.log('JaXpi record received and stored at:', filepath);
			res.status(200).send('JaXpi record received and stored successfully.');
		}
	});
});

app.get('/record-jaxpi', (req, res) => {
	let dir = 'fs/';

	fs.readdir(dir, (err, users) => {
		if (err) {
			console.error('Error reading directories: ', err);
			res.status(500).send('Internal server error while getting the list of user IDs.');
			return;
		}

		const user_dir = users.filter(user => fs.statSync(`${dir}${user}`).isDirectory());

		res.json({ user_ids: user_dir });
	});
});

app.get('/record-jaxpi/:user_id', (req, res) => {
	let session_dir;
	let record_path;
	let record_data;
	let records = [];

	const user_id = req.params.user_id;
	const user_dir = `fs/${user_id}/`;

	fs.readdir(user_dir, (err, sessions) => {
		if (err) {
			console.error('Error reading directories: ', err);
			res.status(500).send(`Internal server error while getting records for user ${user_id}`);
			return;
		}

		for (const session of sessions) {
			session_dir = `${user_dir}${session}`;
			const filtered_records = fs.readdirSync(session_dir).filter(record => record.startsWith('record') && record.endsWith('.json'));

			for (const record of filtered_records) {
				record_path = `${session_dir}/${record}`;
				try {
					record_data = fs.readFileSync(record_path, 'utf-8');
					const record_parsed = JSON.parse(record_data);
					records.push(record_parsed);
				} catch (error) {
					console.error(`Error reading from ${record_path}: ${(error instanceof Error) ? error.message : error}`);
				}
			}
		}

		res.json(JSON.stringify({ records: records }, null, 2));
	});
});

app.listen(port, () => {
	console.log(`The application is listening at http://localhost:${port}`);
});

// Not-handled errors controller
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something went wrong!');
});
