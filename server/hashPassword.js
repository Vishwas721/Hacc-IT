// File: server/hashPassword.js
const bcrypt = require('bcryptjs');

const plainTextPassword = 'password'; // <-- Put your desired password here

bcrypt.hash(plainTextPassword, 10, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }
    console.log('Your new password hash is:');
    console.log(hash);
});