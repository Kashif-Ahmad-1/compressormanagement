const express = require('express');
const router = express.Router();
const sparepartsController = require('./../controllers/sparepartController');

// Routes
router.post('/', sparepartsController.addSparepart);
router.get('/', sparepartsController.getSpareparts);
router.get('/:id', sparepartsController.getSparepartById);
router.put('/:id', sparepartsController.updateSparepart);
router.delete('/:id', sparepartsController.deleteSparepart);

module.exports = router;
