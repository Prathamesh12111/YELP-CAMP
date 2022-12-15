const Campground = require("../models/campground");
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
//This controllers are used to write async functions of our routes 
//so that routes page looks clean

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index.ejs", { campgrounds });
  }

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new.ejs"); 
  }

module.exports.createCampground = async (req, res,next) => {//using catchAsync error handler which we made in a seperate file
    // if(!req.body.campground) throw new ExpressError('Invalid Campgorund Details',400); //since we will not build logic for all fields such as price,image,etc so we use Joi 
    //Building a Joi Schema which runs before saving in mongoose here earlier but after moving it to another middleware reusable function

    //forward geocode(maps):
    const geoData = await geocoder.forwardGeocode({
      query:req.body.campground.location,
      limit:1
    }).send();

    const campground = new Campground(req.body.campground); //since in form we used campground in name section
    campground.geometry = geoData.body.features[0].geometry;//passing geometry into the campground after adding a new campground
    campground.images= req.files.map(f=>({url:f.path,filename:f.filename}));//mapping over whole cloudinary files/array and saving it to campground.images model
    campground.author = req.user._id;//this shows the current registered user on the show page
    await campground.save();
    // console.log(campground);
    req.flash('success','Successfully made a new Campground')//flash after saving and before redirecting
    res.redirect(`/campgrounds/${campground._id}`);
  }

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
      path:'reviews',
      populate:{
        path:'author'
      }//to get particular name of the person who made a review
    })
    .populate('author');
    if(!campground){
      req.flash('error','Cannot find that campground');
      res.redirect('/campgrounds');
    }
    res.render("campgrounds/show.ejs", { campground });
  }

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
      req.flash('error','Cannot find that campground');
      res.redirect('/campgrounds');
    }
    res.render("campgrounds/edit.ejs", { campground });
  }

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    // console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground,}); //...spread operator
    const imgs = req.files.map(f=>({url:f.path,filename:f.filename}));
    campground.images.push(...imgs);//images edit
    await campground.save();

    if(req.body.deleteImages){ //if images are checked for deletion
      for(let filename of req.body.deleteImages){
        await cloudinary.uploader.destroy(filename);//to remove the selected images from cloudinary also
      }
      await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}});
      // console.log(campground);//pull from images array whose filename is in deleteImages array and update it
    }

    req.flash('success','Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);

    if(!campground.author.equals(req.user._id)){
      req.flash("error",'You do not have permission to do that');
      res.redirect(`/campgrounds/${id}`);
    }
  }

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted campground');
    res.redirect("/campgrounds");
  }