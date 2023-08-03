import express from 'express';

import {signup_get,signup_post,login_get,login_post, logout,resetPass1_post,resetPass2_post, verif_get, enableFA,verifyTwoFactorCode, generateTwoFactorSecret_get, getuser, modifyuser, setuser, changeemail, changepassword} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.get("/signup",signup_get);
authRouter.post("/signup",signup_post);
authRouter.get("/verif/:id/:token",verif_get);
// authRouter.post("/resendverif/:id",resendverif_get);
authRouter.post("/email-to-reset-pass",resetPass1_post);
authRouter.post("/reset-password",resetPass2_post);
authRouter.get("/login0",login_get);
authRouter.post("/login",login_post);
authRouter.post('/enableFA', enableFA);
authRouter.get('/generateTwoFactorSecret',generateTwoFactorSecret_get);
// authRouter.post('/generate-two-factor-secret', generateTwoFactorSecret);
authRouter.post('/verify-two-factor-code', verifyTwoFactorCode);
authRouter.get("/logout",logout);
authRouter.get("/get-user",getuser);
authRouter.post("/modifyuser",modifyuser);
authRouter.get("/setuser",setuser);
authRouter.post("/changeemail",changeemail);
authRouter.post("/changepassword",changepassword);
export default authRouter;