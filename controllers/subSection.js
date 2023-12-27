const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
// create subsection
exports.createSubSection = async (req, res) => {
  try {
    //fetch data from req body
    const { sectionId, title, timeDuration, description } = req.body;
    //extract file/video
    const video = req.files.videoFile;
    // validation
    if (!sectionId || !title || !timeDuration || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //upload video to cloudinary and get a secure url
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    //create a subSection
    const subSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });
    //  update section with this subSection objectID
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: {
          subSection: subSectionDetails._id,
        },
      },
      { new: true }
    ).populate("subSection").exec();
    console.log("upadtedSection:", updatedSection);
    //return response
    return res.status(200).json({
      success: true,
      message: "SubSection created Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to create Subsection,Please try again",
    });
  }
};


//update Subsection
exports.updateSubSection = async(req,res)=>{
  try{
    //fetch data
    const {subSectionId,sectionId,title,timeDuration, description} = req.body;
    // extract video
    const video = req.files.videoFile;
    //validation
    if (!subSectionId || !sectionId || !title || !timeDuration || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //upload to cloudinary
    const uploadedDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
    //update the Subsection
    const updatedSubSectionDetails = await SubSection.findByIdAndUpdate(subSectionId,{
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadedDetails.secure_url,
    });
    //update the section with subSectionId
    const upadtedSectionDetails = await Section.findByIdAndUpdate({_id:sectionId},{
      $push: {
        subSection: subSectionDetails._id,
      },
    },
    { new: true });
    //return response
    return res.status(200).json({
      success:true,
      message:"Subsection updated successfully",
    });

  } catch(err){
    return res.status(500).json({
      success:false,
      message:"Unable to update subsection,please try again",
    });
  }
}

//delete subsection
exports.deletSubSection = async(req,res)=>{
  try{
    //fetch data
    const {sectionId,subSectionId} = req.body;
    //validation
    if (!subSectionId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "SubSection ID and Section ID are required",
      });
    }
    //Delete the subSection
    await SubSection.findByIdAndDelete(subSectionId);
    //Remove the SubSection Reference from the section
    await Section.findByIdAndUpdate(sectionId,{
      $pull:{
        subSection:subSectionId,
      },
    },{new:true});
    //return response
    return res.status(200).json({
      success:true,
      message:"SubSection deleted successfully",
    })
  } catch(err){
    return res.status(200).json({
      success:false,
      message : "Unable to delete SubSection, please try again"
    });
  }
}