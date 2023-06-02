
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const connection = async () => {
    try {
        // const connectionParams = {
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true,
        // };
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("connected to database.");
    } catch (error) {
        console.log(error, "could not connect database.");
    }
};
// mongoose
//   .connect(process.env.MONGODB_URI, {
//     // dbName: process.env.DB_NAME,
//     // user: process.env.DB_USER,
//     // pass: process.env.DB_PASS,
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   })
//   .then(() => {
//     console.log('connected to db');
//   })
//   .catch((err) => {
//     console.log(err.message);
//   }); 