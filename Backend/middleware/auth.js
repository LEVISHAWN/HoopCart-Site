const checkAuth = (req, res, next) => {
    if (!req.session.user || !req.session.user.isLoggedIn) {
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.status(401).json({ error: "Authentication required" });
        }
        return res.redirect("/auth/login");
    }

    // Make user data available to all templates
    res.locals.user = req.session.user;
    res.locals.isLoggedIn = true;
    next();
};

module.exports = checkAuth; 