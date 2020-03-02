const {db} = require('../util/admin');
const config = require('../util/config')
const {firebase} = require('firebase');
firebase.initialiseApp(config)

const {validateSignupData, validateLoginData, reduceUserDetails } = require('../util/validators')

// signup new user
exports.signup = (req,res) => {
    const newUser = {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      handle: req.body.handle,
    }
 
   const {valid, errors} = validateSignupData(newUser); 

   const noImg = 'no-img.png'
   
   if(!valid) return res.status(400).json(errors);
   
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
       imageUrl:'https;//firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media', 
       userId
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
      
      else{
        return res.status(500).json({general: 'Something went wrong, please try again'})
      }
   });
 }

 // login existing user
 exports.login = (req, res) =>{
    const user = {
      email: req.body.email,
      password: req.body.password
    };

    const {valid, errors} = validateLoginData(user); 
   
   if(!valid) return res.status(400).json(errors);
  
    
    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.getIdToken();
    })
    .then(token => {
      return res.json({token});
    })
    .catch(err => {
      console.error(err);
      return res.status(403).json({general: 'Wrong credentials, please try again'});
      else{
        return status(500).json({error: err.code})
      }
      
    })
  }

  // validate login data of existing user
  exports.validateLoginData = (data)=> {
    let errors = {};
    if(IsEmpty(user.email))errors.email = 'Must not be Empty';
    if(IsEmpty(user.password))errors.password = 'Must not be Empty';
  
    if(Object.keys(errors).length > 0)return res.status(400).json(errors); 
  }

  //Add user details
  exports.addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body);

    db.doc('/users/${req.user.handle}').update(userDetails)
    .then(() => {
      return res.json({message:'Details added successfully'});
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: err.code})
    });

  };

  //Get any Users details
  exports.getUserDetails = (req, res) => {
    let userData = {};
    db.doc('/users/${req.params.handle}').get() 
    .then(doc => {
      if(doc.exists){
        userData.user = doc.data();
        return db.collection('screams').where('userHandle', '==', req.params.handle)
        .orderBy('createdAt', 'desc')
        .get();
      }
      else{
        return res.status(404).json({error: 'User not found'});
      }
    })
    .then(data => {
      userData.screams = [];
      data.forEach(doc => {
        userData.screams.push({
          body: doc.data().body,
          createdAt: doc.data().createdAt,
          userHandle: doc.data().userHandle ,
          likeCount: doc.data().likeCount,
          commentCoun: doc.data().commentCount,
          screamId: doc.id
        })
      });
      return res.json(userData) 
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: err.code});
    })
  }

  //Get own user details
  exports.getAuthenticatedUser = (req, res) => {
    let userData ={};
    db.doc('/user/${req.user.handle}').get()
    .then(doc => {
      if(doc.exists){
        userData.credentials = doc.data();
        return cd.collection('likes').where('userHandle', '==', req.user.handle).get()
      }
    })
    .then(data => {
      userData.likes = [];
      data.forEach(doc => {
        userData.likes.push(doc.data());
      });
      return db.collection('notifications').where('recipient', '==', req.user.handle)
      .orderBy('createdAt','desc').limit(10).get();
    })
    .then(data => {
      userData.notifications = [];
      data.forEach(doc => {
        userData.notifications.push({
          recipient: doc.data().recipient,
          sender: doc.data().sender,
          screamId: doc.data().screamId,
          type: doc.data().type,
          read: doc.data().read,
          notificationId: doc.id
        })
      });
      return res.json(userData);
        
      } 
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code});
    })
  }
  // upload a profile image for user
  exports.uploadImage = (req,res) => {
    const busboy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({headers:req.headers});

    let imageFileName;
    let imageToBeUploaded = {};

    busboy.on ('file', (fieldname, file, filename, encoding, mimetype) => {
      if(mimetype !== 'image/jpeg' && mimetype !== 'image/png'){
        return res.status(400).json({ error:'Wrong file type submitted'});
      }
      console.log(fieldname);
      console.log(filename);
      console.log(mimetype);
      // my.image.png
      const imageExtension = filename.split('.')[filename.split('.').length-1];
      // 645235423674523.png
       imageFileName = '${Math.round(Math.random()*100000000000)}.${imageExtension}
      const filepath = path.join(os.tmpdir(), imageFileName);
      imageToBeUploaded = {filepath, mimetype}
      file.pipe(fs.createWriteStream(filepath));
    });
    busboy.on('finish', () => {
      admin.storage().bucket().upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        const imageUrl = 'https;//firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media'
        return db.doc('/users/${req.user.handle}').update({ imageUrl));
      })
      .then(() => {
        return res.json({message: 'Image uploaded Successfully'});
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json({error: err.code});
        
      })
    })
    busboy.end(req.rawBody);
  }

  exports.markNotificationsRead = (req, res) => {
    let batch = db.batch();
    req.body.forEach(notificationId => {
      const notification = db.doc('/notification/${notification}')
      batch.update(notifications, {read: true});
    });
    batch.commit()
    .then(() => {
      return res.json({message: 'Notifications marked read'});
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: err.code});
    });
  };
