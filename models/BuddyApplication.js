const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const buddyapplicationSchema = new Schema({
  email: {
    type: String,
  },
  fullname: {
    type: String,
    required: true,
  },
  institutename: {
    type: String,
    required: true,
  },
  portfolios: {
    type: String,
  },
  contactno: {
    type: Number,
    required: true,
  },
  achievements: {
    type: String,
  },
  projects: {
    type: String,
  },
  techskills: {
    type: String,
  },
  softskills: {
    type: String,
  },
  workshops: {
    type: String,
  },
  certifications: {
    type: String,
  },
  rating: {
    type: String,
  },
  comments: [String],
  commentBy: [String],
  specialization: String 
});
module.exports = mongoose.model("BuddyApplication", buddyapplicationSchema);
