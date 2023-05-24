
import express from 'express';
import contractRouter from './routes/smartContractsRoutes.js';
import dotenv from "dotenv";
import authRouter from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import requireAuth from './middlewares/authMidd.js'
import {connection} from './db.js';
dotenv.config();

const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const port =process.env.PORT || 5000;


connection(); 
app.use('/api',requireAuth,contractRouter);
app.use('/authApi',authRouter);
app.get("/home",requireAuth,(req,res)=>{
  res.send('welcome to home');
})
app.listen(port,()=>console.log(`Backend server is running on ${port}`));