const express = require("express");
const app = express();
const mongoose =  require("mongoose");
const path = require("path");
const  Listing = require ("./models/listing");

const MONGO_URL = 'mongodb://127.0.0.1:27017/stayswift';

main().then(()=> {
    console.log("connected to db");
}).catch(err=> console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
};



//ejs
app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));

// url
app.use(express.urlencoded({extended:true}));

app.get("/", (req,res) => {
    res.send("Hii I am root");
});

// 1. INDEX ROUTE --> GET /listings

app.get("/listings", async (req, res) => {
    try {
      const allListings = await Listing.find({});
     //console.log(allListings);

      res.render("listings/index", { allListings });

    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  });



// 3. CREATE Route (New & Create)

// a. New Route --> GET /listings/new
app.get("/listings/new",(req,res)=>{
    res.render("listings/new");
});

// b. Create Route --> POST /listings

app.post("/listings", async(req,res)=> {

    // normal method
    // let {title, description, image, price, location, country} = req.body;

    // more simpler
    // in ejs --> input --> name : listing[title]-->object

    // let listing = req.body.listing;
    // new Listing(listing);
    // console.log(listing);

    const newListing = new Listing (req.body.listing);
    await newListing.save();

    res.redirect("/listings");

});

// 2. SHOW Route  -> GET /listings/:id
app.get("/listings/:id", async(req,res)=> {
    let {id}= req.params;
    const listing = await Listing.findById(id);

    res.render("listings/show", {listing});

});





// sample test
/*
app.get("/testListing", async(req,res)=> {

    let sampleListing  = new Listing ({
        title : "My New Villa",
        description : "A Luxury House",
        price : 1200,
        location : "Delhi",
        country : "India"

    });

    await sampleListing.save();
    console.log("sample was tested");
    res.send("successful Testing");

});

*/

app.listen(8080, ()=> {
    console.log("server is listening to port 8080" );
});