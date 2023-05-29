import express from 'express';

import {signup_get,signup_post,login_get,login_post, logout_get,resetPass1_post,resetPass2_post, verif_get, enableFA, generateTwoFactorSecret,verifyTwoFactorCode} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.get("/signup",signup_get);
authRouter.post("/signup",signup_post);
authRouter.get("/verif/:id/:token",verif_get);
// authRouter.post("/resendverif/:id",resendverif_get);
authRouter.post("/email-to-reset-pass",resetPass1_post);
authRouter.post("/reset-password/:userId/:token",resetPass2_post);
authRouter.get("/login0",login_get);
authRouter.post("/login",login_post);
authRouter.post('/enableFA', enableFA);
authRouter.post('/generate-two-factor-secret', generateTwoFactorSecret);
authRouter.post('/verify-two-factor-code', verifyTwoFactorCode);
authRouter.get("/logout",logout_get);


export default authRouter;