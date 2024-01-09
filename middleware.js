// ensure that user is Logged in while processing 
// some request

// for that we use passport js --> isAuthenticated function

module.exports.isLoggedIn = (req,res,next)=> {
    // console.log(req.user);
    if(!req.isAuthenticated()) {
        // redirect URL
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create a listing !");
        return res.redirect("/login");
    }

    next(); // --- authenticated then pass control
}


// 2. Save redirect URL --> Middleware 
// if user is not logged in to perfrom some task
// then he will login in and again repeat process
// to do that task so here we have Previous URL

module.exports.saveRedirectUrl = (req,res,next)=> {
    if(req.session.redirectUrl) {
        // here we use locals because passport will delete that 
        res.locals.redirectUrl = req.session.redirectUrl;
    }

    next();
}