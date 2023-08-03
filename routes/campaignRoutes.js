import express from "express";
import { startCampaign, rejectCampaign,requestedCampaigns,getTokenById,updateCampaign } from "../controllers/campaignController.js";
const campaignRouter = express.Router();

campaignRouter.post('/user/start-campaign/:id',startCampaign);
campaignRouter.post('/user/reject-campaign/:id',rejectCampaign);
campaignRouter.get('/requestcampaign',requestedCampaigns)
campaignRouter.get('/getToken/:id',getTokenById);
campaignRouter.put('/update/:id',updateCampaign);

export default campaignRouter;