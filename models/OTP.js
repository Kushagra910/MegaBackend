const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
  email:{
    type:String,
    required:true,
  },
  otp:{
    type:String,
    required:true,
  },
  createdAt:{
    type:Date,
    default:Date.now(),
    expires:5*60,
  }
});

// a function to send emails 

async function sendVerificationEmail (email,otp){
  try {
    const mailResponse = await mailSender(email,"Verification email from Study Notion",otp);
    console.log("Email sent successfully :",mailResponse);
  } catch(err) {
    console.log("Error occured while sending Mails :" , err);
    throw err;
  }
};

OTPSchema.pre("save",async function(next){
  await sendVerificationEmail(this.email,this.otp);
  next();  // going to next middleware
})


module.exports = mongoose.model("OTP",OTPSchema);