const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

const MONGO_URL = 'mongodb://127.0.0.1:27017/stayswift';

main().then(()=> {
    console.log("connected to db");
}).catch(err=> console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
};

const initDB = async () => {

    //first delete all data
        await Listing.deleteMany({});
        await Listing.insertMany(initData.data);

        console.log("data was Initialized");
};

initDB();