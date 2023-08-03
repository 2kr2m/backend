import io from "../initial.js";
import User from "../models/User.js";

export const trackSocket = (user)=>{
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
      
        // Assuming you have the user ID from your authentication mechanism
        const userId = user._id;
      
        // Find the user document and add the new socket ID to the array
        User.findByIdAndUpdate(
          userId,
          { $addToSet: { socketIds: socket.id } },
          { new: true }
        ).exec()
          .then((user) => {
            if (!user) {
              console.log('User not found with ID:', userId);
            } else {
              console.log('User connected');
            }
          })
          .catch((error) => {
            console.error('Error occurred while handling connection:', error);
          });
      
        // Handle disconnection
        socket.on('disconnect', async () => {
          console.log('User disconnected:', socket.id);
      
          // Remove the disconnected socket ID from the array of socket IDs for the user
          await User.findByIdAndUpdate(
            userId,
            { $pull: { socketIds: socket.id } },
            { new: true }
          ).exec();
        });
      })
}