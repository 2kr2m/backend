
import express from 'express';
import contractRouter from './routes/smartContractsRoutes.js';
import dotenv from "dotenv";
import authRouter from './routes/authRoutes.js';
import seedRouter from './routes/seedRoutes.js';
import cookieParser from 'cookie-parser';
import {requireAuth,isAdmin} from './middlewares/authMidd.js';
import cors from 'cors';
import {connection} from './db.js';
import userRouter from './routes/userRoutes.js';
// import isAdmin from './middlewares/isAdmin.js';
import bodyParser from 'body-parser';

const app = express();
dotenv.config();

//middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Enable CORS with custom options
app.use(cors({
  origin: 'http://localhost:3011', 
  allowedHeaders: ['Content-Type', 'Authorization'], // Replace with the allowed headers
  credentials: true
}));

const port =process.env.PORT || 5000;


connection(); 
app.use('/api/contract',requireAuth,contractRouter);
app.use('/api/auth',authRouter);
app.use('/api/users',requireAuth,isAdmin,userRouter)
app.use('/api/seed', seedRouter);
app.get("/home",requireAuth,(req,res)=>{
  res.send('welcome to home');
})
app.listen(port,()=>console.log(`Backend server is running on ${port}`));