import express from 'express';
const fundDemandRouter = express.Router();

import fs from 'fs';
import Demand from '../models/Demand.js';

fundDemandRouter.post('/depositdemand', async (req,res) => {
  const new_Demand = new Demand({
        company_name: req.body.company_name,
        company_email: req.body.company_email ,
        company_website:req.body.company_website,
        country: req.body.country,
        state_of_funding: req.body.state_of_funding,
        activity_sector:req.body.activity_sector,
        activity_description: req.body.activity_description,
        pitch_video:'pitch_video' in req.files ? req.files.pitch_video.name : 'No file chosen',
        legal_status:'legal_status' in req.files ? req.files.legal_status.name : 'No file chosen',
        business_registration_number : 'business_registration_number' in req.files ? req.files.business_registration_number.name : 'No file chosen',
        member_occupation: req.body.member_occupation,
        member_surname:req.body.member_surname,
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
          const User_Number = Math.floor(Math.random()*100000)
          const mainDirPath = `./demands/User-${User_Number}/`
          try {
              if (!fs.existsSync('./demands')) {
              fs.mkdirSync('./demands');
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

fundDemandRouter.get('/', (req,res) => {
  res.send("fundraising route");
}
)

export default fundDemandRouter