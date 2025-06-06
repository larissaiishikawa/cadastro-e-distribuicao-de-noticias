const newsController = require('../controllers/newsControllers');
const express = require('express');
const router = express.Router();

router.post('/', newsController.insert);

router.get('/:id', newsController.getById);

router.get('/', newsController.getAll);

module.exports = router;