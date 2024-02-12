const { instance } = require("../configs/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { json } = require("react-router-dom");
const { default: mongoose } = require("mongoose");
const {courseEnrollmentEmail} = require("../templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../templates/paymentSuccessEmail");
const crypto = require("crypto");

// Without using webhooks

exports.capturePayment = async (req, res) => {
  const { courses } = req.body;
  const userId = req.user.id;

  if (courses.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Please Provide Course Id ",
    });
  }
  let totalAmount = 0;
  for (let course_id of courses) {
    let course;
    try {
      course = await Course.findById(course_id);
      if (!course)
        return res.status(502).json({
          success: false,
          message: "Could not find the Course",
        });
      let uid = new mongoose.Types.ObjectId(userId);
      if (course.studentEnrolled.includes(uid)) {
        return res.status(200).json({
          success: false,
          message: "Student is already enrolled",
        });
      }
      totalAmount = course.price;
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  const options = {
    amount: totalAmount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  };

  try {
    const paymentResponse = await instance.orders.create(options);
    res.status(200).json({
      success: true,
      message: paymentResponse,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Could not Initiate Order ",
    });
  }
};

//verify the payment

exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id;
  const razorpay_payment_id = req.body?.razorpay_payment_id;
  const razorpay_signature = req.body?.razorpay_signature;
  const courses = req.body.courses;
  const userId = req.user.id;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({ success: false, message: "Payment Failed" });
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    await enrollStudents(courses, userId, res);
    return res.status(200).json({ success: true, message: "Payment Verified" });
  }
  return res.status(200).json({ success: "false", message: "Payment Failed" });
};

const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Please Provide data for Courses or UserId",
      });
  }

  for (const courseId of courses) {
    try {
      //find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res
          .status(200)
          .json({ success: false, message: "Course not Found" });
      }

      //find the student and add the course to their list of enrolledCOurses

      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
          },
        },
        { new: true }
      );

      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      );
      //console.log("Email Sent Successfully", emailResponse.response);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};


exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;

  const userId = req.user.id;

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the fields" });
  }

  try {
    //student ko dhundo
    const enrolledStudent = await User.findById(userId);
    await mailSender(
      enrolledStudent.email,
      `Payment Recieved`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
  } catch (error) {
    console.log("error in sending mail", error);
    return res
      .status(500)
      .json({ success: false, message: "Could not send email" });
  }
};
// // capture the payment and initiate the razorpay order (for single purchase)
// exports.capturePayment = async (req, res) => {
//   try {
//     //get courseId and userId
//     const { course_id } = req.body;
//     const userId = req.user.id;
//     //validation
//     if (!course_id) {
//       return res.status(403).json({
//         success: false,
//         message: "Please provide valid course id",
//       });
//     }
//     //validate courseDetails
//     let course;
//     try {
//       course = await Course.findById(course_id);
//       if (!course) {
//         return res.status().json({
//           success: false,
//           message: "could not find the course",
//         });
//       }

//       //user already payed the amount
//       const uId = new mongoose.Types.ObjectId(userId);
//       if (course.studentEnrolled.includes(uId)) {
//         return res.status(404).json({
//           success: false,
//           message: "Student is already enrolled",
//         });
//       }
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({
//         success: false,
//         message: err.message,
//       });
//     }
//     //order create
//     const amount = course.price;
//     const currency = "INR";
//     const options = {
//       amount: amount * 100,
//       currency,
//       receipt: Math.random(Date.now()).toString(),
//       notes: {
//         courseId: course_id,
//         userId,
//       },
//     };
//     try {
//       //initiate the payment using razorpay
//       const paymentResponse = await instance.orders.create(options);
//       console.log(paymentResponse);
//       // return res
//       return res.status(200).json({
//         success: true,
//         courseName: course.courseName,
//         courseDescription: course.courseDescription,
//         thumbnail: course.thumbnail,
//         orderId: paymentResponse.orderId,
//         currency: paymentResponse.currency,
//         amount: paymentResponse.amount,
//       });
//     } catch (err) {
//       console.log(err);
//       return res.json({
//         success: false,
//         message: "could not initiate order",
//       });
//     }
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: "Payment Cannot be captured",
//     });
//   }
// };

// // verify signature of razorpay and server
// exports.verifySignature = async (req, res) => {
//   const webhookSecret = "12345678";

//   const signature = req.headers["x-razorpay-signature"];

//   const shasum = crypto.createHmac("sha256", webhookSecret);
//   shasum.update(JSON.stringify(req.body));
//   const digest = shasum.digest("hex");

//   if (signature === digest) {
//     console.log("Payment is Authorised");

//     const { courseId, userId } = req.body.payload.payment.entity.notes;

//     try {
//       //fulfil the action

//       //find the course and enroll the student in it
//       const enrolledCourse = await Course.findOneAndUpdate(
//         { _id: courseId },
//         { $push: { studentsEnrolled: userId } },
//         { new: true }
//       );

//       if (!enrolledCourse) {
//         return res.status(500).json({
//           success: false,
//           message: "Course not Found",
//         });
//       }

//       console.log(enrolledCourse);

//       //find the student and add the course to their list of enrolled courses
//       const enrolledStudent = await User.findOneAndUpdate(
//         { _id: userId },
//         { $push: { courses: courseId } },
//         { new: true }
//       );

//       console.log(enrolledStudent);

//       //mail send krdo confirmation wala
//       const emailResponse = await mailSender(
//         enrolledStudent.email,
//         "Congratulations from CodeHelp",
//         "Congratulations, you are onboarded into new CodeHelp Course"
//       );

//       console.log(emailResponse);
//       return res.status(200).json({
//         success: true,
//         message: "Signature Verified and COurse Added",
//       });
//     } catch (error) {
//       console.log(error);
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   } else {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid request",
//     });
//   }
// };
