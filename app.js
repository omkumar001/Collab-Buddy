//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.render("home");
});

app.post("/", function (req, res) {});

app.get("/login", function (req, res) {
  res.render("login");
});

app.listen(3000, function () {
  console.log("Server started at the port 3000.");
});
