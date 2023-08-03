import mongoose from "mongoose";

const startupDemandSchema = new mongoose.Schema({

    company_name : {
        type: String ,
        default : 'company name' 
    },
    company_email : {
        type: String,
        default : 'company email' 
    },
    company_website : {
        type: String,
        default : 'company website' 
    },
    country : {
        type: String,
        default : 'country' 
    },
    state_of_funding : {
        type: String,
        default : 'state of funding'
    },
    activity_sector : {
        type: String,
    },
    activity_description : {
        type: String,
        default : 'activity description'  
    },
    pitch_video : {
        type: String,
        default : 'pitch ' 
    },
    legal_status : {
        type: String,
        default : 'legal status' 
    },
    business_registration_number : {
        type: String,
        default : 'business registration number'  
    },
    member_name : {
        type: String,
        default : 'member name'  
    },
    member_surname : {
        type: String,
        default : 'member surname'  
    },
    member_occupation : {
        type: String,
        default : 'member occupation'  
    },
    member_cv : {
        type: String , 
        default : 'member cv '    
    },
    business_plan : {
        type: String , 
        default : 'business plan statement'
    },
    market_analysis : {
        type: String, 
        default : 'market analysis statement'
    },
    balance_sheet : {
        type: String, 
        default : 'balance sheet statement'
    },
    cash_flow_statement : {
        type: String, 
        default : 'cash flow statement'
    },
    equity_statement: {
        type: String, 
        default : 'equity statement'
    },
    income_statement : {
        type: String , 
        default : 'income statement'
    },
    additional_information : {
        type: String , 
        default : 'additional information'
    },
    date : {
        type : Date , 
        default : Date.now
    }
});
const startupDemand = mongoose.model('startupDemand', startupDemandSchema);

export default startupDemand;