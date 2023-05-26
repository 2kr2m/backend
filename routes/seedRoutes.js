import express from 'express';
import data from '../seeds.js';
import User from '../models/User.js';


const seedRouter = express.Router();

seedRouter.get('/', async (req, res) => {
  await User.deleteMany({});
  const createdUsers = await User.insertMany(data.users);
  res.status(201).send({ createdUsers });
});
export default seedRouter;