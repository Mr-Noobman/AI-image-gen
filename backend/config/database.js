// Import mongoose library - helps us talk to MongoDB
const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // mongoose.connect() connects to our MongoDB Atlas database
    // process.env.MONGO_URI gets the connection string from .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // If connection successful, log the host name
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
  } catch (error) {
    // If connection fails, show error and exit
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit with failure code
  }
};

// Export so we can use this function in other files
module.exports = connectDB;