const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync");
const { reviewSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");
const Review = require("../models/review");
const Listing = require("../models/listing");


// -------------- SERVER SIDE VALIDATION --------------------

// middleware for validate listing & server side

// REVIEWS 
const validateReview = (req,res,next)=> {
    let {error } = reviewSchema.validate(req.body);
  
    if (error) {
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errMsg);
    } else next();
  
  
  };


// Reviews Post Route --> /listings/:id/reviews
router.post('/', validateReview, wrapAsync(async (req,res)=> { 

    // yha id nhi aayegi listing use karenge mergeParams //check line 2
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
router.delete('/:reviewId', wrapAsync(async (req, res) => {
   let { id, reviewId } = req.params;
 
    // here we use $pull operator (remove) to delete only that reviews that
   // matches with our reviewId from our Listings
 
   // Remove the reviewId from the reviews array in the Listing
   await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
 
   // Delete the actual review
   await Review.findByIdAndDelete(reviewId);
 
   res.redirect(`/listings/${id}`);
 }));
 

 module.exports = router;