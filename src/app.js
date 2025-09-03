const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

const User = require("./models/user");
const connectDB = require("./config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");
app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
  const { firstName, lastName, emailId, password, age, gender } = req.body;
  if (!firstName || !lastName || !emailId || !password || !age || !gender) {
    return res.status(400).send("All fields are required!");
  }
  const user = new User({
    firstName,
    lastName,
    emailId,
    password: await bcrypt.hash(password, 10),
    age,
    gender
  });
  try {
    await user.save();
    res.send("User created successfully!");
  } catch (error) {
    res.status(400).send("Error creating user: " + error.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      const token = await user.getJWT();
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000)
      });
      // Create JWT token
      // Add the token to cookie and send the response back to the user
      res.send("Login Successful!!!");
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    res.status(404).send("Error : " + error.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json(user);
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});
app.post("/senConnectionRequest", userAuth, async (req, res) => {
  res.send(req.user.firstName + " sending a connection request");
});

connectDB()
  .then(() => {
    console.log("Database connection established.");
    app.listen(7777, () => {
      console.log("Server is successfully listening on port 7777...");
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
