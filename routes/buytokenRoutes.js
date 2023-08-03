import express from "express";
import  {accepttransfer, addFeedback, allbuytoken, alldemand, buytoken, buytokens, getBuyTokenById, rejectTransfer, rejectionDetails, transfer}  from "../controllers/buytokenController.js"; 
const buytokenRouter = express.Router();

buytokenRouter.post('/buytoken',buytoken);
buytokenRouter.get('/alldemand',alldemand);
buytokenRouter.post('/transfer/:id',transfer);
buytokenRouter.post('/accepttransfer/:id',accepttransfer);
buytokenRouter.post('/buytokens',buytokens);
buytokenRouter.get('/allbuytoken',allbuytoken);
buytokenRouter.post('/rejectTransfer/:id',rejectTransfer);
buytokenRouter.get('/getBuyTokenById/:id',getBuyTokenById);
buytokenRouter.get('/rejectionDetails',rejectionDetails);
buytokenRouter.post('/addFeedback',addFeedback);
export default buytokenRouter;