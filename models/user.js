const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose"); // used as a plugin

// in this we only define email because
// passport local mongoose automatically
// define username and password
const userSchema = new Schema ({
    email : {
        type : String,
        required : true, 
    }
});

userSchema.plugin(passportLocalMongoose); // this we add some methods --> SEE API
module.exports = mongoose.model("User", userSchema);

