import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./User.js";

const salt = bcrypt.genSaltSync(10);
const campaignSchema = new mongoose.Schema({
    campaignId:{
        type: String,
        default: bcrypt.hashSync(Date.now().toString(),salt)
    },
    companyId:{
        type: String,
    },
    tokenId:{
        type: String,
    },
    createdAt:{
        type: Date,
    },
    duration:{
        type : Number,
        required: [true, 'this field is mandatory']

    },
    expirationDate:{
        type: Date,
        
    },
    label:{
        type:String,
        enum:["round 1","round 2"],
        default: 'round 1'  
    },
    tokenQuantity:{
        type:Number,
    },
    extentionDuration:{
        type:Number,
        default:0
    },
    status:{
        type: String,
        enum:["started","ended","running","extended"],
        default: 'started'  
    },
    successStatus:{
        type: Number,
        default: 2 
    }
});


// campaignSchema.post('save', async function(next) {
//     try {
//         const createdAt = this.createdAt;
//         const duration = this.duration;
//         const expirationDate = new Date(createdAt);
//         this.expirationDate=expirationDate.setDate(expirationDate.getDate() + duration);
//         const user = await User.findById(this.senderId.toString());
//         const sentNotifications = user.sentNotifications;
//         const updatedSender = await User.findOneAndUpdate(
//             { _id : this.senderId.toString() } ,
//             {
//               $set: {
//                 sentNotifications: [...sentNotifications,notId],
//               }
//             },
//             { new: true }
//           );
//         console.log(updatedSender);
//     } catch (error) {
//         console.log(error);
//     }
    
//   });

const Campaign = mongoose.model('Campaign', campaignSchema);

export default Campaign;