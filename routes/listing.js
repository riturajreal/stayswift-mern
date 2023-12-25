const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { listingSchema} = require("../schema");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing");

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

  
// 1. INDEX ROUTE --> GET /listings
  
router.get(
    "/",
    wrapAsync(async (req, res) => {
      const allListings = await Listing.find({});
      //console.log(allListings);
  
      res.render("listings/index.ejs", { allListings });
    })
  );
  
// 3. CREATE Route (New & Create)
  
  // a. New Route --> GET /listings/new
  router.get("/new", (req, res) => {

    // if user is not logged in then he will not be able to
    // create listing --> req.isAuthenticate() -- middleware

    console.log(req.user);
    
    if(!req.isAuthenticated()){
        req.flash("error", "You must be logged in to create listing");
        return res.redirect("/login");
    }
    res.render("listings/new.ejs");
  });
  
  // b. Create Route --> POST /listings
  
  router.post(
    "/",
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
      req.flash("success", "New Listing Created");
      res.redirect("/listings");
    })
  );
  
// 2. SHOW Route  -> GET /listings/:id
  router.get(
    "/:id",
    wrapAsync(async (req, res) => {
      let { id } = req.params;
      const listing = await Listing.findById(id).populate("reviews");

      // for failure flash
      if (!listing) {
          req.flash("error", "listings you requested for does not exist");
          res.redirect("/listings")
      }

      res.render("listings/show.ejs", { listing });
    })
  );


// 4. UPDATE : Edit & Update Route

// a. Edit Route --> GET /listings/:id/edit --> form render
router.get( "/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    // for failure flash
    if (!listing) {
      req.flash("error", "listings you requested for does not exist");
      res.redirect("/listings")
  }

    res.render("listings/edit.ejs", { listing });
  })
);

// b. Update Route --> PUT /listings/:id --> update data
router.put( "/:id", validateListing, wrapAsync(async (req, res) => {
   
    let { id } = req.params;

    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
  })
);

// 5. DELETE ROUTE --> DELETE -> /listings/:id
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
  })
);

module.exports = router;