const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/user');
const Group = require('../models/group');
const GameSession = require('../models/gamesession');

router.get('/get-groups', async (req, res) => {
	const teacher = req.user.name;
	const institution = req.user.institution;

	try {
		const groups = await Group.find({ teacher, institution });
		res.status(200).json(groups);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

router.post('/create-group-from-scratch', async (req, res) => {
	const { name, nStudents } = req.body;
	const teacher = req.user.name;
	const institution = req.user.institution;

	try {
		const generatedStudents = await generateStudentsFromScratch(nStudents);
		const newGroup = new Group({
			name,
			teacher,
			institution,
			students: generatedStudents
		});
		await newGroup.save();
		res.status(201).json(newGroup);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

router.post('/create-group-with-students', async (req, res) => {
	const name = req.body.name;
	const students = req.body.students;
	const teacher = req.user.name;
	const institution = req.user.institution;

	try {
		const generatedStudents = await generateStudentFromStudentList(students);
		const newGroup = new Group({
			name,
			teacher,
			institution,
			students: generatedStudents
		});
		await newGroup.save();
		res.status(201).json(newGroup);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

router.post('/create-game-session', async (req, res) => {
	try {
		const { groupId, gameId, gameSessionName } = req.body;
		const newSession = await createGameSession(groupId, gameId, gameSessionName);

		res.status(201).json(newSession);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Function to generate a random key
function generateRandomKey() {
	const characters = 'ABCDEFGHJKLMNOPQRSTUVWXYZ023456789';
	key = "";
	for (let i = 0; i < 6; i++) {
		key += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return key;
}

// Function to generate random username and password
function generateRandomStudent(name) {
	// Generate random username
	const username = name + Math.random().toString(36).substring(2, 8);

	return username;
}

// Function to generate a number of students
async function generateStudentsFromScratch(num) {
	const students = [];
	for (let i = 0; i < num; i++) {
		const studentName = generateRandomStudent("student" + i);
		students.push(studentName);
		const newStudent = new User({
			name: studentName,
			usr_type: 'student'
		});
		await newStudent.save();
	}
	return students;
}

// Function to generate student with given name
async function generateStudentFromStudentList(studentList) {
	const students = [];
	for (let i = 0; i < studentList.length; i++) {
		const studentName = generateRandomStudent(studentList[i]);
		students.push(studentName);
		const newStudent = new User({
			name: studentName,
			usr_type: 'student'
		});
		await newStudent.save();
	}
	return students;
}
async function createGameSession(groupId, gameId, gameSessionName) {
		const group = await Group.findOne({ id: groupId });
		if (!group) {
			throw new Error('Group not found');
		}

		const students = group.students;
		if (students.length === 0) {
			throw new Error('Group has no students');
		}

		const sessionKeys = await Promise.all(students.map(async student => {
			const key = generateRandomKey();
			const user = await User.findOne({ name: student });
			if (user) {
				user.session_keys.push(key);
				await user.save();
			}
			return {
				name: student,
				key: key
			};
		}));

		const newGameSession = await GameSession.create({
			groupId,
			gameId,
			sessionName: gameSessionName,
			students: sessionKeys
		});

		return newGameSession;
}

module.exports = router;