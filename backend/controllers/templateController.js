
const Template = require('../models/Template');

const getTemplates = async (req, res) => {
  try {
    const template = await Template.findOne();
    if (!template) {
      const defaultTemplate = new Template({
        template1: "Hello! 📄\n\nWe have generated a new PDF document for you.\n\n📑 **Document Title**: Document Title Here\n✍️ **Description**: Brief description of what this PDF contains.\n🔗 **Download Link**: {pdfUrl}\n\nIf you have any questions, feel free to reach out!\n\nThank you! 😊",
        template2: "Hi! 👋\n\nYour requested document is ready!\n\n📄 **Title**: Your Document Title\n📋 **Details**: This is a brief description of your document.\n🔗 **Access the document**: {pdfUrl}\n\nLet us know if you need any further assistance!\n\nCheers! 😊"
      });
      await defaultTemplate.save();
      return res.json(defaultTemplate);
    }
    res.json(template);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const saveTemplates = async (req, res) => {
    try {
      const { template1, template2 } = req.body;
      let existingTemplate = await Template.findOne();
  
      if (existingTemplate) {
        // Only update the fields that are sent in the request
        if (template1 !== undefined) {
          existingTemplate.template1 = template1;
        }
        if (template2 !== undefined) {
          existingTemplate.template2 = template2;
        }
        await existingTemplate.save();
      } else {
        // If no existing template, create a new one
        existingTemplate = new Template({ template1, template2 });
        await existingTemplate.save();
      }
  
      res.json({ message: 'Templates saved successfully!' });
    } catch (error) {
      console.error("Error saving templates:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  

module.exports = {
  getTemplates,
  saveTemplates,
};
