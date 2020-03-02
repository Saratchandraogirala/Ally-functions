const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(regEx)) return true;
    else return false;
  }
  
   const IsEmpty = (string) => {
     if(string.trim() === ' ') return true;
     else return false;
   }

   exports.validateSignupData = (data) => {
    let errors = {};
 
    if(IsEmpty(data.email)){
      errors.email = 'Email must not be empty';}
      else {if(!isEmail(newUser.email)){
        errors.email = 'Email must be a valid email'
      }}
    
   
    if(IsEmpty(newUser.password))errors.password = 'Must not be empty'
    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match'
 
    if(IsEmpty(newUser.handle))errors.handle = 'Must not be empty'
    
    return res.status(400).json(errors);

    return {
        errors,
        valid: Object.keys(errors).length == 0 ?true :false 
    }
   }

   exports.reduceUserDetails = (data) => {
     let userDetails  = {}
     
     if(!IsEmpty(data.bio.trim())) userDetails.bio = data.bio;
     if(!IsEmpty(data.website.trim())){
       /https://website.com
       if(data.website.trim().substring(0,4) !== 'http'){
         userDetails.website = 'https://${data.website.trim()}';
       }
       else userDetails.website  = data.website;
     }
     if(!IsEmpty(data.location.trim())) userDetails.location = data.location;

     return userDetails;
    }