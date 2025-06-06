const newsController = require('../controllers/newsControllers');
const express = require('express');
const router = express.Router();

router.post('/', newsController.insert);

module.exports = router;