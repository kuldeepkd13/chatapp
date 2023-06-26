const express = require("express")
const bcrypt = require("bcrypt")
const path = require("path");
const jwt = require("jsonwebtoken")
const {UserModel}  = require("../model/user.model")
const  { sendEmail } = require("../service/mail");
const { config } = require("dotenv");
const userRoute = express.Router()
require("dotenv").config()
userRoute.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
  
    // Regular expression to validate password
    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        if (passwordRegex.test(password)) {
          bcrypt.hash(password, 5, async (err, hash) => {
            const newUser = new UserModel({ username, email, password: hash });
           let userdata = await newUser.save();
           if(userdata){
            sendEmail({
                email: `${userdata.email}`,
                subject: 'For verification mail',
                body: `Dear ${userdata.username} ,<br> 
              
                please click here to <a href="http://localhost:8000/user/verify?id=${userdata._id}">verify</a> your mail
              
              Best regards,<br>
              DENTDESK`
            });
               res.status(200).send({ message: "Registration successful" });
           }else{
            res.status(401).json({ msg: "Registration failed" });
           }
          });
        } else {
          res
            .status(400)
            .send({
              message:
                "Password should have a minimum length of 8 and contain at least one uppercase letter, one symbol, and one number",
            });
        }
      } else {
        res.status(400).send({ message: "There’s already an account with that email" });
      }
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  });

userRoute.post("/login",async(req,res)=>{
    const {email,password}=req.body

    try {
        const user = await UserModel.findOne({email})
        if(user){
            if(!user.isVerified){
               return  res.status(400).send({"message":"Please verify your email first"})
            }
            bcrypt.compare(password, user.password, async(err, result) =>{
                if(result){
                  const Token = jwt.sign({UserId:`${user._id}`},process.env.token,{expiresIn:"180s"})
                  const refreshToken = jwt.sign({UserId:`${user._id}`},process.env.refreshToken,{expiresIn:"300s"})
      
                  res.cookie("accessToken", Token , {httpOnly:true})
                  res.cookie("refreshToken", refreshToken , {httpOnly:true})
                    res.status(200).send({"message":"Login Successfull" ,user, Token})
                }if (err || !result){
                    res.status(400).send({"message":"Incorrect  password, Login with correct password."})
                }
            });
        }else{
            res.status(400).send({"message":"Incorrect email , Login with correct email."})
        }
    } catch (error) {
        res.status(400).send({"message":error.message})
    }
})

userRoute.get("/verify", async (req, res) => {
    try {
      const userId = req.query.id;
  
      const user = await UserModel.findOneAndUpdate(
        { _id: userId },
        { $set: { isVerified: true } },
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      if (user.isVerified) {
        return res.redirect("/login");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
module.exports={userRoute}