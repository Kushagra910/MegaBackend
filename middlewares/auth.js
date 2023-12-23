const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// auth middleware
exports.auth = async(req,res,next) => {
  try{
    // extract token
    const token = req.cookies.token || req.body.token || 
                  req.header("Authorization").replace("Bearer ","");
    // if token missing 
    if(!token){
      return res.status(401).json({
        success:false,
        message:"Token is missing",
      });
    }

    // verify the token 
    try{
      const decode = await jwt.verify(token,process.env.JWT_SECRET);
      console.log(decode);
      req.user = decode;
    } catch(err){
      // verification issues
      return res.status(400).json({
        success:false,
        message:"Token is invalid",
      });
    }
    next();

  } catch(err){
    return res.status(400).json({
      success:false,
      message:"Something went wrong while validating the token",
    });
  }
};

//isStudent middleware

exports.isStudent = async(req,res,next)=>{
  try{
    if(req.user.accountType !== "Student"){
      return res.status(400).json({
        success:false,
        message: "This is a protected route for Students",
      });
    }
    next();
  } catch(err){
    console.log(err);
    return res.status(500).json({
      success:false,
      message:"User role cannot be verified ,try again",
    });
  }
}
//isInstructor middleware

exports.isInstructor = async(req,res,next)=>{
  try{
    if(req.user.accountType !== "Instructor"){
      return res.status(400).json({
        success:false,
        message: "This is a protected route for Instructor",
      });
    }
    next();
  } catch(err){
    console.log(err);
    return res.status(500).json({
      success:false,
      message:"User role cannot be verified ,try again",
    })
  }
}
//isAdmin

exports.isAdmin = async(req,res,next)=>{
  try{
    if(req.user.accountType !== "Admin"){
      return res.status(400).json({
        success:false,
        message: "This is a protected route for Admin",
      });
    }
    next();
  } catch(err){
    console.log(err);
    return res.status(500).json({
      success:false,
      message:"User role cannot be verified ,try again",
    })
  }
}
