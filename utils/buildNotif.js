import io from "../initial.js";
import Campaign from "../models/Campaign.js";
import Notification from "../models/Notification.js";

let onlineUsers = new Set();

// const addNewUser = (username, socketId) => {
//   !onlineUsers.some((user) => user.username === username) &&
//     onlineUsers.push({ username, socketId });
// };

// const removeUser = (socketId) => {
//   onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
// };

// const getUser = (username) => {
//   return onlineUsers.find((user) => user.username === username);
// };

export const onConnection = async (user,address)=>{
    const notif = new Notification({
        receiptId : user._id,
        notifTitle: "Welcome!",
        notifPayload: `Welcome to T-Raise ! this is your address ${address} . Visit Settings to manage your notifications.`
    });    
    await notif.save();
    const notifications = await Notification.find({receiptId:notif.receiptId});
    io.on("connection", socket => {
        console.log('New client connected');
        socket.on('disconnect', () => {
            console.log('Client disconnected');
            onlineUsers.delete(socket.id); // Remove the disconnected user from the set
        });
        socket.to(socket.id).emit('userLoggedIn',async() => {

            if (!onlineUsers.has(socket.id)) {
            // user.socketId = socket.id
            onlineUsers.add(socket.id); // Add the user to the set if not already present
            console.log(onlineUsers);
            io.to(socket.id).emit('newLoginNotif',notifications.reverse());
            } 
        });
        
});
}
export const statusUpdate = async(user)=>{
    const notif = new Notification({
        receiptId : user._id,
        notifTitle: "Status Verification",
        notifPayload: "Congratulation ! , your account has been verified. You can now enjoy with all the T-Rex features. "
    });    
    await notif.save();
    const notifications = await Notification.find({receiptId:notif.receiptId});
    io.on("connection", socket => {
        console.log('New client connected');
       
        if (!onlineUsers.has(socket.id)) {
            onlineUsers.add(socket.id);
            io.to(socket.id).emit('userStatusUpdate', notifications.reverse());
        }
       
        socket.on('disconnect', () => {
            console.log('Client disconnected');
            onlineUsers.delete(socket.id); // Remove the disconnected user from the set
        });

    });
}
export const notifStartCampaign = async (campaign)=>{
    const notif = new Notification({
        receiptId : campaign.ownerId,
        notifTitle: "New Campaign",
        notifPayload: `Congratulation ! , you have successfully started your fund raising campaign valid until ${campaign.expirationDate} . Please check your campaign section for more details.`
    });    
    await notif.save();
    const notifications = await Notification.find({receiptId:notif.receiptId});
    io.on("connection", socket => {
        console.log('New client connected');
       
        if (!onlineUsers.has(socket.id)) {
            onlineUsers.add(socket.id);
            io.to(socket.id).emit('notifStartCampaign',notifications.reverse());
        }
       
        socket.on('disconnect', () => {
            console.log('Client disconnected');
            onlineUsers.delete(socket.id); // Remove the disconnected user from the set
        });

    });
} 
export const campaignExpirationAlert = async (user)=>{
    const campaign =await Campaign.find({ownerId : user._id});
    console.log(campaign);
    if(campaign){
        const today = new Date();
        const timeDifference = campaign[0].expirationDate - today;
        const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
        if(daysDifference <= 2 && daysDifference > 0){
            const notif = new Notification({
                receiptId : campaign[0].ownerId,
                notifTitle: "Campaign Expiration",
                notifPayload: `Warning! , this is a reminder .Your campaign expires in ${Math.round(daysDifference)} days.`,
                notifType: "warning"
            });    
            await notif.save();
            const notifications = await Notification.find({receiptId:notif.receiptId});
            io.on("connection", socket => {
                console.log('New client connected');
                if (!onlineUsers.has(socket.id)) {
                    onlineUsers.add(socket.id);
                    io.to(socket.id).emit('campaignExpirationAlert', notifications.reverse());    
                }
               
                socket.on('disconnect', () => {
                    console.log('Client disconnected');
                    onlineUsers.delete(socket.id); // Remove the disconnected user from the set
                });
        
            });
        }
    }
    
       
    //   io.on("connection", socket => {
    //         console.log('New client connected');  
    //     const campaign = Campaign.find({ownerId : user._id});
    //     if(campaign){
    //     // Calculate the difference between the two dates in milliseconds
    //     const timeDifference = campaign.expirationDate - new Date();

    //     // Convert milliseconds to days
    //     const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

    //     // Round the difference to the nearest whole number (optional)
    //     const roundedDaysDifference = Math.round(daysDifference);
    //     if (roundedDaysDifference<=2 && roundedDaysDifference>2) {
    //         if (!onlineUsers.has(socket.id)) {
    //             onlineUsers.add(socket.id);
    //             io.to(socket.id).emit('campaignExpirationAlert', "Warning !! your campaign is about to end");
    //         }
    //     }
    // }
    //     socket.on('disconnect', () => {
    //         console.log('Client disconnected');
    //         onlineUsers.delete(socket.id); // Remove the disconnected user from the set
    //     });

    // });

    }