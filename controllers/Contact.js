const contactModel = require( "../models/ContactDetails");
const mailSender = require ("../utils/mailSender");

exports.contact = async (req,res) => {
  try{
    const {countrycode,email,firstName,lastName,message,phoneNo} = req.body;
    if(!countrycode || !email || !firstName || !message || !phoneNo){
      return res.status(400).json({
        success:false,
        message:'All fields except lastname is required'
      })
    }

    const response = await contactModel.create({
      firstName,email,lastName,countrycode,phoneNo,message
    });
    if(!response){
      return res.status().json({
        success:false,
        message:"Data not saved in contact Model"
      })
    }

     res.status(200).json({
      success:true,
      message:"Detail Submitted Successfully",
    });
    await mailSender(email,"Idea/Details Confirmation",`Thankyou for Contacting , Your response has been recorded successfully. \n Regards StudyNotion`);
    
  } catch(err){
    console.error(err);
    return res.status(500).json({
      success:false,
      message:"Message not sent , pleasy try again",
    })
  }
}