import express from "express";
import { deleteNotif, fetchNotif, sendNotif, setShownAlertNotif } from "../controllers/notificationController.js";
const notificationfRouter = express.Router();

notificationfRouter.post('/admin/send-notif/:id',sendNotif);
notificationfRouter.get('/notifications/:id',fetchNotif);
notificationfRouter.post('/notification/alert/:id',setShownAlertNotif);
notificationfRouter.delete('/notification/delete/:id',deleteNotif);

export default notificationfRouter;