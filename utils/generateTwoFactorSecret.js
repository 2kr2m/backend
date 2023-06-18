import crypto from 'crypto';
import User from "../models/User.js";
import {sendEmail} from "../utils/sendEmails.js";

//handle errors
const handleErrors = (err)=>{
    console.log(err.message,err.code);
    let errors = {
        email:'',
        password:'',
        role:''
    };
    //login errors
    if (err.message === 'invalid inputed data') {
        errors.email = 'invalid inputed data';
        errors.password='invalid inputed data';   
    }
    
    //duplicate error code
    if(err.code === 11000){
        errors.email="email already exists";
        return errors;
    }

    if (err.message.includes('user validation failed')) {
        //validation errors
        Object.values(err.errors).forEach(({properties})=>{
            errors[properties.path]=properties.message;
        });
    }
    return errors;

};
export const generateTwoFactorSecret = async (email,userName) => {
    
    try {
    const user = await  User.findOne({ email: email});
  
    if (!user ) {
      console.log('Invalid user');
    }
    if (user.twoFactorEnabled == 0 ) {
        console.log('2FA is not Enabled');
    }
   
    // const secret = bcrypt.genSaltSync(12);
    const secret = crypto.randomInt(1000, 9999);
    user.twoFactorSecret = secret;
    await User.findOneAndUpdate(user._id ,user);
    await sendEmail(user.email, user.userName,"Two factor Authentification code", `Hello ${user.userName} , This is the Two factor Authentification code  <p>${secret}</p>`);
    console.log(secret.toString());
    }
    catch (error) {
      const errors = handleErrors(error);
      console.log(errors);
    } 
  }