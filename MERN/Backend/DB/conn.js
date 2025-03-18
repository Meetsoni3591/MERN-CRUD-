const mongoose = require('mongoose');
const connectMongoDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/MERN");
        console.log("Connected to MonogoDB");
    }
    catch (error) {
        console.log('Error in connecting to MongoDB:', error);
    }
};

module.exports = { connectMongoDB };