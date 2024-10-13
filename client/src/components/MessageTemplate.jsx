const MessageTemplate = (pdfUrl, template) => {
  return template.replace('{pdfUrl}', pdfUrl);
};

export default MessageTemplate;



