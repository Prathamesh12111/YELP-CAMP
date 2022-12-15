if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate"); //used to get rid of upper html and use only one file boilerplate.ejs
const Campground = require("./models/campground");
const Review = require("./models/review");
const methodOverride = require("method-override");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const Joi = require("joi");
const { campgroundSchema, reviewSchema } = require("./schemas");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const session = require("express-session");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const { findByIdAndUpdate } = require("./models/campground");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const MongoStore = require("connect-mongo");
const dbUrl = process.env.DB_URL;
//mongodb://localhost:27017/yelp-camp

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log("Ohh no error!!");
    console.log(err);
  });

const app = express();
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
//app.use request run everytime irrespective of the route or method
//Middlewares are executed by adding them in app.use() and they are fucntions having access to code between any request and response
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
  secret: "thisshouldbeasecret",
  saveUninitialized: true,
  resave: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //Date.now is in millseconds and we are setting the expiry date of cookies upto a week so that a user should not stay logged in permanently
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig)); //cookies can be viewed in inspect under application tab
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); //passport.session should always be after session app.use
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // console.log(req.session);
  res.locals.currentUser = req.user; //this req.user shows whether user is loggedin or not and gives info accordingly
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
}); //setting up flash middleware for every request

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.all("*", (req, res, next) => {
  //* for all routes
  next(new ExpressError("Page not found", 404));
}); //express error handler--for any non-existent route

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no, Something went wrong";
  res.status(statusCode).render("error", { err });
}); //for any non-exixtent id

app.listen(4000, () => {
  console.log("Listening on Port 4000!!");
});
