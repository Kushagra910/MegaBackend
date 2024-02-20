const CourseProgress = require("../models/CourseProgress");
const SubSection = require("../models/SubSection");

exports.updateCourseProgress = async (req,res) => {
  const {courseId,subSectionId} = req.body;
  const userId = req.user.id;
  try{
    //check subsection validity
    const subSection = await SubSection.findById(subSectionId);
    if(!subSection) {
      return res.status(404).json({
        error : "Invalid SubSection"
      })
    }   
    // check for old entry in courseProgress
    const courseProgress = await CourseProgress.findOne({
      courseID : courseId,
      userID : userId,
    });
    if(!courseProgress){
      return res.status(404).json({
        success : false,
        message: "Course Progress Does not exist"
      })
    }
    else{
      // check for already completed video
      if(courseProgress.completedVideos.includes(subSectionId)){
        return res.status(400).json({
          error:"Video Already Completed"
        })
      }
      //push into completed videos array
      courseProgress.completedVideos.push(subSectionId);
    }
    await courseProgress.save();
    return res.status(200).json({
      success:true,
      message:"CourseProgress Updated Successfully"
    })
  } catch(err ){
    console.error(err);
    return res.status(500).json({
      success:false,
      message:"CourseProgress Not Updated"
    })
  }
}