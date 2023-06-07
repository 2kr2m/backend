import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { tokenBlacklist } from '../controllers/authController.js';

dotenv.config();
var password=process.env.AUTH_SECRET;
export const requireAuth = (req,res,next)=>{
    // const token = req.cookies.jwt;
    // console.log(token);
    const authorization = req.headers.authorization;
    if (authorization) {
        const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
        
        if (!tokenBlacklist.has(token)){
            jwt.verify(token,password,(err,decode)=>{
                if (err) {
                    console.log(err.message);
                    res.redirect('/api/login0');
                } else {
                    
                    req.user = decode;
                    next();
                }
            })
        }else{
            res.redirect('/api/login0');
        }

    } else {
        res.redirect('/api/login0');
    }
 }
 export const isAdmin = (req, res, next) => {
    console.log(req.user);
    if (req.user && req.user.userType === 'admin') {
      console.log('is admin');  
      next();
    } else {
      res.status(401).send({ message: 'Invalid Admin Token' });
    }
  };