const express = require("express");
const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// APPLY FOR A JOB (Jobseeker only)
router.post("/apply/:jobId", protect, async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({ message: "Only jobseekers can apply" });
    }

    // ✅ CHECK IF ALREADY APPLIED
    const existing = await Application.findOne({
      job: req.params.jobId,
      applicant: req.user.id,
    });

    if (existing) {
      return res.status(400).json({ message: "You already applied for this job" });
    }

    const job = await Job.findById(req.params.jobId);
    const user = await User.findById(req.user.id);

    const jobSkills = job.skills.map(s => s.toLowerCase());
    const resumeSkills = (user.resumeSkills || []).map(s => s.toLowerCase());

    const matched = jobSkills.filter(skill =>
      resumeSkills.includes(skill)
    );

    const matchScore = jobSkills.length > 0
      ? Math.round((matched.length / jobSkills.length) * 100)
      : 0;

    const application = new Application({
      job: job._id,
      applicant: user._id,
      matchScore,
    });

    await application.save();

    res.status(201).json({
      message: "Applied successfully",
      matchScore,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



// GET APPLICATIONS FOR RECRUITER JOBS
router.get("/recruiter", protect, async (req, res) => {
  try {
    // Only recruiter can access
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can view applications" });
    }

    const applications = await Application.find()
      .populate({
        path: "job",
        match: { postedBy: req.user.id },
        select: "title company",
      })
      .populate("applicant", "name email");

    // Remove applications where job is null (not recruiter’s job)
    const filteredApplications = applications.filter(app => app.job !== null);

    res.status(200).json(filteredApplications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE APPLICATION STATUS (Recruiter only)
router.put("/status/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can update status" });
    }

    const { status } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.status(200).json({
      message: "Status updated successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET APPLICATIONS FOR JOBSEEKER
router.get("/my", protect, async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({ message: "Only jobseekers can view this" });
    }

    const applications = await Application.find({ applicant: req.user.id })
      .populate("job", "title company location")
      .select("status matchScore job");

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
