const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Generate hash for password
const plainPassword = 'Pp123456';
const saltRounds = 10; // Number of salt rounds

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
	if (err) {
		console.error('Error hashing password:', err);
		return;
	}

	const users = [
		{ name: 'Student1', email: 'student1@example.com', password: hash, usr_type: 'student' },
		{ name: 'Student2', email: 'student2@example.com', password: hash, usr_type: 'student' },
		{ name: 'Student3', email: 'student3@example.com', password: hash, usr_type: 'student' },
		{ name: 'Teacher1', email: 'teacher1@example.com', password: hash, usr_type: 'teacher', institution: 'UCM' },
		{ name: 'Teacher2', email: 'teacher2@example.com', password: hash, usr_type: 'teacher', institution: 'UCM' },
		{ name: 'Dev1', email: 'dev1@example.com', password: hash, usr_type: 'dev' },
		{ name: 'Dev2', email: 'dev2@example.com', password: hash, usr_type: 'dev' }
	];

	// Connect to database
	mongoose.connect('mongodb://localhost:27017/jaxpi-db')
		.then(() => {
			console.log('Connected to database');

			// Insert users into database
			mongoose.connection.collection('users').insertMany(users, (err, result) => {
				if (err) {
					console.error('Error inserting users:', err);
					mongoose.disconnect(); // Disconnect if there is an error
					return;
				}
				console.log('Users inserted successfully:', result.ops);
				mongoose.disconnect(); // Disconnect after successful insertion
			});
		})
		.catch((err) => {
			console.error('Error connecting to database:', err);
			mongoose.disconnect(); // Disconnect if there is an error
		});
});
