import mongoose from "mongoose";
import validator from 'validator';
import bcrypt from 'bcrypt';

const isEmail = validator.isEmail;
const salt = bcrypt.genSaltSync(10);
const userSchema = new mongoose.Schema({
    id:{
        type: String,
        default: bcrypt.hashSync(Date.now().toString(),salt),
    },
    userName:{
        type:String,
        required:[true,"please enter a user name"],
        unique:true,
    },
    firstName:{
        type:String,
        default:''
    },
    lastName:{
        type:String,
        default:''
    },
    phone:{
        type:String,
        default:''
    },
    rib:{
        type:String,
        default:''
    },
    localisation:{
        type:String,
        default:''
    },
    paymentMethod:{
        type:String,
        enum:['virement bancaire','crypto'],
        default:'virement bancaire',
    },
    email:{
        type:String,
        required:[true,"please enter an email"],
        unique:true,
        lowercase:true,
        validate:[isEmail,"please enter a valid email"]
    },
    password:{
        type:String,
        required:[true,"please enter a password"],
        minlength:[6,"the password should have at least 6 caracters"]
    },
    userType:{
        type:String,
        enum:['investor','startup','admin'],
        required:[true,"this field is mandatory"]
    },
    role:{
        type:String,
        default:'regular'
    },
    createdBy:{
        type: String,
        default:'1'
    },
    verified:{
        type:Number,
        default:0
    },
    twoFactorEnabled:{
        type:Number,
        default:0
    },
    twoFactorSecret:{
        type:Number,
        default:0
    },
    accessToken:{
        type: String,
        default:''
    },
    resetToken:{
        type: String,
        default:''
    } ,
    address:{
        type: String,
        default:''
    },
    status:{
        type:String,
        enum:['pending','verified','rejected'],
        default: 'pending'
    },
    isDeleted:{
        type:Number,
        default:0
    }

});

// fire a hash function for password before save
userSchema.pre('save',async function(next){
    const salt = await bcrypt.genSalt();
    this.password= await bcrypt.hash(this.password,salt);
    // this.password= await bcrypt.hash(this.password,10);
    next();
});

// //Static method to login user
// userSchema.statics.login = async function(email,password){
//     const user = await this.findOne({email});
//     try {
      
//       const auth = await bcrypt.compare(password,user.password);
//       if (user) {
//         if (user.verified==0){
//             res.status(400).send('Please Verify your Account to Login');
            
//         }

        
//         else if (!auth){
//             res.status(400).send('fail');
//             console.log(password,user.password);}
//         else if (user.twoFactorEnabled==1){
//                 res.redirect('http://localhost:3000/api/auth/generateTwoFactorSecret');
//         }
//         else { 
//             res.status(200).send('success');
//             console.log(password,user.password);}
//           throw Error('invalid inputed data');
//       }
//   } catch (error) {
//     throw Error('invalid inputed data');
//   }
// }
const User = mongoose.model('user',userSchema);

export default User;