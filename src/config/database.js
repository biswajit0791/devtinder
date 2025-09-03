const monggoose = require("mongoose");

const connectDB = async () => {
  await monggoose.connect(
    "mongodb+srv://dev-tinder:devTinder123@devtinder.2ioi9nc.mongodb.net/tinder"
  );
};
module.exports = connectDB;
