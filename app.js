const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const ejs = require("ejs");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/uploads"));
app.set("view engine", "ejs");
const mongoose = require("mongoose");

app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);

const BuddyModel = require("./models/Buddy");
const BuddyApplication = require("./models/BuddyApplication");

const mongoURI = "mongodb://localhost:27017/buddyDB";

mongoose
  .connect("mongodb://localhost:27017/buddyDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  .then((res) => {
    console.log("Connected Mongo");
  });

// Create store for session

const store = new MongoDBSession({
  uri: mongoURI,
  collection: "mySessions",
});

app.use(
  session({
    secret: "key that will sign cookie",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else res.redirect("/login");
};

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", async function (req, res) {
  const { username, email, password } = req.body;

  //  let buddy= await BuddyModel.findOne({email});

  //  if(buddy)
  //  return res.redirect("/register");

  const hashedPassword = await bcrypt.hash(password, 12);

  const buddy = new BuddyModel({
    username,
    email,
    password: hashedPassword,
  });

  await buddy.save(function (er) {
    if (!er) {
      console.log("Successfully saved buddy details");

      res.redirect("/login");
    } else if ((er.code = 11000)) {
      res.render("register", {
        dup: false,
      });
    }
  });
  // res.redirect("/login");
});

app.post("/login", async function (req, res) {
  const { email, password } = req.body;

  const buddy = await BuddyModel.findOne({ email });
  //   console.log(user);
  if (!buddy) return res.redirect("/login");

  const isMatch = await bcrypt.compare(password, buddy.password);
  //const usernam=user.username;

  if (!isMatch) res.redirect("/login");

  req.session.isAuth = true;
  req.session.cookie.expires = new Date(Date.now() + 120 * 1000);

  buddy.sessionID = req.session.id;
  buddy.save();

  res.redirect("/shome");
});

app.get("/dashboard", isAuth, async function (req, res) {
  const budd = await BuddyModel.findOne({ sessionID: req.session.id });
  if (budd) {
    res.render("shome", {
      buddy: budd,
    });
  }
});

app.get("/search", (req, res) => {
  try {
    BuddyApplication.find(
      {
        $or: [
          { fullname: { $regex : req.query.dsearch } },
          { specialization :{ $regex : req.query.dsearch } } 
        ],
      },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.render("dashboard", { data: data });
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.get("/",  function (req, res) {
  if(req.session.isAuth)
  {
    res.redirect("/shome");
 
  }
res.render("home");

});

app.listen("3000", function (req, res) {
  console.log("Connected successfully to the server");
});
