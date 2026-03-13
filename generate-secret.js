#!/usr/bin/env node

// Generate secure random string for SESSION_SECRET
// Usage: node generate-secret.js

const crypto = require('crypto');

console.log('\n🔐 Secure Session Secret Generator\n');
console.log('Here are some secure SESSION_SECRET options for your .env file:\n');

// Generate 3 different options
for (let i = 1; i <= 3; i++) {
    const secret = crypto.randomBytes(32).toString('hex');
    console.log(`Option ${i}:`);
    console.log(`SESSION_SECRET=${secret}`);
    console.log();
}

console.log('💡 Tips:');
console.log('- Choose one and add it to your .env file');
console.log('- Never commit .env to Git (it\'s in .gitignore)');
console.log('- Use different secrets for development and production');
console.log('- Store production secrets securely (password manager, etc.)');
console.log();
