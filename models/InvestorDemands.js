import mongoose from "mongoose";

const investorDemandSchema = new mongoose.Schema({

    investor_name : {
        type: String ,
        default : 'investor name not given' 
    },
    investor_surname : {
        type: String,
        default : 'investor surname investor name not given' 
    },
    investor_email : {
        type: String,
        default : 'investor email investor name not given' 
    },
    investor_phone_number : {
        type: String,
        default : 'investor phone number not given' 
    },
    nationality : {
        type: String,
        default : 'nationality not given'
    },
    passport_ID : {
        type: String,
    },
    Social_Security_Number : {
        type: String,
        default : 'social security number not given'  
    },
    investor_type : {
        type: String,
        default : 'investor type not given' 
    },
    annual_income : {
        type: String,
        default : 'annual income not given' 
    },
    investment_experience : {
        type: String,
        default : 'investment experience not given'  
    },
    preferred_investment : {
        type: String,
        default : 'preferred investment not given'  
    },
    risk_tolerance : {
        type: String,
        default : 'risk tolerance not given'  
    },
    investment_objective : {
        type: String,
        default : 'investment objective not given'  
    },
    bank_account : {
        type: String , 
        default : 'Bank Account not given'    
    },
    investment_primary_goal : {
        type: String , 
        default : 'investment primary goal not given'
    },
    investor_reaction : {
        type: String, 
        default : 'investor reaction not given'
    },
    investment_time_horizon : {
        type: String, 
        default : 'investment time horizon not given'
    },
    previous_investment_experience : {
        type: String, 
        default : 'previous investment experience not given'
    },
    down_market_tolerance: {
        type: String, 
        default : 'down market tolerance not given'
    },
    loss_tolerance : {
        type: String , 
        default : 'loss tolerance not given'
    },
    risk_attitude : {
        type: String , 
        default : 'risk_attitude not given'
    },
    date : {
        type : Date , 
        default : Date.now
    }
});
const investorDemand = mongoose.model('investorDemand', investorDemandSchema);

export default investorDemand;