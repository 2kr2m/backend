import User from "../models/User.js";
import cookieParser from "cookie-parser";
import  express from "express";
import dotenv from "dotenv";
import { statusUpdate } from "../utils/buildNotif.js";

dotenv.config();
const app = express();
app.use(cookieParser());

/*
this controller provide 
user management functionnalities
wich the ADMIN responsible for 
 */

//get all users
export const getUsers = async (req,res)=>{
  try {
    const userType = req.query.userType;  
    const result = await User.find({userType: userType}); 

  res.json(result);
} catch (error) {
  console.error('Error retrieving Users:', error);
  res.status(500).json({ error: 'Internal Server Error' });
}
}

//get a specific user by admin
export const getUserById = async (req,res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
}

//add a one user 
export const addUser = async (req,res) => {
    try {
        const user = req.body;
        user.verified = 1;
        user.createdBy='0';
        const createdUser = await User.create(user);
        res.send('user ceated by admin');
    }catch (error) {
        console.log(error);
        res.send('something went wrong');   
    }
}

//delete specific user
export const deleteUser = async (req,res)=>{
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (user && user.email === "contact@tokenopp.io") {
          res.status(400).send({ message: "Can Not Delete Admin User" });
          return;
        }else{
          const deletedUser = await User.findByIdAndUpdate(userId, {isDeleted:1}, { new: true });;
          if (deletedUser) {
            res.json({ message: 'User deleted successfully' });
          } else {
            res.status(404).json({ error: 'User not found' });
          }
        }


      } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
      }
    };

//update specific user
export const updateUser = async (req, res) => {
    try {
      const userId = req.params.id;
      const updateData = req.body;
  
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
  
      if (updatedUser) {
        res.json(updatedUser);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
  };
// Update user status endpoint
export const updateStatus = async (req, res) => {
  try{
 
   const userId = req.params.userId;
   const user0 = await User.findById(userId);
   const newStatus = user0.status === 'pending' ? 'verified' : 'pending' ;
 
   // Update the user's status in the server data
   const user = await User.findByIdAndUpdate(userId, { status: newStatus }, { new: true });
   if (user) {
     // Emit the updated user to connected clients
     statusUpdate(user);
   }else {
     res.status(404).json({ error: 'User not found' });
   } 
  }catch (error) {
     res.status(500).json({ error: 'An error occurred' });
   }
 
   res.send('User status updated');
 };