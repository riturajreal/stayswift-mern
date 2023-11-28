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
const { listingSchema, reviewSchema } = require("./schema");


const MONGO_URL = "mongodb://127.0.0.1:27017/stayswift";

main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}


// -------------- SERVER SIDE VALIDATION --------------------

// middleware for validate listing n server side
// -->  use this function as a parameter in async manipulation listing routes

// LISTINGS
const validateListing = (req, rs, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else next();
};

// REVIEWS 
const validateReview = (req,res,next)=> {
  let {error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else next();


};


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

// 1. INDEX ROUTE --> GET /listings

app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    //console.log(allListings);

    res.render("listings/index.ejs", { allListings });
  })
);

// 3. CREATE Route (New & Create)

// a. New Route --> GET /listings/new
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// b. Create Route --> POST /listings

app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    // normal method
    // let {title, description, image, price, location, country} = req.body;

    // more simpler
    // in ejs --> input --> name : listing[title]-->object

    // let listing = req.body.listing;
    // new Listing(listing);
    // console.log(listing);

    //easy method but not dry
    // if(!req.body.listing) {
    //     throw new ExpressError(400, "Send Valid data for Listing")
    // }

    //using npm p JOI -->  SERVER SIDE VALIDATION
    /*
    let result = listingSchema.validate(req.body); // check listing object
    console.log(result);

*/

    const newListing = new Listing(req.body.listing);
    await newListing.save();

    res.redirect("/listings");
  })
);

// 2. SHOW Route  -> GET /listings/:id
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");

    res.render("listings/show.ejs", { listing });
  })
);

// 4. UPDATE : Edit & Update Route

// a. Edit Route --> GET /listings/:id/edit --> form render
app.get( "/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    res.render("listings/edit.ejs", { listing });
  })
);

// b. Update Route --> PUT /listings/:id --> update data
app.put( "/listings/:id", validateListing, wrapAsync(async (req, res) => {
   
    let { id } = req.params;

    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);

// 5. DELETE ROUTE --> DELETE -> /listings/:id
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);

    res.redirect("/listings");
  })
);


// Reviews Post Route --> /listings/:id/reviews

app.post('/listings/:id/reviews', validateReview, wrapAsync(async (req,res)=> {
   let listing = await Listing.findById(req.params.id);

   let newReview = new Review(req.body.review);

   listing.reviews.push(newReview);

   await newReview.save();
   await listing.save();

  //  console.log("new Review Saved");

  //  res.send("new Review Saved");
  res.redirect(`/listings/${listing._id}`);

   })

);

// Delete Reviews Route -->  /listings/:id/reviews/reviewID
app.delete('/listings/:id/reviews/:reviewId', wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;

   // here we use $pull operator (remove) to delete only that reviews that
  // matches with our reviewId from our Listings

  // Remove the reviewId from the reviews array in the Listing
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  // Delete the actual review
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);
}));


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
