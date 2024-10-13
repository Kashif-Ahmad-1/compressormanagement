const express = require("express");
const { saveChecklist, upload,getAllChecklists,editChecklist,deleteChecklist,downloadChecklist,getLastChecklist } = require("../controllers/checklistController");
const {authMiddleware} = require('../middleware/authMiddleware');
const router = express.Router();

// Route to save checklist and upload PDF
router.post("/",authMiddleware, upload.single('pdf'), saveChecklist);
router.get("/",authMiddleware, getAllChecklists); 
router.put("/:id", editChecklist); // New endpoint
router.delete("/:id",authMiddleware, deleteChecklist);
router.get('/checklist/download/:id',authMiddleware, downloadChecklist); 
router.get('/last', getLastChecklist); 
module.exports = router;
