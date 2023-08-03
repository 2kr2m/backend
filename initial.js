
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
import http from 'http';
import { Server as SocketIO } from 'socket.io';
// import isAdmin from './middlewares/isAdmin.js';
import bodyParser from 'body-parser';
import { campaignExpirationAlert, onConnection } from './utils/buildNotif.js';
import notificationfRouter from './routes/notificationRoutes.js';
import campaignRouter from './routes/campaignRoutes.js';
import upload  from 'express-fileupload';
import buytokenRouter from './routes/buytokenRoutes.js';
import tokenRouter from './routes/tokenRoutes.js';
import { campaignResult } from './controllers/campaignController.js';
import Campaign from './models/Campaign.js';
import Token from './models/Token.js';
import Buytoken from './models/Buytoken.js';
import { sendEmail } from './utils/sendEmails.js';
import User from './models/User.js';
import startupRouter from './routes/startupRoute.js';
import investorRouter from './routes/investorRoute.js';

const app = express();
dotenv.config();

//middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(upload());

// Enable CORS with custom options
app.use(cors({
  origin: 'http://localhost:3011', 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true
}));

const port =process.env.PORT || 5000;


connection(); 


app.use('/api/contract',contractRouter);
app.use('/api/auth',authRouter);
app.use('/api/users',requireAuth,isAdmin,userRouter)//,requireAuth,isAdmin
app.use('/api/users',requireAuth,notificationfRouter);
app.use('/api/seed', seedRouter);
app.use('/api/startup/demands',requireAuth,startupRouter);
app.use('/api/investor/demands',requireAuth,investorRouter);
app.use('/api/campaign',requireAuth,campaignRouter);
app.use('/api/buy',requireAuth,buytokenRouter);
app.use('/api/token',requireAuth,tokenRouter);
app.get("/home",requireAuth,async (req,res)=>{
  const user = req.user;
  campaignExpirationAlert(user);
  res.send('welcome to home');
})

const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: 'http://localhost:3011', // Replace with the allowed origin(s) for your frontend app
    methods: ['GET', 'POST'], // Specify the allowed HTTP methods
  },
}
);

server.listen(port,()=>{
  campaignResult();
  console.log(`Backend server is running on ${port}`)

});
export default io;