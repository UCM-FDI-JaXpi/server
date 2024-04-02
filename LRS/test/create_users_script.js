const axios = require('axios');

const users = [
    { name: 'Student1', email: 'student1@example.com', pwd: 'Pp123456', rep_pwd: 'Pp123456', usr_type: 'estudiante' },
    { name: 'Student2', email: 'student2@example.com', pwd: 'Pp123456', rep_pwd: 'Pp123456', usr_type: 'estudiante' },
    { name: 'Student3', email: 'student3@example.com', pwd: 'Pp123456', rep_pwd: 'Pp123456', usr_type: 'estudiante' },
    { name: 'Teacher1', email: 'teacher1@example.com', pwd: 'Pp123456', rep_pwd: 'Pp123456', usr_type: 'profesor' },
    { name: 'Teacher2', email: 'teacher2@example.com', pwd: 'Pp123456', rep_pwd: 'Pp123456', usr_type: 'profesor' },
    { name: 'Dev', email: 'dev@example.com', pwd: 'Pp123456', rep_pwd: 'Pp123456', usr_type: 'dev' }
];

async function createUser(user) {
    try {
        const response = await axios.post('http://localhost:3000/register', user);
        console.log(`User ${user.name} created successfully!`);
        console.log(response.message);
    } catch (error) {
        console.error(`Error creating user ${user.name}: ${error.response.data.message}`);
    }
}

async function createUsers() {
    for (const user of users) {
        await createUser(user);
    }
}

createUsers();
