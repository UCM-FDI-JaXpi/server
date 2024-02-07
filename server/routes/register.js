const express = require('express');
const router = express.Router();

router.use(express.urlencoded({ extended: false })); 

router.get('/', (req, res) => {
	res.render('register');
});

// Creating one user
router.post('/register', async (req, res) => {
    const { username, email, password, rep_password } = req.body;

    // Verify passwords match
    if (password !== rep_password) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        // Verify if the user name already exists
        const existingUser = await User.findOne({ username });
        if (existingUser)
            return res.status(400).json({ message: 'Username already exists' });

        // Verify if email is already in use
        const existingEmail = await User.findOne({ email });
        if (existingEmail)
            return res.status(400).json({ message: 'Email already in use' });

        // Create user
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json(newUser);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;