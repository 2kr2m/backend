import express from 'express';
const startupRouter = express.Router();
import User from "../models/User.js";

import fs from 'fs';
import startupDemand from '../models/StartupDemand.js';

startupRouter.post('/depositdemand', async (req,res) => {
  const { authorization } = req.headers;
  const accessToken = authorization && authorization.split(' ')[1];
  const user = await User.findOne({ accessToken: accessToken });
  console.log(user.id)
  console.log(req.body)
  const new_Demand = new startupDemand({
        company_name: req.body.companyName,
        company_email: req.body.companyEmail ,
        company_website:req.body.companyWebsite,
        country: req.body.country,
        state_of_funding: req.body.state_of_funding,
        activity_sector:req.body.activity_sector,
        activity_description: req.body.activity_description,
        pitch_video:'pitch_video' in req.files ? req.files.pitch_video.name : 'No file chosen',
        legal_status:'legal_status' in req.files ? req.files.legal_status.name : 'No file chosen',
        business_registration_number : 'business_registration_number' in req.files ? req.files.business_registration_number.name : 'No file chosen',
        member_name : req.body.memberName,
        member_occupation: req.body.memberOccupation,
        member_surname:req.body.memberSurname,
        member_cv: 'member_cv' in req.files ? req.files.member_cv.name : 'No file chosen',
        business_plan: 'business_plan' in req.files ? req.files.business_plan.name : 'No file chosen',
        market_analysis: 'market_analysis' in req.files ? req.files.market_analysis.name : 'No file chosen',
        balance_sheet: 'balance_sheet' in req.files ? req.files.balance_sheet.name : 'No file chosen',
        cash_flow_statement: 'cash_flow_statement' in req.files ? req.files.cash_flow_statement.name : 'No file chosen',
        equity_statement:'equity_statement' in req.files ? req.files.equity_statement.name : 'No file chosen',
        income_statement: 'income_statement' in req.files ? req.files.income_statement.name : 'No file chosen',
        additional_information: 'additional_information' in req.files ? req.files.additional_information.name : 'No file chosen'
  })
  try {
          const mainDirPath = `./startupDemands/Startup-${user.id}/`
          try {
              if (!fs.existsSync('./startupDemands')) {
              fs.mkdirSync('./startupDemands');
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

startupRouter.get('/', (req,res) => {
  res.send("fundraising route");
}
)

export default startupRouter