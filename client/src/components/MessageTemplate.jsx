const MessageTemplate = (pdfUrl, template,companyName,MachineName, Technician,engmobileNumber) => {
  return template
      .replace('{pdfUrl}', pdfUrl)
      .replace('{Technician}', Technician)
      .replace('{machineName}', MachineName)
      .replace('{CompanyName}', companyName)
      .replace('{mobilenumber}', engmobileNumber)
};

export default MessageTemplate;
