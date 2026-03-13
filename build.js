const fs = require('fs');
const secret = process.env.FLOWNOTE_LOGIN_PASSWORD || 'notepad';
const content = `window.FLOWNOTE_LOGIN_SECRET = ${JSON.stringify(secret)};`;
fs.writeFileSync('assets/auth-secret.js', content);
console.log('Generated auth-secret.js');
