const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema ({

    name : String,

    comment : String,

    rating : {
        type: Number,
        min:1,
        max:5,
    },

    createdAt : {
        type: Date,
        default : Date.now()
    }
});

module.exports = mongoose.model ("Review", reviewSchema);

// many reviews are related with 1 listing
// relation 1*n; --> one to many
