import express from "express";
import { startCompaign } from "../controllers/campaignController.js";
const campaignRouter = express.Router();

campaignRouter.post('/user/start-campaign',startCompaign);

export default campaignRouter;