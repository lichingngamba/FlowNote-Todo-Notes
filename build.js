const fs = require('fs');
const path = require('path');

// Ensure assets/ directory exists
if (!fs.existsSync('assets')) {
  fs.mkdirSync('assets');
}

const secret = process.env.FLOWNOTE_LOGIN_PASSWORD || 'notepad';
const content = `window.FLOWNOTE_LOGIN_SECRET = ${JSON.stringify(secret)};`;
fs.writeFileSync(path.join('assets', 'auth-secret.js'), content);
console.log('Generated assets/auth-secret.js with password from env');