const Tag = require("../models/Tags");

// create Tag handler
exports.createTag = async(req,res)=>{
  try{
    // fetch 
    const {name,description} = req.body;
    // validation
    if(!name || !description){
      return res.status(400).json({
        success:false,
        message:"All fields are required",
      });
    }
    // create entry in db
    const newTag = new Tag({
      name : name,
      description:description,
    });
    const tagDetails = await newTag.save();
    console.log("Tag Details :", tagDetails);
    // return response
    return res.status(200).json({
      success:true,
      message:"Tag created successfully",
    });
  } catch(err){
    return res.status(500).json({
      success:false,
      message:err.message,
    });
  }
}


//get all tags

exports.getAllTags = async(req,res)=>{
  try{
    const allTags = await Tag.find({},{name:true,description:true});
    return res.status(200).json({
      success:true,
      message:"All tags obtained successfully",
      allTags,
    })
  } catch(err){
    return res.status(500).json({
      success:false,
      message:err.message,
    });
  }
}