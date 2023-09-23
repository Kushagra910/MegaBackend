const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName:{
    type:String,
    trim : true,
    required:true,
  },
  courseDescription : {
    type:String,
    required:true,
    trim :true,
  },
  instructor : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",
    required : true,
  },
  whatYouWillLearn : {
    type : String,
    trim :true,
  },
  courseContent : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Section",
    }
  ],
  ratingAndReviews : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "RatingAndReview",
    }
  ],
  price : {
    type : Number,
  },
  thumbnail : {
    type :String,
  },
  tag :{
    type : mongoose.Schema.Types.ObjectId,
    ref : "Tag",
  },
  studentEnrolled : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "User",
      required : true,
    }
  ],
});

module.exports = mongoose.model("Course",courseSchema);