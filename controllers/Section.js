const Course = require("../models/Course");
const Section = require("../models/Section");

exports.createSection = async (req, res) => {
  try {
    // data fetch
    const { sectionName, courseId } = req.body;
    // validation on data
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // create section DB
    const newSection = await Section.create({ sectionName });
    // save object_id of this section in Course

    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate:{
          path : "subSection",
        },
      }).exec();

    // return response
    return res.status(200).json({
      success: true,
      message: "Section Created Successfully",
      updatedCourseDetails
    });
  } catch (err) {
     return res.status(500).json({
      success:false,
      message:"Unable to creat a Section,Please Try again",
      message:err.message
     });
  }
};

//updateSection
exports.updateSection = async(req,res) => {
  try{
    // fetch section name
    const {sectionName,sectionId} = req.body;
    // validation
    if(!sectionId || !sectionName){
      return res.status(400).json({
        success:false,
        message:"All fields required"
      });
    }
    //update section with the help of sectionId
    const updatedSection = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});
    //return response
    return res.status(200).json({
      success:true,
      message:"Section Updated Successfully"
    });
  } catch(err) {
    return res.status(500).json({
      success:false,
      message:"Unable to Update Section,Please Try again",
      message:err.message
     });
  }
};


exports.deleteSection = async(req,res)=>{
  try{
    // fetch sectionId from parameters
    const {sectionId} = req.params;
    //findbyid and delete
    await Section.findByIdAndDelete(sectionId);
    // Do we need to delete the sectionid from courseCounted also? (check in testing)
    //return response
    return res.status(200).json({
      success:true,
      message:"Section Deleted Successfully",
    });
  }catch(err){
    return res.status(500).json({
      success:false,
      message:"Unable to Delete this section, Please try again"
    });
  }
}
