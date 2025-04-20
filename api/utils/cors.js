/**
 * Sets CORS headers for API responses
 * @param {Object} res - The response object
 */
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

/**
 * Handles CORS preflight requests
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {boolean} - True if request was handled, false otherwise
 */
function handleCors(req, res) {
  setCorsHeaders(res);
  
  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  
  return false;
}

module.exports = {
  handleCors,
  setCorsHeaders
}; 