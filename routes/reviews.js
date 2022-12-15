const express = require('express');
const router = express.Router({mergeParams:true});//after using routers they have seperate params so we will not be able to push reviews into campground so thatswhy we mergeparams
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review')
const Campground = require("../models/campground");
const {reviewSchema} = require('../schemas');
const {isLoggedIn,isReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews');

const validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
      const msg = error.details.map(el=>el.message).join(',');//element =el
      throw new ExpressError(msg,400);
    }else{
      next();
    } 
  }

router.post('/',isLoggedIn,validateReview,catchAsync(reviews.createReview)) 
  
router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(reviews.deleteReview))

module.exports = router;