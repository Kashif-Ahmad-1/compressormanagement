// tokenManager.js
let blacklistedTokens = new Set();

const addToken = (token) => {
  blacklistedTokens.add(token);
};

const isTokenBlacklisted = (token) => {
  return blacklistedTokens.has(token);
};

module.exports = {
  addToken,
  isTokenBlacklisted,
};
