const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try{
    await mongoose.connect(process.env.MONGO_URI);
      console.log('Connected to the database');
  } catch (error) {
    console.log('Error connecting to the database', error);
    process.exit(1);
  }

  mongoose.connection.on('error', err => {
    logError(err);
  });
};

module.exports = connectDB;