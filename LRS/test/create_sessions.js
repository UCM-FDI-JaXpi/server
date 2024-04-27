const mongoose = require('mongoose');

const records = [
	{
		"actor": {
			"mbox": "mailto:student1@example.com",
			"name": "Student1",
			"objectType": "Agent"
		},
		"verb": {
			"display": {
				"en-US": "completed"
			},
			"id": "http://adlnet.gov/expapi/verbs/completed"
		},
		"object": {
			"definition": {
				"description": {
					"en-US": "The Solo Hang Gliding test, consisting of a timed flight from the peak of Mount Magazine"
				},
				"extensions": {
					"http://example.com/gliderClubId": "test-435"
				},
				"name": {
					"en-US": "Hang Gliding Test"
				},
				"type": "http://adlnet.gov/expapi/activities/assessment"
			},
			"id": "http://example.com/activities/hang-gliding-test",
			"objectType": "Activity"
		},
		"timestamp": "2012-07-05T18:30:32.360Z",
		"context": {
			"contextActivities": {
				"grouping": {
					"id": "http://example.com/activities/hang-gliding-school"
				},
				"parent": {
					"id": "http://example.com/activities/hang-gliding-class-b"
				}
			},
			"extensions": {
				"http://example.com/weatherConditions": "rainy"
			},
			"instructor": {
				"mbox": "mailto:teacher1@example.com",
				"name": "Teacher1",
				"objectType": "Agent"
			}
		}
	},
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

