const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["jobseeker", "recruiter"],
      default: "jobseeker",
    },

    resumeSkills: {
      type: [String],
      default: [],
    },
    resumeFile: {
      type: String,
    },
    phone: String,
    location: String,
    experience: String,
    skills: [String],
    
    photo: {
  type: String,
},

    isBlocked: {
  type: Boolean,
  default: false,
},


  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
