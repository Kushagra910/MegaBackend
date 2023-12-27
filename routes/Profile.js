const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const {
  deleteProfile,
  updateProfile,
  getAllUserDetails,
  updateProfilePicture,
  getEnrolledCourses,
} = require("../controllers/Profile");

router.delete("/deleteProfile", auth,deleteProfile);
router.put("/updateProfile", auth, updateProfile);
router.get("/getUserDetails", auth, getAllUserDetails);
// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses);
router.put("/updateDisplayPicture", auth, updateProfilePicture);

module.exports = router;
