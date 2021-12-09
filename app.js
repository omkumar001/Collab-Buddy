require('dotenv').config();
const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const ejs = require("ejs");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const nodemailer = require("nodemailer");


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

const mongoURI = "mongodb+srv://ayush:123@cluster0.kah3v.mongodb.net/buddyDB?retryWrites=true&w=majority"

mongoose
  .connect(mongoURI, {
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
  res.render("login");
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
      res.render("login", {
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
  req.session.cookie.expires = new Date(Date.now() + 360000 * 1000);

  buddy.sessionID = req.session.id;
  buddy.save();

  res.redirect("/shome");
});

app.get("/shome", isAuth, async function (req, res) {
  const budd = await BuddyModel.findOne({ sessionID: req.session.id });
  if (budd) {
    res.render("shome", {
      buddy: budd,
    });
  }
});

app.get("/search", async (req,res) => {
  try {

    const buddy = await BuddyModel.findOne({ sessionID: req.session.id });
    // console.log(buddy);
    BuddyApplication.find(
      {
        $or: [
          { fullname: { $regex: req.query.dsearch } },
          { specialization: { $regex: req.query.dsearch } },
        ],
      },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.render("sresult", { data: data ,
          searchdata:req.query.dsearch,
          buddy:buddy

        });
        //  console.log(data);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.get("/", function (req, res) {
  if (req.session.isAuth) {
    res.redirect("/shome");
  }
  res.render("home");
});
app.get("/logout", async function (req, res) {
    const buddy = await BuddyModel.findOne({ sessionID: req.session.id });
     
    buddy.sessionID="null";
    buddy.save(function(e)
    {
        if(!e)
        console.log("Logged out");
    });

  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/");
  });
});

app.get("/myprofile", async function (req, res) {
  const buddy = await BuddyModel.findOne({ sessionID: req.session.id });

  // console.log(req.session.id);
  //  console.log(buddy);
  const bud = await BuddyApplication.findOne({ myemail: buddy.email });
  res.render("myprofile", {
    buddata: bud,
  });
});
app.get("/myapplication", async function (req, res) {
  res.render("myapplication");
});

app.post("/myapplication", async function (req, res) {
  const budd = await BuddyModel.findOne({ sessionID: req.session.id });
  //console.log(budd.email);

  const newApplication = new BuddyApplication({
    myemail: budd.email,
    fullname: req.body.fullname,
    institutename: req.body.institutename,
    portfolios: req.body.portfolios,
    contactno: req.body.contactno,
    achievements: req.body.achievements,
    projects: req.body.projects,
    techskills: req.body.tech_skill,
    softskills: req.body.soft_skill,
    workshops: req.body.workshops,
    certifications: req.body.certifications,
    rating: "0",
    specialization: req.body.specialization,
  });
  await newApplication.save(function (err) {
    if (!err) {
      console.log("Application Saved");
      res.redirect("/myprofile");
    } else console.log(err);
  });
});

app.get("/bud/:myemail",async function(req,res)
{
    const fullprofile=await BuddyApplication.findOne({myemail:req.params.myemail});
    const commentbuddy = await BuddyModel.findOne({ sessionID: req.session.id });
    res.render("showprofile",
    {
        dataa:fullprofile,
        commentby:commentbuddy.username
    })
});

app.get("/sendrequest/:myemail",async function(req,res)
{
  const buddy = await BuddyModel.findOne({ sessionID: req.session.id });
   

async function main() {
  let testAccount = await nodemailer.createTestAccount();

  
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER, // generated ethereal user
      pass: process.env.MAIL_PASS, // generated ethereal password
    },
  });

  let info = await transporter.sendMail({
    from: buddy.email, // sender address
    to: req.params.myemail, // list of receivers
    subject: "Invite for Contribution in Project", // Subject line
    text: "Hi there, the user "+req.params.buddyusername+" wants to invite you for your collaboration on the project. Kindly visit websitename and confirm your availability.",
  });
     if(info.messageId)
     console.log("Email sent");
     else
     console.log("error");
  console.log("Message sent: %s", info.messageId);
  }

main().catch(console.error);
    
  });


app.post("/addcomment", async function(req,res)
{

    const addcomment= await BuddyApplication.findOne({myemail:req.body.commentedon});

    addcomment.comments.push(req.body.commentbox);
    addcomment.commentBy.push(req.body.commentby);

    await addcomment.save(function (err) {
    if (!err) {
      console.log("Comment Saved");
      // res.redirect("/myprofile");
    } else console.log(err);



});
});






app.listen("3000", function (req, res) {
  console.log("Connected successfully to the server");
});
