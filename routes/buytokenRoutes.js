import express from "express";
import  {accepttransfer, allbuytoken, alldemand, buytoken, buytokens, transfer}  from "../controllers/buytokenController.js"; 
const buytokenRouter = express.Router();

buytokenRouter.post('/buytoken',buytoken);
buytokenRouter.get('/alldemand',alldemand);
buytokenRouter.post('/transfer/:id',transfer);
buytokenRouter.post('/accepttransfer/:id',accepttransfer);
buytokenRouter.post('/buytokens',buytokens);
buytokenRouter.get('/allbuytoken',allbuytoken);


export default buytokenRouter;