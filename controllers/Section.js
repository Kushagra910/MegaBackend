const Course = require("../models/Course");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");

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
    const {sectionName,sectionId,courseId} = req.body;
    // validation
    if(!sectionId || !sectionName){
      return res.status(400).json({
        success:false,
        message:"All fields required"
      });
    }
    //update section with the help of sectionId
    const updatedSection = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true}).populate("subSection").exec();
    const course = await Course.findById(courseId).populate({
      path : "courseContent",
      populate :  {
        path : "subSection"
      },
    }).exec();
    //return response
    return res.status(200).json({
      success:true,
      message:"Section Updated Successfully",
      data:course
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
		const { sectionId, courseId }  = req.body;
		await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})
		const section = await Section.findById(sectionId);
		console.log(sectionId, courseId);
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

		//delete sub section
		await SubSection.deleteMany({_id: {$in: section.subSection}});

		await Section.findByIdAndDelete(sectionId);

		//find the updated course and return 
		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();

		res.status(200).json({
			success:true,
			message:"Section deleted",
			data:course
		});
  }catch(err){
    return res.status(500).json({
      success:false,
      message:"Unable to Delete this section, Please try again"
    });
  }
}
