const newsController = require('../controllers/newsControllers');
const express = require('express');
const router = express.Router();

router.post('/', newsController.insert);

router.get('/:id', newsController.getById);

router.get('/', newsController.getAll);

router.put('/:id', newsController.update);

router.delete('/:id', newsController.remove);

module.exports = router;