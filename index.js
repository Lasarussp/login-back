const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const dotenv = require('dotenv');
dotenv.config();
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcryptjs");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));


const mongoUrl = "mongodb+srv://lasarus:12345@login.mbsvzgx.mongodb.net/?retryWrites=true&w=majority";
//const mongoUrl = "mongodb://localhost:27017/login";

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

            if (res.status(201)) {
                return res.json({ status : "ok" });// data: token//
            } else {
                return res.json ({ error: "error" });
            }
        }
        res.json({ status : "error", error : "Invalid Password" });
    });
    
    const PORT = process.env.PORT;

    app.get('/', function(req,res) {
    res.send("The port is running successfully....🎊✨")
    });


    app.listen(PORT, () => {
        console.log("The port is running successfully....🎊✨")
    });


    app.get("/getAllUser", async (req,res) => {
        try {
            const allUser = await User.find({});
            res.send({ status : "ok", data: allUser});
        } catch (error) {
            console.log(error);
        }
    });

    
    