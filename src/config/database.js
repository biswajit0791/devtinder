const monggoose = require("mongoose");

const connectDB = async () => {
  await monggoose.connect(process.env.DB_CONNECTION_SECRET);
};
module.exports = connectDB;
