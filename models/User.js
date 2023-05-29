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
    }
});

// fire a hash function for password before save
userSchema.pre('save',async function(next){
    const salt = await bcrypt.genSalt();
    this.password= await bcrypt.hash(this.password,salt);
    next();
});

//Static method to login user
userSchema.statics.login = async function(email,password){
    const user = await this.findOne({email});
    if (user) {
        const auth = await bcrypt.compare(password,user.password);
        // password == user.password;
        if(auth){
            return user; 
        }
        throw Error('invalid inputed data');
    }
    throw Error('invalid inputed data');
}

const User = mongoose.model('user',userSchema);

export default User;