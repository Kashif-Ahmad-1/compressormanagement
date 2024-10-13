import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
 
  Typography,
  Box,
  Link
} from "@mui/material";
import Menu from '@mui/icons-material/Menu';

import {API_BASE_URL,WHATSAPP_CONFIG} from "./../../config";
import axios from 'axios';
import './TemplateManager.css';
import Navbar from '../Admin/Navbar';
import Sidebar from '../Admin/Sidebar';



const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: 'grey',
        color: 'white',
        padding: 2,
        position: 'fixed',
        // position: 'relative',
        bottom: 0,
        width: '100%',
        textAlign: 'center',
      }}
    >
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} AEROLUBE ENGINEERS All rights reserved.
      </Typography>
      <Typography variant="body2">
        {/* <Link href="#" color="inherit" underline="hover">Privacy Policy</Link> |  */}
        <Link href="#" color="inherit" underline="hover"> Design and Developed By ❤️ @SmartITBox</Link>
      </Typography>
    </Box>
  );
};
const TemplateManager = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('template1');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [templates, setTemplates] = useState({ template1: '', template2: '' });

  const handleToggleSidebar = () => {
    setDrawerOpen((prev) => !prev);
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/templates`);
        console.log("API Response:", response.data); // Check the response here
        setTemplates(response.data);
        setMessageTemplate(response.data.template1);
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast.error("Failed to fetch templates!");
      }
    };
    fetchTemplates();
  }, []);
  

  const handleTemplateChange = (e) => {
    const newTemplate = e.target.value;
    setSelectedTemplate(newTemplate);
    setMessageTemplate(templates[newTemplate]);
  };

  const handleSaveTemplate = async () => {
    const updatedTemplates = {
      template1: selectedTemplate === 'template1' ? messageTemplate : templates.template1,
      template2: selectedTemplate === 'template2' ? messageTemplate : templates.template2,
    };
  
    await axios.post(`${API_BASE_URL}/api/templates`, updatedTemplates);
    toast.success("Template saved!");
  };
  

  return (
    <>
      <Sidebar open={drawerOpen} onClose={handleToggleSidebar} />
      <Navbar onMenuClick={handleToggleSidebar} />
     
      <div className="template-manager">
        <h1 className="header">Manage Message Template</h1>

        <div className="template-selection">
          <label className="radio-label">
            <input
              type="radio"
              value="template1"
              checked={selectedTemplate === 'template1'}
              onChange={handleTemplateChange}
            />
            Template 1 (For Service Record PDF)
          </label>
          <label className="radio-label">
            <input
              type="radio"
              value="template2"
              checked={selectedTemplate === 'template2'}
              onChange={handleTemplateChange}
            />
            Template 2 (For Quotation Record PDF)
          </label>
        </div>

        <div className="template-card">
          <textarea
            className="template-textarea"
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            placeholder="Write your message template here..."
            rows={10}
          />

          <button className="save-button" onClick={handleSaveTemplate}>Save Template</button>
        </div>

        <ToastContainer />
        
      </div>
      <Footer  />
      
    </>
  );
};

export default TemplateManager;
