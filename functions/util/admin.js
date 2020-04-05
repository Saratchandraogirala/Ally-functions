const admin = require('firebase-admin');
console.log(admin);
admin.initializeApp();

const db  = admin.firestore();

module.exports = {admin,db};