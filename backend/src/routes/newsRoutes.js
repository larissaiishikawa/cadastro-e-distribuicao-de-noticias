const newsController = require('../controllers/newsControllers');
const express = require('express');
const router = express.Router();
const responseFormatter = require('../middlewares/responseFormatter');


router.post('/', newsController.insert, responseFormatter);

router.get('/:id', newsController.getById, responseFormatter);

router.get('/', newsController.getAll, responseFormatter);

router.put('/:id', newsController.update, responseFormatter);

router.delete('/:id', newsController.remove, responseFormatter);

module.exports = router;