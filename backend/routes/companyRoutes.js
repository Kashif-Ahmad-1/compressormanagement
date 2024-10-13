const express = require('express');
const {
  addCompany,
  updateCompany,
  deleteCompany,
  getCompanies,
  searchCompaniesByName, // Import the search function
} = require('../controllers/companyController');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, addCompany);
router.put('/:id', authMiddleware, updateCompany);
router.delete('/:id', authMiddleware, deleteCompany);
router.get('/', authMiddleware, getCompanies);

// Add the search route for companies
router.get('/search', authMiddleware, searchCompaniesByName);

module.exports = router;
