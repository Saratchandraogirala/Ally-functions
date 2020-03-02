const admin = require('firebase-admin');

admin.initialiseApp();

const db  = admin.firestore();

module.exports = {admin,db};