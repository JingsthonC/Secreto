//require("dotenv").config();
import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("publc"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
});

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/register", async (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });
  try {
    await newUser.save();
    res.render("secrets");
  } catch (err) {
    console.error(err);
    // Handle the error or send an error response to the client
    res.status(500).send("Internal Server Error");
  }
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const foundUser = await User.findOne({ email: username });

    if (foundUser && foundUser.password === password) {
      res.render("secrets");
    } else {
      // Handle case where user is not found or password doesn't match
      console.log("User not found or incorrect password");
    }
  } catch (err) {
    console.error(err);
  }
});

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
