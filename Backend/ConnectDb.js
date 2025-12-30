const mongoose = require('mongoose');
const mongourl = process.env.MONGO_URI || "mongodb://localhost:27017/Editor";
const connectmongodb = async () => {
    try {
        console.log("Attempting to connect to Mongo...");
        // Log masked URI to check if env var is loaded
        const maskedURI = mongourl.replace(/:([^@]+)@/, ':****@');
        console.log("Using URI:", maskedURI);

        mongoose.connection.on('connected', () => console.log('Mongoose event: Connected'));
        mongoose.connection.on('error', (err) => console.error('Mongoose event: Error:', err));
        mongoose.connection.on('disconnected', () => console.log('Mongoose event: Disconnected'));

        await mongoose.connect(mongourl);
        console.log("Connected to DBMS (Await resolved)");
    } catch (error) {
        console.error("Failed to connect to DBMS:", error);
        throw error;
    }
};

module.exports = connectmongodb;
