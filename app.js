const express = require("express");
const app = express();
const mongoose =  require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Listing = require ("./models/listing");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");

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

//method
app.use(methodOverride("_method"));

//ejs mate
app.engine('ejs', ejsMate);

// public folder
app.use(express.static(path.join(__dirname, "/public")));



// --------------- ROUTES ---------------------------

app.get("/", (req,res) => {
    res.send("Hii I am root");
});

// 1. INDEX ROUTE --> GET /listings

app.get("/listings", wrapAsync ( async (req, res) => {

      const allListings = await Listing.find({});
     //console.log(allListings);

      res.render("listings/index.ejs", { allListings });

    })
  );



// 3. CREATE Route (New & Create)

// a. New Route --> GET /listings/new
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

// b. Create Route --> POST /listings

app.post("/listings", wrapAsync ( async(req,res,next)=> {

    // normal method
    // let {title, description, image, price, location, country} = req.body;

    // more simpler
    // in ejs --> input --> name : listing[title]-->object

    // let listing = req.body.listing;
    // new Listing(listing);
    // console.log(listing);

    if(!req.body.listing) {
        throw new ExpressError(400, "Send Valid data for Listing")
    }

    const newListing = new Listing (req.body.listing);
    await newListing.save();

    res.redirect("/listings");

    })
);



// 2. SHOW Route  -> GET /listings/:id
app.get("/listings/:id", wrapAsync( async(req,res)=> {
    let {id}= req.params;
    const listing = await Listing.findById(id);

    res.render("listings/show.ejs", {listing});

  })
);

// 4. UPDATE : Edit & Update Route

// a. Edit Route --> GET /listings/:id/edit --> form render
app.get("/listings/:id/edit", wrapAsync ( async(req,res)=> {
    let {id} = req.params;
    const listing = await Listing.findById(id);

    res.render("listings/edit.ejs", { listing });

    })
);

// b. Update Route --> PUT /listings/:id --> update data
app.put("/listings/:id", wrapAsync( async(req,res) => {

    if(!req.body.listing) {
        throw new ExpressError(400, "Send Valid data for Listing")
    }


    let{id}= req.params;

    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
    })
);


// 5. DELETE ROUTE --> DELETE -> /listings/:id
app.delete("/listings/:id", wrapAsync( async(req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);

    res.redirect("/listings"); 
  })
);

// for other routes which we dont have
app.all("*", (req,res,next)=> {
    next(new ExpressError(404, "Page not found"));
})


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

// -------------- ERROR Middleware ------------

// 
app.use((err,req,res,next)=> {
    let {status=500,message="Something went wrong"} = err;
    // error ejs
    res.status(status).render("listings/error.ejs", {err});
});


// listener 
app.listen(8080, ()=> {
    console.log("server is listening to port 8080" );
});