const mongoose = require('mongoose');
const config = require('config');

const db = config.get('mongoURI'); //gets this URI from default.json

const connectDB = async () => {
    try {
        await mongoose.connect(db, {  //returns promises
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false
            //each option was added due to some error appears with the solution of adding an option of these
        });
        console.log('MongoDB connected....');
    } catch (err) {
        console.error(err.message);
        process.exit(1); //Exit the process when it fails
    }
}

module.exports = connectDB;