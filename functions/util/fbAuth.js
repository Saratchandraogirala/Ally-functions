const { admin, db } = require('./admin')

module.exports = (req, res, next) => {
    if(req.headers.authorization && request.headers.authorization.startsWith('Bearer')){
      idToken = req.headers.authorization.split('Bearer')[1];
    }
    else{
      return res.status(403).json({error: 'Unauthorized'});
    }
  
    admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
      request.user = decodedToken;
      return db.collection('uses')
      .where('userId', '==', req.user.uid)
      .limit(1)
      .get();
    })
    .then(data => {
      req.user.handle = data.docs[0].data().handle;
      req.user.imageUrl = data.docs[0].data().imageUrl;
      return next();
    })
    .catch(err => {
      console.error('Error while verifying token', err);
      return res.status(400).json({body: 'Body must not be Empty'});
    })
  } 