import Campaign from "../models/Campaign.js";
import { notifStartCampaign } from "../utils/buildNotif.js";

export const startCompaign = async (req,res)=>{
    try {
        const owner = req.user._id;
        const campaign = req.body;
        const createdAt = new Date();
        const expirationDate = new Date(createdAt);
        expirationDate.setDate(expirationDate.getDate() + campaign.duration);
        campaign.ownerId = owner;
        campaign.createdAt = createdAt;
        campaign.expirationDate = expirationDate;
    
        const createdcampaign = await Campaign.create(campaign);
        notifStartCampaign(createdcampaign);
        res.status(201).send(createdcampaign);
    } catch (error) {
        console.log(error);

    }

    
}