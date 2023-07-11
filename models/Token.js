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
        required:[true,"please enter a token name"],
        unique:true,
    },
    tokenSymbol:{
        type:String,
        required:[true,"please enter a token symbol"],
        unique:true,
    },
    tokenTotalSupply:{
        type:String,
        required:[true,"please enter a token supply"],
    },
    tokenPrice:{
        type:String,
        required:[true,"please enter a token price"],
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
        required:[true,"please enter a company account"],
    },
    tokenoppAccount:{
        type:String,
        required:[true,"please enter a tokenopp account"],
    },
    startDate:{
        type:Date,
        required:[true,"please enter a valide date"],
    },
    endDate:{
        type:Date,
        required:[true,"please enter a valide date"],
    },
    RedemptionType:{
        type:String,
        enum:['yearly','monthly','quarterly'],
        required:[true,"this field is mandatory"],
    },
    yieldValue:{
        type:String,
        required:[true,"this field is mandatory"],
    },
    actionType:{
        type:String,
        enum:['share','debt','revenue sharing'],
        required:[true,"this field is mandatory"],
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
})
const Token = mongoose.model('token',tokenSchema);

export default Token;