const admin = require('firebase-admin');
console.log(admin);
admin.initialiseApp();

const db  = admin.firestore();

module.exports = {admin,db};