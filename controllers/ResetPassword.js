const User  = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt  = require("bcrypt");
const crypto = require("crypto");
const {passwordUpdated} = require("../templates/passwordUpdate");
// Reset Password Token handler

exports.resetPasswordToken = async(req,res) => {
  try{
    // get email form req ki body 
    const email = req.body.email;
    // check for this email exists or not
    const user = await User.findOne({email:email});
    if(!user){
      return res.status(400).json({
        success:false,
        message:"your email is not registered with us",
      });
    }
    //generate token
    const token = crypto.randomUUID();
    // upadate user by adding token & expiration time
    const updatedDetails = await User.findOneAndUpdate(
      {email :email},{token,
      resetPasswordExpires : Date.now()+ 5*60*1000},{new:true});

      // create URL
      const url = `http://localhost:3000/update-password/${token}`;
     //mail send containing the URL
     await mailSender(email,"Password Reset Link",`Password reset link ${url}`);
     //return res
     
     return res.status(200).json({
      success:true,
      message:"Email sent successfully , please check email and change password"
     })

  } catch(err){
    console.log(err);
    return res.status(500).json({
      success:false,
      message:"something went wrong while reset",
    });
  }
}

 // reset Password handler
 exports.resetPassword = async(req,res)=>{
  try{
    // data fetch 
    const {password,confirmPassword,token} = req.body;
    // validation
    if(password !== confirmPassword){
      return res.status(400).json({
        success:false,
        message:"Password donot match , retry",
      });
    }
    // get userDetails from db using token
    const userDetails = await User.findOne({token:token});
    // if no entry = > invalid token
    if(!userDetails){
      return res.status(400).json({
        success:false,
        message:"Token is invalid",
      });
    }
    // token time check 
    if(userDetails.resetPasswordToken < Date.now()){
      return res.status(410).json({
        success:false,
        message:"Token is expired, please regenerate your token",
      });
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password,10);
    // password update
    await User.findOneAndUpdate(
      {token : token},
      {password : hashedPassword},
      {new : true},
    );
    await mailSender(userDetails.email,"Password Reset Conformation",passwordUpdated(userDetails.email,userDetails.firstName));
    // return res.
    return res.status(200).json({
      success:true,
      message : "Password reset successfully"
    })
  } catch (err) {
    console.log(err);
    return  res.status(500).json({
      success:false,
      message:""
    })
  }
 }