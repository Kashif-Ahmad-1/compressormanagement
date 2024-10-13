const express = require("express");
const { saveQuotation, upload, getAllQuotations,editQuotation,updateQuotationStatus,deleteQuotation,getQuotationSummary,getQuotationById,getAdminQuotationSummary,getQuotationsByEngineer,updateQuotationPdf } = require("../controllers/quotationController");
const {authMiddleware} = require('../middleware/authMiddleware');
const router = express.Router();
const cors = require('cors');
// Route to save quotation and upload PDF
router.post("/",authMiddleware, upload.single('pdf') ,saveQuotation);

// Route to get all quotations
router.get("/",authMiddleware, getAllQuotations); // Add this line
router.put('/:id', upload.single('pdf'),authMiddleware,editQuotation);
router.put('/:id/status',authMiddleware, updateQuotationStatus);
router.delete("/:id",authMiddleware, deleteQuotation);
router.get('/summary', authMiddleware,getQuotationSummary);
router.get('/admin/summary', authMiddleware,getAdminQuotationSummary);
router.get('/engineer/:engineerId', authMiddleware, getQuotationsByEngineer);
router.get('/edit/:id', getQuotationById);
router.patch('/:id/upload-pdf',authMiddleware, upload.single('pdf'), updateQuotationPdf);
module.exports = router;
