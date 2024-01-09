const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

// 1. Signup user GET
router.get("/signup", (req, res) => {
  res.render("user/signup.ejs");
});
// 2. Signup User POST
router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;

      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);
      // console.log(registeredUser);

      // if user is successfully sign up then automatically login user
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }

        req.flash("success", "Welcome to Wanderlust");

        res.redirect("/listings");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  })
);

// 3. Login user GET
router.get("/login", (req, res) => {
  res.render("user/login.ejs");
});

// 4. Login user POST
router.post(
  "/login",saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true, // Remove the trailing comma
  }),
  async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust");
    // console.log('User:', req.user);
    res.redirect(res.locals.redirectUrl);
  }
);

// 5. Logout --> req.logout();
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    req.flash("success", "you are logged out");
    res.redirect("/listings");
  });
});

module.exports = router;
