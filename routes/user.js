const express = require('express');
const router = express.Router({mergeParams:true});
const User = require("../models/user");
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');

// 1. Signup user GET
router.get('/signup', (req,res)=> {
    res.render("user/signup.ejs");
});
// 2. Signup User POST
router.post('/signup', wrapAsync(async(req,res)=> {

    try{
        let {username, email, password} = req.body;

        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);

        req.flash("success", "Welcome to Wanderlust");

        res.redirect('/listings');
    }

    catch(e) {
        req.flash("error", e.message);
        res.redirect('/signup');
    }
}));

// 3. Login user GET 
router.get("/login",(req,res)=> {
    res.render("user/login.ejs");
} );

// 4. Login user POST
router.post("/login", passport.authenticate("local", { 
    failureRedirect: '/login', 
    failureFlash: true // Remove the trailing comma
}), async (req, res) => {
    req.flash("success","Welcome back to Wanderlust");
    res.redirect('listings');
});
 

module.exports = router;