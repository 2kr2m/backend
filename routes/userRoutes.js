import express from 'express';
import { addUser, deleteUser, getAll, getUserById, updateUser,updateStatus } from '../controllers/userController.js';
const userRouter = express.Router();
userRouter.post('/:userId/update-status',updateStatus);
userRouter.get('/',getAll);
userRouter.get('/:id',getUserById);
userRouter.post('/add',addUser);
userRouter.delete('/delete/:id',deleteUser);
userRouter.put('/update/:id',updateUser);

export default userRouter;