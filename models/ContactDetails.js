const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  countrycode: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String
  },
  message: {
    type: String,
    required: true
  },
  phoneNo: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("contactModel", contactSchema);
