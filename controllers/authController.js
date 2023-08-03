import User from "../models/User.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import  express from "express";
import dotenv from "dotenv";
import {sendEmail} from "../utils/sendEmails.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Web3 from 'web3';
import {generateTwoFactorSecret} from "../utils/generateTwoFactorSecret.js";
import { onConnection } from "../utils/buildNotif.js";
dotenv.config();
const app = express();
app.use(cookieParser());

//token blacklist
export const tokenBlacklist = new Set();
const blockchainURI=process.env.BOCKCHAIN_URI;

const web3 =new Web3(new Web3.providers.HttpProvider("http://blockchain.docker.local"));


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
const createToken = (user)=>{
    return jwt.sign(    
      {
        _id: user._id,
        id: user.id,
        userType: user.userType
      },
        password,{
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

   
    
    // Check if the user has already verified their account.
    
    if (user.verified==1) return res.status(200).send('Account already verified');

    // Set the user to verified.
    
     user.verified = 1;
    
     await User.findByIdAndUpdate(id, user);
     
    
    // Send a message to the user to let them know that their account has been verified.
    
    sendEmail(user.email,user.userName, 'Account Activated', '<h3>Your Account is Activated</h3> <p>Follow this Link to your profile : http://localhost:3000/home </p>');
    
    res.status(200).redirect('http://localhost:3011/metronic8/react/demo1/auth/login');
    
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
        let accessToken = createToken(createdUser._id);
        res.cookie('jwt',accessToken,{httpOnly:true,maxAge:maxAge*1000});
        const link = `${process.env.BASE_URL_AUTH}/verif/${createdUser._id}/${accessToken}`;
        await sendEmail(createdUser.email,createdUser.userName, "Email Activation", `<h3>Click the link below to activate your email.</h3><p>${link}</p> `);
        res.status(201).json(`data:${accessToken}`);

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
      // const user = await User.login(email,password);
      const user = await User.findOne({email: email});
      const auth = await bcrypt.compare(password,user.password);
      if (user.isDeleted <= 0) {
        let jwt = createToken(user);
        req.headers.authorization = `Bearer ${jwt}`;
        res.cookie('jwt',jwt,{httpOnly:true,maxAge:maxAge*1000});
        if (user.address==''){
          const address =  await web3.eth.personal.newAccount(password);
          user.address = address;
          onConnection(user,address);
        }
      
        user.accessToken = jwt;
        await User.findOneAndUpdate(user._id ,user);
        if (user.verified==0 ){
              res.status(400).send('Please Verify your Account to Login');
            
        }
          
        else if (!auth){
             res.status(400).send('fail');
        }
       
        else if (user.twoFactorEnabled==1){
                  await generateTwoFactorSecret(user.email,user.userName);
                  res.send(user);

          }
        else { 
              res.status(200).send(user);
            
          }
      } else {
        console.log('isDeleted')
        res.status(400).send('there is no user with credentials');
      }



  } catch (error) {
      const errors = handleErrors(error);
      res.status(400).json(errors);
  }
}



// export const login_post= async (req,res)=>{
//     const {email,password} = req.body;
//     try {
//         // const user = await User.login(email,password);
//         const user = await User.findOne({email: email});
//         const auth = await bcrypt.compare(password,user.password);
//         let jwt = createToken(user);
//         res.cookie('jwt',jwt,{httpOnly:true,maxAge:maxAge*1000});
//       if (user.address==''){
//         const address =  await web3.eth.personal.newAccount(password);
//         user.address = address;
//       onConnection(user,address);
//       }
      
//         user.accessToken = jwt;
//         await User.findOneAndUpdate(user._id ,user);
//         if (user.verified==0){
//             res.status(400).send('Please Verify your Account to Login');
            
//         }
          
//         else if (!auth){
//            res.status(400).send('fail');
//     }
       
//         else if (user.twoFactorEnabled==1){
//                 await generateTwoFactorSecret(user.email,user.userName);
//                 res.send(user);

//         }
//         else { 
//             res.status(200).send(user);
//             console.log(password,user.password);
//         }

 
//     } catch (error) {
//         const errors = handleErrors(error);
//         res.status(400).json(errors);
//     }
// }

//send email to reset password
export const resetPass1_post = async (req,res)=>{
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).send("user with given email doesn't exist");
        let jwt = createToken(user._id);
        res.cookie('jwt',jwt,{httpOnly:true,maxAge:maxAge*1000});
        const length = 10;
        const resetToken = crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
        await sendEmail(user.email, user.userName,"Password reset", `Hello ${user.userName} , This is the secret code to reset your password  <p>${resetToken}</p>`);
        res.send("password reset link sent to your email account");
        user.resetToken = resetToken;
        await User.findOneAndUpdate(user._id ,user);

    } catch (error) {
        console.log(error);
        const errors = handleErrors(error);
        res.status(400).json(errors);
    }
}


//enter new password for the reset
export const resetPass2_post = async (req,res)=>{
    try {
        const { code , password } = req.body;
        const user = await User.findOne({resetToken:code});
        if (!user) return res.status(400).send("user doesn't exist");
        user.password = password;
        user.resetToken = '';        
        await user.save();
        sendEmail(user.email,user.userName, 'Password reset successful', '<h3>Your Password is reset successful</h3>');

        res.send("password reset sucessfully.");
    } catch (error) {
        console.log(error);
        const errors = handleErrors(error);
        res.status(400).json(errors);
    }
}


//2FA Enable
export const enableFA = async (req,res)=>{
  const { authorization } = req.headers;
  const accessToken = authorization && authorization.split(' ')[1];  
  try {

      const user = await User.findOne({ accessToken: accessToken }); 
      if (user.verified == 0 ) {
        res.status(400).send('Please Verify your Account to enable 2FA');
      }
      if (user.twoFactorEnabled == 1 ) {
        res.status(400).send('Already Enabled');
      }
      user.twoFactorEnabled = 1 ;
      await User.findOneAndUpdate(user._id ,user);
      res.status(200).send(user);
      }
      catch (error) {
        const errors = handleErrors(error);
        res.status(400).json(errors);
      } 
  }
  
  export const generateTwoFactorSecret_get=(req,res)=>{
    res.send('<h2>this is 2FA page</h2>');
}
  
  // //2FA code generater
  // export const generateTwoFactorSecret = async (req, res) => {
  //   const {email}=req.body
  //   try {
  //   const user = await  User.findOne({ email: email});
  
  //   if (!user ) {
  //     res.status(400).send('Invalid user');
  //   }
  //   if (user.twoFactorEnabled == 0 ) {
  //     res.status(400).send('2FA is not Enabled');
  //   }
   
  //   // const secret = bcrypt.genSaltSync(12);
  //   const secret = crypto.randomInt(1000, 9999);
  //   user.twoFactorSecret = secret;
  //   await User.findOneAndUpdate(user._id ,user);
  //   res.status(200).send(secret.toString());
  //   }
  //   catch (error) {
  //     const errors = handleErrors(error);
  //     res.status(400).json(errors);
  //   } 
  // }
  //2FA code verification
  export const verifyTwoFactorCode = async (req, res) => {
    const {email,twoFactorCode}=req.body
    try {
     const user = await User.findOne({email: email});
  
    if (!user) {
      res.status(401).send('Invalid user');
    }
  
    // const validCode = bcrypt.compareSync(twoFactorCode, user.twoFactorSecret);
  
    if (twoFactorCode == user.twoFactorSecret) {
      res.status(200).send(user);
    }
     else  {
      res.status(401).send('Invalid two-factor code');
     }
  }
    catch (error) {
      const errors = handleErrors(error);
      res.status(400).json(errors);
    }} 




// export const logout = async (req, res) => {
//       // Get the access token from the request object
//       const accessToken = req.params.accessToken;
    
//       // Find the user in the database
//       try {
//         const user = await User.findOne({ accessToken: accessToken });
      
//       // Set the user's access token to an empty string
//       user.accessToken = '';
    
//       // Update the user in the database
//       await User.findOneAndUpdate(user._id, user);
    
//       // Set a cookie with an empty value and a maximum age of 1 second
//       res.cookie('jwt', '', { httpOnly: true, maxAge: 1 });
    
//       // Log that the user has logged out successfully
//       console.log('Logged out successfully');
//     } catch (error) {
//       // Handle the error
//       const errors = handleErrors(error);
//       res.status(400).json(errors);
//       return;
//     }
  
//     };
export const logout= async (req,res)=>{
  tokenBlacklist.add(req.cookies.jwt);
  console.log(tokenBlacklist);
  res.cookie('jwt','',{maxAge:1});
  res.redirect('/auth/login');
}

    

export const getuser = async (req,res) => {
  const { authorization } = req.headers;
  const accessToken = authorization && authorization.split(' ')[1];

  if (accessToken) {
    const user = await User.findOne({ accessToken: accessToken }); // Use an object with accessToken property
    if (user) {
      res.send(user);
      console.log(user);
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  } else {
    res.status(401).send({ message: "Unauthorized" });
  }
};

export const modifyuser = async (req,res)=>{
  try{
    const {firstName, lastName,phone,localisation,paymentMethod,rib}=req.body;
    const { authorization } = req.headers;
    const accessToken = authorization && authorization.split(' ')[1];
    const user = await User.findOne({ accessToken: accessToken });
    user.firstName=firstName;
    user.lastName= lastName;
    user.phone=phone;
    user.localisation=localisation;
    user.paymentMethod= paymentMethod;
    user.rib=rib;
  await User.findOneAndUpdate(user._id ,user);
  res.status(200).send(user);
  }
  catch (error) {
    const errors = handleErrors(error);
    res.status(400).json(errors);
  }
}
export const setuser = async (req,res) => {
  const { authorization } = req.headers;
  const accessToken = authorization && authorization.split(' ')[1];

  if (accessToken) {
    const user = await User.find({ accessToken: accessToken }); // Use an object with accessToken property
    if (user) {
      res.send(user);
      console.log(user);
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  } else {
    res.status(401).send({ message: "Unauthorized" });
  }
};

export const changeemail= async (req,res)=>{
  try{
    const {newemail,password}= req.body;
    const { authorization } = req.headers;
    const accessToken = authorization && authorization.split(' ')[1];
    const user = await User.findOne({ accessToken: accessToken }); 
    const userpassword = user.password;
    const auth = await bcrypt.compare(password,userpassword);
    console.log(userpassword);
    console.log(user);
    console.log(auth);
    if(!auth){

      res.status(404).send({ message: "fail" });
    }
    else{

      user.email=newemail;
      await User.findOneAndUpdate(user._id ,user);
      res.status(200).send(user);
    }
    res.status(200).send(user);

  }
  catch (error) {
    console.error(error);
    res.status(500).send('Error submitting data');}
}


export const changepassword= async (req,res)=>{
  try{
    const {currentpassword,newpassword,confirmnewpassword}= req.body;
    const { authorization } = req.headers;
    const accessToken = authorization && authorization.split(' ')[1];
    const user = await User.findOne({ accessToken: accessToken }); 
    const auth = await bcrypt.compare(currentpassword,user.password);

    if(auth && (newpassword == confirmnewpassword)){
      user.password=newpassword;
      await user.save();
      res.status(200).send(user);

    }
    else{
      res.status(404).send({ message: "fail" });
    }
    res.send(user);

  }
  catch (error) {
    const errors = handleErrors(error);
    res.status(400).json(errors);
}
}

// module.exports = signup_get ;