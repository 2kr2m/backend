import User from "../models/User.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import  express from "express";
import dotenv from "dotenv";
import {sendEmail} from "../utils/sendEmails.js";

dotenv.config();
const app = express();
app.use(cookieParser());

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
//create Token
var password=process.env.AUTH_SECRET;
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id)=>{
    return jwt.sign({id},password,{
        expiresIn:maxAge
    });
};

//verification account
export const verif_get = async (req,res)=>{

     const { id } = req.params;
    
     try {
    
    // Get the user from the database.
    
    const user = await User.findById(id);
    
    // If the user does not exist, return an error.

     if (!user) return res.status(404).send('User not found');
    // jwt token verification

     if (req.cookies.jwt !== req.params.token) return res.status(400).send("Invalid link or expired");

    
    // Check if the user has already verified their account.
    
    if (user.verified==1) return res.status(200).send('Account already verified');

    // Set the user to verified.
    
     user.verified = 1;
    
    await user.save();
    
    // Send a message to the user to let them know that their account has been verified.
    
    sendEmail(user.email, 'Account Verified', 'http://localhost:3000/home');
    
    res.status(200).send('Account verified');
    
    } catch (error) {
    
     const errors = handleErrors(error);
    
     res.status(400).json(errors);
    
    }
    
    }
      
/////////////////////  
//resend verification
//     export const resendverif_get = async (req,res)=>{
//         try {
//             const link = `${process.env.BASE_URL_AUTH}/verif/${req.params.id}/${token}`;
//             await sendEmail(createdUser.email, "Password reset", `Thank you for your registration,please click on this link to verify your account ${link}`);
//         } catch (error) {
            
//         }    
    
//      const { id } = req.body;
    
//      try {
    
//      // Get the user from the database.
    
//      const user = await User.findById(id);
    
//      if (user.verified==0) {
    
//      sendEmail(user.email, 'Verify Your Account', `${process.env.BASE_URL_AUTH}/verif/${createdUser._id}`);
    
//      return res.status(200).send('Email verification resend');
    
//      }
    
//      if (user.verified==1){
    
//      sendEmail(user.email, 'Account Verified', 'http://localhost:3000/home');
    
//     }
    
//       user.verified = 1; 
//       await user.save();
//  // Send a message to the user to let them know that their account has been verified.
    
//       sendEmail(user.email, 'Account Verified', 'http://localhost:3000/home');
//       res.status(200).send('Account verified');
    
//       }
    
//        catch (error) {
//         const errors = handleErrors(error);
//         res.status(400).json(errors);
//       }
    
//     }
    ///////////

export const signup_get=(req,res)=>{
    res.send('signup');
}
export const signup_post= async (req,res)=>{
    const user = req.body;
    try {
        const createdUser = await User.create(user);
        let token = createToken(createdUser._id);
        res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000});
        const link = `${process.env.BASE_URL_AUTH}/verif/${createdUser._id}/${token}`;
        await sendEmail(createdUser.email, "Password reset", `Thank you for your registration,please click on this link to verify your account ${link}`);
        res.status(201).json({userId:createdUser._id});

    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
}

export const login_get=(req,res)=>{
    res.send('<h2>this is login page</h2>');
}
export const login_post= async (req,res)=>{
    const {email,password} = req.body;
    try {
        const user = await User.login(email,password);
        let jwt = createToken(user._id);
        res.cookie('jwt',jwt,{httpOnly:true,maxAge:maxAge*1000});
        res.status(200).json(user.email);
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json(errors);
    }
}
//send email to reset password
export const resetPass1_post = async (req,res)=>{
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).send("user with given email doesn't exist");
        let jwt = createToken(user._id);
        res.cookie('jwt',jwt,{httpOnly:true,maxAge:maxAge*1000});
        
        const link = `${process.env.BASE_URL_AUTH}/reset-password/${user._id}/${jwt}`;
        await sendEmail(user.email, "Password reset", `Hello ${user.userName} , to reset password click on this link${link}`);
        res.send("password reset link sent to your email account");

    } catch (error) {
        console.log(error);
        const errors = handleErrors(error);
        res.status(400).json(errors);
    }
}

//enter new password for the reset
export const resetPass2_post = async (req,res)=>{
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(400).send("invalid link or expired");
        if (req.cookies.jwt !== req.params.token) return res.status(400).send("Invalid link or expired");
        
        user.password = req.body.password;
        await user.save();

        res.send("password reset sucessfully.");
    } catch (error) {
        console.log(error);
        const errors = handleErrors(error);
        res.status(400).json(errors);
    }
}

export const logout_get= async (req,res)=>{
    res.cookie('jwt','',{maxAge:1});
    res.redirect('/api/login0');
}

// module.exports = signup_get ;