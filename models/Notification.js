import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./User.js";

const salt = bcrypt.genSaltSync(10);
const notificationSchema = new mongoose.Schema({
    notifId:{
        type: String,
        default: bcrypt.hashSync(Date.now().toString(),salt)
    },
    senderId:{
        type: String,
        default:' '

    },
    receiptId:{
        type: String,
        required : true
    },
    notifTitle:{
        type: String,
        required:[true,'title is required']
    },
    notifPayload:{
        type : String,
        required: [true, 'this field is mandatory']
    },
    notifState:{
        type: Number,
        default:0
    },
    notifType:{
        type: String,
        enum:['info','success','warning','error'],
        default: 'info'
    },
    isDeleted:{
        type: Number,
        default:0
    },
    shown:{
        type : Number,
        default: 0
    }
});


notificationSchema.post('save', async function() {
    try {
        if(this.senderId !== ' '){
            const notId = this._id.toString();
            const user = await User.findById(this.senderId.toString());
            const sentNotifications = user.sentNotifications;
            const updatedSender = await User.findOneAndUpdate(
                { _id : this.senderId.toString() } ,
                {
                  $set: {
                    sentNotifications: [...sentNotifications,notId],
                  }
                },
                { new: true }
              );
        }
        

        
    } catch (error) {
        console.log(error);
    }
    
  });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;