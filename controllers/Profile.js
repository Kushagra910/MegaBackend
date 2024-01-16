const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

exports.updateProfile = async (req, res) => {
  try {
    //fetch data
    const { dateOfBirth = "", about = "", contactNumber, gender,countrycode } = req.body;
    //fetch userId
    const id = req.user.id;
    //validation
    if (!gender || !contactNumber || !id || !countrycode) {
      return res.status(400).json({
        success: false,
        message: "All fields are requried",
      });
    }
    // find Profile (we have User id)
    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);
    //update Profile (using save method because we have profile object ready)
    profileDetails.about = about;
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.contactNumber = contactNumber;
    profileDetails.gender = gender;
    profileDetails.countrycode = countrycode;
    await profileDetails.save();
    //return response
    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

//deletProfile
// Pending - Scheduling
exports.deleteProfile = async (req, res) => {
  try {
    //fetch id
    const id = req.user.id;
    //validation
    const userDetails = await User.findById({_id:id});
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    //delete profile

    const profileId = userDetails.additionalDetails;
    await Profile.findByIdAndDelete({_id:profileId});
    //Unenroll user from all Enrolled Courses (used UpdateMany method)
    await Course.updateMany({studentEnrolled:id},{
      $pull:{
        studentEnrolled : id,
      }
    },{new:true});
    //delete user
    await User.findByIdAndDelete({_id:id});
    //return response
    return res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      message:"User Not Deleted,Try again"
    });
  }
};

//Get All User Details (only profile details)
exports.getAllUserDetails = async(req,res) => {
  try{
    // fetch id
    const id = req.user.id;
    //validation and get user details
    const userDetails = await User.findById(id).populate("additionalDetails").exec();
    //return response
    return res.status(200).json({
      success:true,
      message:"UserDetails Fetched Successfully",
      userDetails
    });
  } catch(err){
    return res.status(500).json({
      success:false,
      message:"Something went wrong",
    });
  }
}

//To update the profile picture
exports.updateProfilePicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};

// Get all courses of a user
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    const userDetails = await User.findOne({
      _id: userId,
    })
      .populate("courses")
      .exec()
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};