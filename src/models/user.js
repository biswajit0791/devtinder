const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`
      }
    },
    password: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      min: 18
    },
    gender: {
      type: String,
      enum: ["male", "female", "0thers"],
      message: `{VALUE} is not a valid gender type`
    }
  },
  { timestamps: true }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "dev@Tinder$790", {
    expiresIn: "1d"
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;
  const isValidPassword = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );
  return isValidPassword;
};

module.exports = mongoose.model("User", userSchema);
