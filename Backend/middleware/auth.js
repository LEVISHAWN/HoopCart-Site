const checkAuth = (req, res, next) => {
    // Make user data available to all templates
    res.locals.user = req.session.user || null;
    res.locals.isLoggedIn = req.session.user?.isLoggedIn || false;
    next();
};

module.exports = checkAuth; 