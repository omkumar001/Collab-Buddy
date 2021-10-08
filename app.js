const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const ejs = require("ejs");

const session=require("express-session");
const MongoDBSession = require('connect-mongodb-session')(session);


app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/uploads"));
app.set('view engine', 'ejs');
const mongoose = require("mongoose");

app.use(bodyparser.urlencoded({
    extended: true
  }));


const BuddyModel=require("./models/Buddy");
const BuddyApplication=require("./models/BuddyApplication");

const mongoURI="mongodb://localhost:27017/buddyDB";


mongoose.connect("mongodb://localhost:27017/buddyDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

.then((res)=>
{
    console.log("Connected Mongo");
});

// Create store for session

const store= new MongoDBSession({
    uri:mongoURI,
    collection:"mySessions"
});


app.use(session({
    secret: "key that will sign cookie",
    resave: false,
    saveUninitialized: false,
    store:store
}));


app.use(
    express.urlencoded({
      extended: true,
    })
  );
  



  app.get("/login",function(req,res)
{
   res.render("login");
});
app.get("/register",function(req,res)
{
   res.render("register");
});

app.get("/",function(req,res)
{
    
})






app.listen("3000", function (req, res) {
    console.log("Connected successfully to the server");
  });
  
