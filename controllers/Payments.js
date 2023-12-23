const { instance } = require("../configs/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { CourseEnrollmentEmail } = require("../templates/courseEnrollmentEmail");

// capture the payment and initiate the razorpay order
exports.capturePayment = async (req, res) => {
  try {
    //get courseId and userId
    const { course_id } = req.body;
    const userId = req.user.id;
    //validation
    if (!course_id) {
      return res.status(403).json({
        success: false,
        message: "Please provide valid course id",
      });
    }
    //validate courseDetails
    let course;
    try {
      course = await Course.findById(course_id);
      if (!course) {
        return res.status().json({
          success: false,
          message: "could not find the course",
        });
      }

      //user already payed the amount
      const uId = new mongoose.Types.ObjectId(userId);
      if (course.studentEnrolled.includes(uId)) {
        return res.status(404).json({
          success: false,
          message: "Student is already enrolled",
        });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
    //order create
    const amount = course.price;
    const currency = "INR";
    const options = {
      amount: amount * 100,
      currency,
      receipt: Math.random(Date.now()).toString(),
      notes: {
        courseId: course_id,
        userId,
      },
    };
    try {
      //initiate the payment using razorpay
      const paymentResponse = await instance.orders.create(options);
      console.log(paymentResponse);
      // return res
      return res.status(200).json({
        success: true,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        thumbnail: course.thumbnail,
        orderId: paymentResponse.orderId,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        success: false,
        message: "could not initiate order",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Payment Cannot be captured",
    });
  }
};

// verify signature of razorpay and server
exports.verifySignature = async (req, res) => {
  const webhookSecret = "12345678";

  const signature = req.headers["x-razorpay-signature"];

  const shasum = crypto.createHmac("sha256", webhookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (signature === digest) {
    console.log("Payment is Authorised");

    const { courseId, userId } = req.body.payload.payment.entity.notes;

    try {
      //fulfil the action

      //find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "Course not Found",
        });
      }

      console.log(enrolledCourse);

      //find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { courses: courseId } },
        { new: true }
      );

      console.log(enrolledStudent);

      //mail send krdo confirmation wala
      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Congratulations from CodeHelp",
        "Congratulations, you are onboarded into new CodeHelp Course"
      );

      console.log(emailResponse);
      return res.status(200).json({
        success: true,
        message: "Signature Verified and COurse Added",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid request",
    });
  }
};
