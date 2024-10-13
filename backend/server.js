const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const machineRoutes = require('./routes/machineRoutes');
const companyRoutes = require('./routes/companyRoutes');
const path = require('path');
const checklistRoutes = require("./routes/checklistRoutes");
const quotationRoutes = require("./routes/quotationRoutes");
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs'); // Add this line at the top
const templateRoutes = require('./routes/templateRoutes');

dotenv.config();
const app = express();


app.use(cors({
    origin: ['http://localhost:5000', 'https://carservice-frontend-1i3i.vercel.app'], // Allow both localhost and deployed frontend
    methods: ['GET', 'POST', 'PUT', 'PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // If you need to send cookies
}));
app.options('*', cors());
app.use(express.json());
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/companies', companyRoutes);
app.use("/api/checklist", checklistRoutes);
app.use("/api/quotations", quotationRoutes);
app.use('/api/templates', templateRoutes);
// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(express.static(path.join(__dirname, '../client/build')));
// Catch-all handler for any request that doesn't match the above routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});
  
app.get('/',(req,res)=>{
  res.json({message: "Hello this is kashif"})
})
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
    console.log('Server has been successfully deployed!'); // Confirmation message
});
