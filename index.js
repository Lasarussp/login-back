const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const dotenv = require('dotenv');
dotenv.config();
const cors = require("cors");
app.use(cors());
const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

const JWT_SECRET = "qwertyuiopasdfghjkl[;]fsfsfsf";

const mongoUrl = "mongodb://localhost:27017/login";

//const mongoUrl = process.env.MONGO_URL;

mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
 })
 .then (() => {
    console.log("Database connected successfully...✨🎉");
 })
 .catch ((e) => console.log(e));
 
 require("./userDetails");

 const User = mongoose.model("UserInfo");

 app.post("/register", async (req,res) => {
    const { fname,lname,email,password,userType } = req.body;

    const encryptedPassword = await bcrypt.hash(password, 10);
    try {
        const oldUser = await User.findOne({ email });
    if (oldUser) {
        return res.json({ error : "User Exists" });
    }
    await User.create ({ 
        fname,
        lname,
        email,
        password: encryptedPassword,
        userType,
    });
    res.send({ status: "ok" });
    } 
    catch (error) {
      res.send({ status: "error" });
    }
    });

    app.post("/login-user", async (req,res) => {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ error : "User not found" });
        }
        if (await bcrypt.compare(password, user.password)) {
          const token = jwt.sign({ email: user.email}, JWT_SECRET,{
            expiresIn:"5m"
          });
          console.log(user);
            if (res.status(201)) {
                return res.json({ status : "ok" , data: token });
            } else {
                return res.json ({ error: "error" });
            }
        }
        res.json({ status : "error", error : "Invalid Password" });
    });
    
    app.post("/userData", async (req,res) => {
        const { token } = req.body;
        try {
            const user = jwt.verify(token, JWT_SECRET,(err, res) => {
                if (err) {
                    return "token expired";
                }
                return res;
            });
            console.log(user);
            if(user == "token expired") {
                return res.send({ status : "error" , data : "token expired" });
            }

            const useremail = user.email;
            User.findOne({ email : useremail })
            .then((data) => {
                res.send({ status : "ok" , data : data });
            })
            .catch((error) => {
                res.send({ status : "error", data : error });
            });
        } catch (error) {}
    });
    

    const PORT = process.env.PORT;

    app.get('/', function(req,res) {
    res.send("Welcome to our Management App........!🎊✨")
    });


    app.listen(PORT, () => {
        console.log(`The server is running on the port : ${PORT}....🎊✨`)
    });


    app.get("/getAllUser", async (req,res) => {
        try {
            const allUser = await User.find({});
            res.send({ status : "ok", data: allUser});
        } catch (error) {
            console.log(error);
        }
    });

    
    app.post("/forgot-password", async (req,res) => {
        const { email }= req.body;
        try { 
            const oldUser = await User.findOne({ email });
            if (!oldUser) {
                return res.json({status : "User not Exists..!"});
            }
            const secret = JWT_SECRET + oldUser.password;
            const token = jwt.sign({ email :oldUser.email, id:oldUser._id }, secret,{
                expiresIn:"5m",
            });
            const link = `http://localhost:5000/reset-password/${oldUser._id}/${token}`;
            console.log(link);
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.mail_user,
                  pass: process.env.mail_pass,
                }
              });
              
              var mailOptions = {
                from: 'codewithbobg@gmail.com',
                to: options.email,
                subject: 'Password reset',
                text: link,
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
        } catch (error) {}
    });

    app.get("/reset-password/:id/:token", async (req, res) => {
        const { id, token } = req.params;
        console.log(req.params);
        const oldUser = await User.findOne({ _id: id });
        if (!oldUser) {
          return res.json({ status: "User Not Exists!!" });
        }
        const secret = JWT_SECRET + oldUser.password;
        try {
          const verify = jwt.verify(token, secret);
          res.render("index", { email: verify.email, status: "Not Verified" });
        } catch (error) {
          console.log(error);
          res.send("Not Verified");
        }
      });
      
      app.post("/reset-password/:id/:token", async (req, res) => {
        const { id, token } = req.params;
        const { password } = req.body;
      
        const oldUser = await User.findOne({ _id: id });
        if (!oldUser) {
          return res.json({ status: "User Not Exists!!" });
        }
        const secret = JWT_SECRET + oldUser.password;
        try {
          const verify = jwt.verify(token, secret);
          const encryptedPassword = await bcrypt.hash(password, 10);
          await User.updateOne(
            {
              _id: id,
            },
            {
              $set: {
                password: encryptedPassword,
              },
            }
          );
      
          res.render("index", { email: verify.email, status: "verified" });
        } catch (error) {
          console.log(error);
          res.json({ status: "Something Went Wrong" });
        }
      });

    app.post("/deleteUser", async (req,res) => {
        const { userid } = req.body;
        try {
            User.deleteOne({ _id: userid }, function (err,res) {
                console.log(err);
            })
            res.send({ status: "ok", data : "deleted" });
        } catch (error) {
            console.log(error);
        }
    });