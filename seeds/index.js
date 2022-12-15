if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const mongoose = require("mongoose");
const dbUrl = process.env.DB_URL;

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log("Ohh no error!!");
    console.log(err);
  });

const sample = (array) => array[Math.floor(Math.random() * array.length)];
//random element of any array passed while calling this function

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "638874b7ebebfbee9f795ba3",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`, //we executed sample function and passed descriptors and places as array parameter
      description:
        " Lorem ipsum dolor, sit amet consectetur adipisicing elit. Soluta ea, accusamus sequi necessitatibus delectus qui reiciendis fugiat rerum voluptatem quae. Fugit ullam velit eum autem praesentium et repellat incidunt rem.",
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude, //cities file already had lat and long and according to geoJSON we need to give long first and then lat
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dpgcxkjqk/image/upload/v1670074912/YelpCamp/obtoszntibxwxqomfx7s.jpg",
          filename: "YelpCamp/obtoszntibxwxqomfx7s",
        },
        {
          url: "https://res.cloudinary.com/dpgcxkjqk/image/upload/v1670074917/YelpCamp/v7zvrku0e6siel8gakng.jpg",
          filename: "YelpCamp/v7zvrku0e6siel8gakng",
        },
      ],
    });

    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
}); //executing the async function
