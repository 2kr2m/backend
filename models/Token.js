import mongoose from "mongoose";
import validator from 'validator';
import bcrypt from 'bcrypt';


const salt = bcrypt.genSaltSync(10);
const tokenSchema = new mongoose.Schema({
    id:{
        type: String,
        default: bcrypt.hashSync(Date.now().toString(),salt),
    },
    tokenName:{
        type:String,
        // required:[true,"please enter a token name"],
        // unique:true,
    },
    tokenSymbol:{
        type:String,
        // required:[true,"please enter a token symbol"],
        // unique:true,
    },
    tokenTotalSupply:{
        type:String,
        // required:[true,"please enter a token supply"],
    },
    tokenPrice:{
        type:String,
        // required:[true,"please enter a token price"],
    },
    minInvest:{
        type:String,
        default:'',
    },
    maxInvest:{
        type:String,
        default:'',
    },
    companyAccount:{
        type:String,
        // required:[true,"please enter a company account"],
    },
    tokenoppAccount:{
        type:String,
        // required:[true,"please enter a tokenopp account"],
        default:'Tokenopp address'
    },
    startDate:{
        type:Date,
        // required:[true,"please enter a valide date"],
        default:'',
    },
    endDate:{
        type:Date,
        // required:[true,"please enter a valide date"],
        default:'',

    },
    duration:{
        type: Number,
        // required:[true,"please enter the duration of campaign"],
    },
    RedemptionType:{
        type:String,
        enum:['yearly','monthly','quarterly'],
        // required:[true,"this field is mandatory"],
    },
    yieldValue:{
        type:String,
        // required:[true,"this field is mandatory"],
    },
    contractAddress:{
        type:String,
        default:'',
    },   
     transactionHash: {
        type: [String],
        default: [],
    },
    soldout:{
        type:Number,
        default:0
    },
    remainToken:{
        type:String,
        default:'',
    },
    status:{
        type:String,
        enum:['Pending','Rejected','Approved'],
        default: 'Pending'
    },
    campaignName:{
        type:String,
        required: [true, 'this field is mandatory']


    },
    amount:{
        type:String,
        required: [true, 'this field is mandatory'],
        default:'0',
    },
    actionType:{
        type:String,
        enum:['share','debt','revenue sharing'],
        required:[true,"this field is mandatory"],

    },
    shares:{
        type:String,
        required:[true,"this field is mandatory"],

    },
    numberOfInvestors:{
        type:String,
        default:'',
    },
    readyToStart:{
        type:Number,
        default:0,
    },
    motifRejection:{
        type:String,
        default:''
    },
    investorCount:{
        type:Number,
        default:0,
    }
})
const Token = mongoose.model('token',tokenSchema);

export default Token;