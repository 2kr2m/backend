import Campaign from "../models/Campaign.js";
import Token from "../models/Token.js";
import User from "../models/User.js";
import { deploySmartContract } from "../routes/smartContractsRoutes.js";
import { passAdmin } from "../seeds.js";
import { endedCampaign, notifStartCampaign } from "../utils/buildNotif.js";
import io from "../initial.js";
import Buytoken from "../models/Buytoken.js";
import { sendEmail } from "../utils/sendEmails.js";


export const startCampaign = async (req,res)=>{
    
    try {
        const {id} = req.params;
        const tokenopp = await User.findById(req.user._id);
        const tokenoppAddress = tokenopp.address;
        const token = await Token.findById(id);
        if (token && token.status === 'Pending') {
            const duration = token.duration;
            const createdAt = new Date();
            const expirationDate = new Date(createdAt);
            expirationDate.setDate(expirationDate.getDate() + duration);
            const user = await User.findOne({address : token.companyAccount});
            const companyId = user._id;
            const tokenId = token._id;
            const tokenQuantity = token.tokenTotalSupply;
            const campaign ={
                "companyId":companyId,
                "tokenId": tokenId,
                "createdAt":createdAt,
                "duration":duration,
                "expirationDate":expirationDate,
                "tokenQuantity":tokenQuantity
            };
            const createdcampaign = await Campaign.create(campaign);

            //set token status to approved
            const tokenUpdate ={
                status:"Approved",
                startDate:createdAt,
                endDate:expirationDate
            }
            const approvedToken = await Token.findByIdAndUpdate(id,tokenUpdate, { new: true });
            //deploy smart contract
            await deploySmartContract(passAdmin,tokenoppAddress,approvedToken);
            
            notifStartCampaign(createdcampaign);
            res.status(201).send(createdcampaign);
            

        } else {
            res.status(409).send("this user can't launch two campaign in the same time");

        }
    } catch (error) {
        console.log(error);

    }

    // try {
    //     const owner = req.user._id;
    //     const campaign = req.body;
    //     const createdAt = new Date();
    //     const expirationDate = new Date(createdAt);
    //     expirationDate.setDate(expirationDate.getDate() + campaign.duration);
    //     campaign.ownerId = owner;
    //     campaign.createdAt = createdAt;
    //     campaign.expirationDate = expirationDate;
    
    //     const createdcampaign = await Campaign.create(campaign);
    //     notifStartCampaign(createdcampaign);
    //     res.status(201).send(createdcampaign);
    // } catch (error) {
    //     console.log(error);

    // }

    
}
export const rejectCampaign = async (req,res)=>{
    try {
        const {id} = req.params;
        const token = await Token.findById(id);
        if (token.status === 'Pending') {
            await Token.findByIdAndUpdate(id,{status:"Rejected"}, { new: true });
            res.send("Token had been rejected");
        }
    } catch (error) {
        console.log(error);
    }
}

export const requestedCampaigns = async (req, res) => {
	try {
      const status = req.query.status;  
	  const result = await Token.find({status: status}); 
  
	  res.json(result);
	} catch (error) {
	  console.error('Error retrieving pending token:', error);
	  res.status(500).json({ error: 'Internal Server Error' });
	}
  };
  export const updateCampaign = async (req, res) => {
	try {
        const tokenId = req.params.id;
        const updateData = req.body;
    
        const updatedToken = await Token.findByIdAndUpdate(tokenId, updateData, { new: true });
    
        if (updatedToken) {
          res.json(updatedToken);
        } else {
          res.status(404).json({ error: 'Token not found' });
        }
      } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
      }
  };
  export const getTokenById = async (req,res) => {
    const { id } = req.params;
    const token = await Token.findById(id);
    if (token) {
      res.json(token);
    } else {
      res.status(404).send({ message: "token Not Found" });
    }
}
  export const campaignResult = async(red,res) => {
    
    io.on("connection",async socket => {
      let campaigns = await Campaign.find({status:"started"});
      if(campaigns.length != 0){
        campaigns.forEach(async (campaign) => {
          const approvedToken = await Token.findById(campaign.tokenId);
          const listInvestors = await Buytoken.find({ tokenName: approvedToken.tokenName}); 
          const expirationDate = new Date(campaign.expirationDate);
          const currentDate = new Date();
          if (currentDate > expirationDate) {
            if(approvedToken.remainToken === '0' ){
              approvedToken.soldout = 1;
              campaign.status = 'ended';
              campaign.successStatus = 1;
              await Token.findByIdAndUpdate(approvedToken._id, approvedToken, { new: true });
              const updatedCampaign0 = await Campaign.findByIdAndUpdate(campaign._id, campaign, { new: true });
              const sme = await User.findById(campaign.companyId);
              await sendEmail(sme.email, sme.userName,"Campaign ended with success", `Hello ${sme.userName} , Congratulation! Your campaign is successfully ended. Administration will contact you for further details . `);
              await endedCampaign(updatedCampaign0,sme);
              listInvestors.forEach(async (investor)=>{
                await sendEmail(investor.email, investor.name, `${approvedToken.campaignName} ended with success`, `Hello ${investor.name} , Congratulation! The campaign named ${approvedToken.campaignName} is successfully ended. Administration will contact you for further details . `);
                await endedCampaign(updatedCampaign0,investor);
              })
              io.to(socket.id).emit('success campaign','success campaign');

            }else{
              approvedToken.soldout = 0;
              campaign.status = 'ended';
              campaign.successStatus = 0;
              await Token.findByIdAndUpdate(approvedToken._id, approvedToken, { new: true });
              const updatedCampaign1 = await Campaign.findByIdAndUpdate(campaign._id, campaign, { new: true });
              const sme = await User.findById(campaign.companyId);
              await sendEmail(sme.email, sme.userName,"Campaign Failed", `Hello ${sme.userName} , Unfortunately! Your running campaign reached the expiration date without fullfiling its goal.`);
              await endedCampaign(updatedCampaign1,sme);
              listInvestors.forEach(async (investor)=>{
                await sendEmail(investor.email, investor.name, `${approvedToken.campaignName} Failed`, `Hello ${investor.name} , Unfortunately! The campaign named ${approvedToken.campaignName} had been failed . Administration will contact you for further details . `);
                await endedCampaign(updatedCampaign1,investor);

              })
              io.to(socket.id).emit('failed campaign','failed campaign');
            }
          }else {
            if(approvedToken.remainToken === '0' ){
              approvedToken.soldout = 1;
              campaign.status = 'ended';
              campaign.successStatus = 1;
              await Token.findByIdAndUpdate(approvedToken._id, approvedToken, { new: true });
              const updatedcampaign2 = await Campaign.findByIdAndUpdate(campaign._id, campaign, { new: true });
              const sme = await User.findById(campaign.companyId);
              await sendEmail(sme.email, sme.userName,"Campaign ended with success", `Hello ${sme.userName} , Congratulation! Your campaign is successfully ended. Administration will contact you for further details . `);
              await endedCampaign(updatedcampaign2,sme);
              listInvestors.forEach(async (investor)=>{
                await sendEmail(investor.email, investor.name, `${approvedToken.campaignName} ended with success`, `Hello ${investor.name} , Congratulation! The campaign named ${approvedToken.campaignName} is successfully ended. Administration will contact you for further details . `);
                await endedCampaign(updatedcampaign2,investor);
              })
              io.to(socket.id).emit('success campaign','success campaign');

            } else {
              console.log("The expiration date has not been reached yet.");
            }
            
          }
        })
      }
      

    });
    

   
  }