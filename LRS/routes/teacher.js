const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/user');
const Group = require('../models/group');
const GameSession = require('../models/gamesession');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

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
    const teacher = user.name;
    const institution = user.institution;

    try {
        const generatedStudents = generateStudentFromStudentList(students);
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
    const { groupId, gameId } = req.body;
    const csvPath = await createGameSession(groupId, gameId);
    res.download(csvPath, err => {
        if (err) {
            res.status(500).send({ message: "Could not download the file. " + err });
        }
    });
});

// Function to generate a random key
function generateRandomKey() {
    const characters = 'ABCDEFGHJKLMNOPQRSTUVWXYZ023456789';
    key = "";
	for (let i = 0; i < 6; i++) {
		token += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return token;
}

// Function to generate random username and password
function generateRandomStudent(name) {
    // Generate random username
    const username = name + Math.random().toString(36).substring(2, 8);

    return username;
}

// Function to generate a number of students
function generateStudentsFromScratch(num) {
    const students = [];
    for (let i = 0; i < num; i++) {
        students.push(generateRandomStudent("student" + i));
    }
    return students;
}

// Function to generate student with given name
async function generateStudentFromStudentList(studentList) {
    const students = [];
    for (let i = 0; i < studentList.length; i++) {
        students.push(generateRandomStudent(studentList[i]));
    }
}
async function createGameSession(groupId, gameId) {
    const group = await Group.findById(groupId).populate('students');
    const sessionKeys = group.students.map(student => {
        const sessionKey = generateRandomKey();
        User.findByIdAndUpdate(student._id, { $push: { session_keys: sessionKey } }).exec();
        return { student: student.name, sessionKey };
    });

    const newGameSession = new GameSession({
        group: groupId,
        game: gameId,
        sessionKeys: sessionKeys.map(pair => pair.sessionKey)
    });
    await newGameSession.save();

    const csvWriter = createCsvWriter({
        path: 'sessionKeys.csv',
        header: [
            { id: 'student', title: 'STUDENT' },
            { id: 'sessionKey', title: 'SESSION KEY' },
        ]
    });

    await csvWriter.writeRecords(sessionKeys);
    console.log('The CSV file was written successfully');
    return 'sessionKeys.csv';
}

module.exports = router;