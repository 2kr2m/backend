import mongoose from "mongoose";
import validator from 'validator';
import bcrypt from 'bcrypt';

const salt = bcrypt.genSaltSync(10);
const buytokenSchema = new mongoose.Schema({
    id:{
        type: String,
        default: bcrypt.hashSync(Date.now().toString(),salt),
    }, 
    name:{
        type: String,
        required:[true,"please enter a name"],
    },
    email:{
        type:String,
        required:[true,"please enter an email"],
        lowercase:true,
    },
    phoneNumber:{
        type: String,
        required:[true,"please enter phone number"],
    },
    quantity:{
        type: String,
        required:[true,"please enter an amount > 0"],
    },
    paymentMethod:{
        type: String,
        enum:['virement bancaire','crypto'],
        required:[true,"this field is mandatory"],
    },
    tokenName:{
        type:String,
        required:[true,"please enter a token name"],
    },
    amount:{
     type:String,
     default:'0',
    },
    status:{
        type:String,
        enum:['pending','accepted','rejected'], 
        default:'pending',
    },
    Date:{
        type:Date,
        // required:[true,"please enter a valide date"],
        default:'',
    },
    motifRejection:{
        type:String,
        default:''
    },
    rejectedBy:{
        type:String,
        default:''
    },
    rejectDate:{
        type:Date,
        // required:[true,"please enter a valide date"],
        default:'',

    }

})
const Buytoken = mongoose.model('Buytoken',buytokenSchema);

export default Buytoken;
