import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();
var password=process.env.AUTH_SECRET;
const requireAuth = (req,res,next)=>{
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token,password,(err,verifiedToken)=>{
            if (err) {
                console.log(err.message);
                res.redirect('/api/login0');
            } else {
                console.log(verifiedToken);
                next();
            }
        })
    } else {
        res.redirect('/api/login0');
    }
 }

 export default requireAuth;