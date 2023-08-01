import express from 'express';
const investorRouter = express.Router();
import User from "../models/User.js";

import fs from 'fs';
import investorDemand from '../models/InvestorDemands.js';

investorRouter.post('/depositdemand', async (req,res) => {
  const { authorization } = req.headers;
  const accessToken = authorization && authorization.split(' ')[1];
  const user = await User.findOne({ accessToken: accessToken });
  console.log(user.id)
  console.log(req.body)
  const new_Demand = new investorDemand({
        investor_name: req.body.investor_name,
        investor_surname: req.body.investor_surname ,
        investor_email:req.body.investor_phone_number,
        investor_phone_number: req.body.investor_phone_number,
        nationality: req.body.nationality,
        passport_ID:'passport_ID' in req.files ? req.files.passport_ID.name : 'No file chosen',
        Social_Security_Number: 'Social_Security_Number' in req.files ? req.files.Social_Security_Number.name : 'No file chosen',
        Tax_ID: req.body.Tax_ID,
        investor_type: req.body.investor_type,
        annual_income: req.body.annual_income,
        investment_experience: req.body.investment_experience,
        preferred_investment: req.body.preferred_investment,
        risk_tolerance: req.body.risk_tolerance,
        investment_objective: req.body.investment_objective,
        bank_account: req.body.bank_account,
        investment_primary_goal: req.body.investment_primary_goal,
        investor_reaction: req.body.investor_reaction,
        investment_time_horizon: req.body.investment_time_horizon,
        previous_investment_experience: req.body.previous_investment_experience,
        down_market_tolerance: req.body.down_market_tolerance,
        risk_attitude: req.body.risk_attitude
  })
  try {
          const mainDirPath = `./investorDemands/Investor-${user.id}/`
          try {
              if (!fs.existsSync('./investorDemands')) {
              fs.mkdirSync('./investorDemands');
              }
              if (!fs.existsSync(mainDirPath)) {
              fs.mkdirSync(mainDirPath);
          }
          } catch (err) {
              console.error(err);
          }
          
          Object.values(req.files).map(file => {
          file.mv(mainDirPath+file.name,function(err){
            if (err){
                console.log('An error just happened while uploading your files')
            }else{
                console.log('Files uploaded successfully')
            }
          })
          }); 
          const savedDemand = await new_Demand.save()
          res.send(savedDemand);
  }catch(error) {
    res.status(400).send(error);
  }
 }
)

investorRouter.get('/', (req,res) => {
  res.send("fundraising route");
}
)

export default investorRouter