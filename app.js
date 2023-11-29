const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Listing = require("./models/listing");
const Review = require("./models/review");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const session = require('express-session');
// JOI Schema
const { listingSchema, reviewSchema } = require("./schema");

const flash = require('connect-flash');

// session options 
const sessionOptions = {
  secret : "mysecretstring",
  resave : false,
  saveUninitialized : true,

  // adding cookie options : 
  cookie : {
    expires : Date.now() + 7*24*60*60*1000, // time in milliseconds --> 1 Week
    maxAge : 7*24*60*60*1000,
    httpOnly : true,

  }
} 

// Connect Flash
app.use(flash());

// express sesions
app.use(session(sessionOptions)); // check in application on browser

// connect flash - res.locals middleware
app.use((req, res, next)=> {
  res.locals.success = req.flash("success");
  next();
});

// Routes
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");


// ------------DB Connection --------------------

const MONGO_URL = "mongodb://127.0.0.1:27017/stayswift";

main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// -------------------------------------------------------

//ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// url
app.use(express.urlencoded({ extended: true }));

//method
app.use(methodOverride("_method"));

//ejs mate
app.engine("ejs", ejsMate);

// public folder
app.use(express.static(path.join(__dirname, "/public")));



// --------------- ROUTES ---------------------------

app.get("/", (req, res) => {
  res.send("Hii I am root");
});

// listings routes
app.use('/listings', listings);

// review routes
app.use("/listings/:id/reviews", reviews);


// for other routes which we dont have
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
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

// -------------- ERROR Middleware ------------

//
app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong" } = err;
  // error ejs
  res.status(status).render("listings/error.ejs", { err });
});

// listener
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
