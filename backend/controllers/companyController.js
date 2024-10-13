const Company = require('../models/Company');

// Add a new company
exports.addCompany = async (req, res) => {
  const { clientName, contactPerson,mobileNo,clientAddress } = req.body;
  const { role } = req.user;

  if (role !== 'admin' && role !== 'accountant') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const company = new Company({ clientName, contactPerson,mobileNo,clientAddress });
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: 'Error adding company' });
  }
};

// Get all companies (for admin and accountant)
exports.getCompanies = async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'admin' && role !== 'accountant') {
      return res.status(403).json({ error: 'Access denied' });
    }
  
    try {
      const companies = await Company.find();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching companies' });
    }
  };
  

// Update a company
exports.updateCompany = async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;

  if (role !== 'admin' && role !== 'accountant') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const company = await Company.findByIdAndUpdate(id, req.body, { new: true });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Error updating company' });
  }
};

// Delete a company
exports.deleteCompany = async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;

  if (role !== 'admin' && role !== 'accountant') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const company = await Company.findByIdAndDelete(id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting company' });
  }
};



// In your searchCompaniesByName function
exports.searchCompaniesByName = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Name query parameter is required' });
  }

  try {
    const companies = await Company.find({
      clientName: { $regex: name, $options: 'i' } // Case-insensitive search
    }).limit(10);

    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
