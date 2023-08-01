import express from "express";
import  { addcampaigntoken, mycampaign}  from "../controllers/tokenController.js"; 
const tokenRouter = express.Router();

tokenRouter.post('/addcampaigntoken',addcampaigntoken);
tokenRouter.get('/mycamapign', mycampaign);


export default tokenRouter;