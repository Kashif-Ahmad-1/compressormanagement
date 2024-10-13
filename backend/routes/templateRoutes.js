
const express = require('express');
const { getTemplates, saveTemplates } = require('../controllers/templateController');

const router = express.Router();

router.get('/', getTemplates);
router.post('/', saveTemplates);

module.exports = router;
