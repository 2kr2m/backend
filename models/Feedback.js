import mongoose from "mongoose";
import validator from 'validator';
import bcrypt from 'bcrypt';

const salt = bcrypt.genSaltSync(10);
const FeedbackSchema = new mongoose.Schema({
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
    subject:{
        type: String,
        required:[true,"please enter a subject"],
    },
    message:{
        type: String,
        required:[true,"please enter a message"],
    },
    usernameofrejector:{
        type: String,
        required:[true,"please enter a name"],
    },
    tokenName:{
        type: String,
        default:'',
    }
    
})
const Feedback = mongoose.model('Feedback',FeedbackSchema);

export default Feedback; 