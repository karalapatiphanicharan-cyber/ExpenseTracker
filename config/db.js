const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting database connection...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);

    if (error.message.includes('ECONNREFUSED')) {
      console.error('Diagnostic: Connection refused. Check if your IP is whitelisted in MongoDB Atlas and that the cluster is reachable.');
    } else if (error.message.includes('querySrv ETIMEOUT')) {
      console.error('Diagnostic: DNS query timeout. Check your network/DNS settings.');
    } else if (error.message.includes('authentication failed')) {
      console.error('Diagnostic: Authentication failed. Verify your username and password in the MONGODB_URI.');
    }

    process.exit(1);
  }
};

module.exports = connectDB;
