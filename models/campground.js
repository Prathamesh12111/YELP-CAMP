const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200"); //to change the width of our images to 200px
});

const opts = {toJSON:{virtuals:true}};

const CampgroundSchema = new Schema({
  title: String,
  images: [ImageSchema],
  geometry: {
    //mapbox
    type: {
      type: String,
      enum: ["Point"], //from docs i.e. geometry.type should be a point
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    //Here we are linking campground and review model and later we will push reviews into campgrounds
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
},opts);

CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
  <p>${this.description}</p>`
});

module.exports = mongoose.model("Campground", CampgroundSchema);
