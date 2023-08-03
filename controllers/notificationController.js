import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const sendNotif = async(req,res)=>{
    
    try {
        if(await User.findById(req.params.id)){
            const notif = req.body;
            notif.senderId = req.params.id;
            const createdNotif = await Notification.create(notif);
            res.status(201).send(createdNotif);
        }
        res.status(400).send('Permission denied');
    } catch (error) {
        console.log(error);     
    }
}
export const setShownAlertNotif = async(req,res)=>{
    
    try {
        await Notification.findByIdAndUpdate(req.params.id,{shown:1}, { new: true });
    } catch (error) {
        console.log(error);     
    }
}
export const fetchNotif = async(req,res)=>{
    try {
        const { id } = req.params;
    
        const data = await Notification.find({ receiptId : id , isDeleted : 0 });
    
        res.json(data.reverse());

      } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

export const deleteNotif = async (req,res)=>{
    try {
       await Notification.findByIdAndUpdate(req.params.id, {isDeleted:1}, { new: true });;
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
};
