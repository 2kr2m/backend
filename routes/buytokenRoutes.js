import express from "express";
import  {accepttransfer, alldemand, buytoken, buytokens, transfer}  from "../controllers/buytokenController.js"; 
const buytokenRouter = express.Router();

buytokenRouter.post('/buytoken',buytoken);
buytokenRouter.get('/alldemand',alldemand);
buytokenRouter.post('/transfer/:id',transfer);
buytokenRouter.post('/accepttransfer/:id',accepttransfer);
buytokenRouter.post('/buytokens',buytokens);

export default buytokenRouter;