const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/user');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Function to generate random username and password
function generateRandomStudent() {
    // Generate random username
    const username = 'student' + Math.random().toString(36).substring(2, 8);

    // Generate email
    const email = username + '@jaxpi.com';

    // Generate a random password with at least one lowercase letter, one uppercase letter and one digit
    const lowerCaseChar = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    const upperCaseChar = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    const digit = String.fromCharCode(Math.floor(Math.random() * 10) + 48);
    const randomChars = Math.random().toString(36).substring(2, 5);
    const password = lowerCaseChar + upperCaseChar + digit + randomChars;
    return { username, password, email };
}

// Function to generate student with given name
async function generateStudentWithName(name) {
    let username;
    let existingUser;
    do {
        // Generate username
		// No es la manera mas elegante pero es efectiva
        username = name + Math.floor(Math.random() * 1000);

        // Check if username exists
        existingUser = await User.findOne({ name: username });
    } while (existingUser);

    // Generate email
    const email = username + '@jaxpi.com';

    // Generate a random password with at least one lowercase letter, one uppercase letter and one digit
    const lowerCaseChar = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    const upperCaseChar = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    const digit = String.fromCharCode(Math.floor(Math.random() * 10) + 48);
    const randomChars = Math.random().toString(36).substring(2, 5);
    const password = lowerCaseChar + upperCaseChar + digit + randomChars;
    return { username, password, email };
}

// Function to generate a number of students
function generateStudentsFromScratch(num) {
    const students = [];
    for (let i = 0; i < num; i++) {
        students.push(generateRandomStudent());
    }
    return students;
}

// Function to generate students with given names
async function generateStudentsWithNames(names) {
    const students = [];
    for (let name of names) {
        const student = await generateStudentWithName(name);
        students.push(student);
    }
    return students;
}

// Function to save students to the database
async function saveStudents(students) {
    const salt = Number(process.env.BCRYPT_SALT);
    for (let student of students) {
        const hashedPassword = await bcrypt.hash(student.password, salt);
        const newUser = new User({
            name: student.username, email: student.email,
            password: hashedPassword, usr_type: 'student'
        });
        await newUser.save();
    }
}

// Function to export students to a .csv file
function exportToCsv(students) {
    const csvWriter = createCsvWriter({
        path: 'out.csv',
        header: [
            { id: 'email', title: 'EMAIL' },
            { id: 'password', title: 'PASSWORD' },
        ]
    });

    return csvWriter
        .writeRecords(students)
        .then(() => console.log('The CSV file was written successfully'));
}

// Route to generate students
router.post('/generate-random', async (req, res) => {
    const num = req.body.num;
    const students = generateStudentsFromScratch(num);
    await saveStudents(students);
    await exportToCsv(students);
    res.download('out.csv', function (err) {
        if (err) {
            res.status(500).send({
                message: "Could not download the file. " + err,
            });
        }
    });
});

// Route to generate students with given names
router.post('/generate-with-names', async (req, res) => {
    const names = req.body.names;
    const students = await generateStudentsWithNames(names);
    await saveStudents(students);
    await exportToCsv(students);
    res.download('out.csv', function (err) {
        if (err) {
            res.status(500).send({
                message: "Could not download the file. " + err,
            });
        }
    });
});

module.exports = router;