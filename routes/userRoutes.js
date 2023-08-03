import express from 'express';
import { addUser, deleteUser, getUserById, updateUser,updateStatus, getUsers } from '../controllers/userController.js';
const userRouter = express.Router();
userRouter.post('/:userId/update-status',updateStatus);
userRouter.get('/',getUsers);
userRouter.get('/:id',getUserById);
userRouter.post('/add',addUser);
userRouter.delete('/delete/:id',deleteUser);
userRouter.put('/update/:id',updateUser);

export default userRouter;