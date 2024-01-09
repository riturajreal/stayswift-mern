// ensure that user is Logged in while processing 
// some request

// for that we use passport js --> isAuthenticated function

module.exports.isLoggedIn = (req,res,next)=> {
    // console.log(req.user);
    if(!req.isAuthenticated()) {
        req.flash("error", "you must be logged in to create a listing !");
        return res.redirect("/login");
    }

    next(); // --- authenticated then pass control
}