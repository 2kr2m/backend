import express from "express";
import { fetchNotif, sendNotif } from "../controllers/notificationController.js";
const notificationfRouter = express.Router();

notificationfRouter.post('/admin/send-notif/:id',sendNotif);
notificationfRouter.get('/notifications/:id',fetchNotif);

export default notificationfRouter;