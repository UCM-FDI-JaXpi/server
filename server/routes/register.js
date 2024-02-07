const express = require('express');
const router = express.Router();

router.use(express.urlencoded({ extended: false })); 

router.get('/', (req, res) => {
	res.render('register');
});

// Falta validar
router.post('/', async (req, res) => {
	try {
		const hashedPW = await bcrypt.hash(req.body.password, 10);
	} catch(err) {

	}
});

module.exports = router;