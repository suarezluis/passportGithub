require("dotenv").config();

var express = require("express");
var passport = require("passport");
var GitHubStrategy = require("passport-github").Strategy;

// Configure the github strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the github API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(
  new GitHubStrategy(
    {
      clientID: "client id ",
      clientSecret: "client secret",
      callbackURL: "http://localhost:3001/user/signin/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      // In this example, the user's github profile is supplied as the user
      // record.  In a production-quality application, the github profile should
      // be associated with a user record in the application's database, which
      // allows for account linking and authentication with other identity
      // providers.
      return cb(null, profile);
    }
  )
);

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete github profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.

app.use(require("cookie-parser")());
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
  })
);

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get("/", function(req, res) {
  res.render("home", { user: req.user });
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/login/github", passport.authenticate("github"));

app.get(
  "/user/signin/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  function(req, res) {
    console.log(req);
    res.redirect("/");
  }
);

app.get("/profile", require("connect-ensure-login").ensureLoggedIn(), function(
  req,
  res
) {
  res.render("profile", { user: req.user });
});

app.listen(3001);
