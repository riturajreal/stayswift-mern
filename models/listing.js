const mongoose =  require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
 

//Schema
const listingSchema = new Schema ({

    title: {
        type:String,
        required: true,
    },

    description:String,
    image:{
        type:String,
        default : "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set : (v) => v === "" ? "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v,

    },
    price:Number,
    location:String,
    country:String,

    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : "Review"
        }
    ]

});


// jab listing delete ho to usse related saare reviews bhi delete ho jane chahiye
// iske liye delete middleware ka use karnege agar review me koi iska review pda ho to 
// delete ho jayega

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing){
    await Review.deleteMany({reviews : { $in : listing.reviews}});
    }
})

//model creation
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;