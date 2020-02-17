// import {app} from "firebase-functions";

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express')();
const app = express();
var onRequest = require('request');
const firebase  = require('firebase');
firebase.initialiseApp();
const db  = admin.firestore();
let token, userId;


const config = {
    apiKey: "AIzaSyC7g52HFfcVqbEW6p_pQd64AzbPhJr6Gzk",
    authDomain: "ally-63631.firebaseapp.com",
    databaseURL: "https://ally-63631.firebaseio.com",
    projectId: "ally-63631",
    storageBucket: "ally-63631.appspot.com",
    messagingSenderId: "495180132018",
    appId: "1:495180132018:web:a7179c40441c338d0963ab",
    measurementId: "G-RX662B05NK"
};

admin.initialiseApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello World!");
 });

app.get('/screams', (req, res) =>{
  db
  .collection('screams')
  .orderBy('createdAt','desc')
  .get()
  .then((data) => {
    let screams = [];
    data.forEach((doc) => {
      screams.push({
      screamId: doc.id,
      body: doc.data().body,
      userHandle: doc.data.userHandle,
      createdAt: doc.data.createdAt
      })
    });
    return res.json(screams );
  })
  .catch((err) => console.error());
})

const FBAuth = (req, res, next) => {
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
    return next();
  })
  .catch(err => {
    console.error('Error while verifying token', err);
    return res.status(400).json({body: 'Body must not be Empty'});
  })
}


 app.post('/scream', (request, response) => {
  if(request.method !=='POST'){
    return res.status(400).json({error: 'Method not allowed'})
  }
  
  const newScream = { 
   body: request.body.body,
   userHandle: request.body.userHandle, 
   createdAt: new Date().toISOString()
  };

  db
  .collection('screams')
  .add(newScream)
  .then((doc) => {
    res.json({message: 'document ${doc.id} created successfully'});
  })
  .catch((err) => {
      res.status(500).json({error: 'something went wrong'});
      console.error(err);
  });
 });

 const isEmail = (email) => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(email.match(regEx)) return true;
  else return false;
}

 const IsEmpty = (string) => {
   if(string.trim() === ' ') return true;
   else return false;
 }

 // Signup route
 app.post('/signup', (req,res) => {
   const newUser = {
     email: req.body.email,
     password: req.body.password,
     confirmPassword: req.body.confirmPassword,
     handle: req.body.handle,
   }

   let errors = {};

   if(IsEmpty(newUser.email)){
     errors.email = 'Email must not be empty';}
     else {if(!isEmail(newUser.email)){
       errors.email = 'Email must be a valid email'
     }}
   
  
   if(IsEmpty(newUser.password))errors.password = 'Must not be empty'
   if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match'

   if(IsEmpty(newUser.handle))errors.handle = 'Must not be empty'
   
   if(Object.keys(errors).length > 0) return res.status(400).json(errors);
   
  //TODO validate data
   db.doc('/users/${newUser.handle}').get
   .then(doc => {
     if(doc.exists){
       return res.status(400).json({handle: 'this handle is already taken'})
     }
     else{
       return
   firebase.auth().createUserWithEmailAndPAssword(newUser.email. new.password)
     }
   })
   .then(data => {
     userId = data.user.uid;
     const userId = data.user.getIdToken();
      
   })
   .then(token => {
     token = token;
     const userCredentials = {
      hanlde: newUser.handle,
      email: newUser.email,
      createdAt: Date.toISOString(),
     };
     return db.doc('/users/${newUser.handle}').set(userCredentials)
     .then(() => {
        return express.status(201).json({token});
     })
   })
   .catch(err => {
     console.error(err);
     if(err.code === 'auth/email-already-in-use'){
       return res.status(400).json({email: 'Email already in use'})
     }
     else{
       return res.status(500).json({error: error.code})
     }
  });
}); 

app.post('/login', (req, res) =>{
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  let errors = {};
  if(IsEmpty(user.email))errors.email = 'Must not be Empty';
  if(IsEmpty(user.password))errors.password = 'Must not be Empty';

  if(Object.keys(errors).length > 0)return res.status(400).json(errors);
  firebase.auth().signInWithEmailAndPassword(user.email, user.password)
  .then(data => {
    return data.getIdToken();
  })
  .then(token => {
    return res.json({token});
  })
  .catch(err => {
    console.error(err);
    if(err.code == 'auth/wrong-password'){
      return res.status(403).json({general: 'Wrong credentials, please try again'});
    }
    else{
      return status(500).json({error: err.code})
    }
    
  })
})
 exports.api = functions.https.onRequest(app);

 app.listen(3000,() => console.log('Listening on port: ${port}...'))

