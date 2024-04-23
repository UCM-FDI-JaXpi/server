const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Verify if password was provided as argument
if (process.argv.length !== 3) {
  console.error('Usage: node create_admin.js <password>');
  process.exit(1);
}

// Obtain password from command line arguments
const plainPassword = process.argv[2];

// Generate hash for password
const saltRounds = 10; // Number of salt rounds

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }

  // Connect to database
mongoose.connect('mongodb://localhost:27017/dbname', {
	useNewUrlParser: true,
	useUnifiedTopology: true
  })
	.then(() => {
	  console.log('Connected to database');
  
	  const adminUser = {
		name: 'admin',
		email: 'admin@example.com',
		password: hash,
		usr_type: 'admin'
	  };
  
	  // Insert admin user into database
	  mongoose.connection.db.collection('users').insertOne(adminUser, (err, result) => {
		if (err) {
		  console.error('Error inserting admin user:', err);
		  mongoose.disconnect(); // Disconnect if there is an error
		  return;
		}
		console.log('Admin user inserted successfully:', result.ops);
		mongoose.disconnect(); // Disconnect after successful insertion
	  });
	})
	.catch((err) => {
	  console.error('Error connecting to database:', err);
	  mongoose.disconnect(); // Disconnect if there is an error
	});  
});
