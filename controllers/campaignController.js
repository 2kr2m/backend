import Campaign from "../models/Campaign.js";
import Token from "../models/Token.js";
import User from "../models/User.js";
import { deploySmartContract } from "../routes/smartContractsRoutes.js";
import { passAdmin } from "../seeds.js";
import { endedCampaign, notifStartCampaign } from "../utils/buildNotif.js";
import io from "../initial.js";
import Buytoken from "../models/Buytoken.js";
import { sendEmail } from "../utils/sendEmails.js";
import moment from 'moment';
import Feedback from "../models/Feedback.js";




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

                endDate:expirationDate,
                remainToken:tokenQuantity
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
      let result;
      if (status == 'all'){
        result = await Token.find();
      }
      else{
        result = await Token.find({status: status});
      }
	    
  
	  res.json(result);
	} catch (error) {
	  console.error('Error retrieving pending token:', error);
	  res.status(500).json({ error: 'Internal Server Error' });
	}
  };
  export const updateCampaign = async (req, res) => {
    const {motifRejection} = req.body;

    try {
        const tokenId = req.params.id;
        const rejectDate = new Date();
        const tokenopp = await User.findById(req.user._id);
        const tokenUpdate ={
          status:"Rejected",
          rejectDate:rejectDate,
          rejectedBy:tokenopp.userName,
          motifRejection:motifRejection

      }

        const updatedToken = await Token.findByIdAndUpdate(tokenId, tokenUpdate, { new: true });
    
          res.json(updatedToken);


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


export const campaignDetails = async (req, res) => {
  const { authorization } = req.headers;
  const accessToken = authorization && authorization.split(' ')[1];  
  try {
    const user = await User.findOne({ accessToken: accessToken });
    const tokens = await Token.findOne({ companyAccount: user.address });
    const buytokens = await Buytoken.find({ tokenName: tokens.tokenName, status: 'accepted' });
    const investorsCount = tokens.investorCount;
    const amount = tokens.amount;
    
    let totalRaised = 0; 
    for (const buytoken of buytokens) {
      totalRaised += parseFloat(buytoken.amount);
        }
    
    const percentageofcompletation = (totalRaised / amount)*100;
    const endDateTimestamp = tokens.endDate;
    const duration = tokens.duration;
    const today = new Date();
    let timetocompletation = 0;
    let percentageoffinish = 0;

    if (today < endDateTimestamp) {
      const timeDifference = endDateTimestamp - today;
      timetocompletation =Math.round( timeDifference / (1000 * 60 * 60 * 24));
      percentageoffinish = (1 - (timetocompletation / tokens.duration)) * 100;
    }
    
    res.json([{
      investorsCount,
      amount,
      totalRaised,
      percentageofcompletation,
      timetocompletation,
      percentageoffinish,
      duration
    }]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
}
 export const campaignInvestIn = async (req,res)=>{
  const { authorization } = req.headers;
  const accessToken = authorization && authorization.split(' ')[1];  
  try {
    const user = await User.findOne({ accessToken: accessToken });
    const buytokens = await Buytoken.find({ email: user.email });
    const tokenData = buytokens.map(token => ({
      tokenName:token.tokenName,
      amount:token.amount,
      quantity: token.quantity,
      status:token.status,
      Date:token.Date
    }))
	  res.json(tokenData);

  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
 }

 export const rejectionDetails= async(req,res)=>{
  try{
      const company = await User.findById(req.user._id);
      
      const companyAccount = company.address;

      const rejectionData = await Token.find({companyAccount:companyAccount});
      res.status(200).json(rejectionData);

  
  } catch (error) {
        console.error('Error retrieving campaign details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    };

    export const addFeedback= async(req,res)=>{
      const {subject,message,name} = req.body;

      try{
        const user = await User.findById(req.user._id);
        const tokens = await Token.findOne({ companyAccount: user.address });

        const feedback ={
        name:user.userName,
        email:user.email,
        subject:subject,
        message:message,
        usernameofrejector:name,
        tokenId:tokens._id
      }

      const newfeedback = await Feedback.create(feedback);
      res.json(newfeedback);
      }
      catch (error) {
        console.error('Error saving feedback :', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }



    }


