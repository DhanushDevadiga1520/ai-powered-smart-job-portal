const express = require("express");
const Job = require("../models/Job");
const protect = require("../middleware/authMiddleware");
const User = require("../models/User");


const router = express.Router();

// POST A JOB (Recruiter only)
router.post("/create", protect, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, company, description, skills, location, salary } = req.body;

    const job = new Job({
      title,
      company,
      description,
      skills,
      location,
      salary,
      postedBy: req.user.id,
    });

    await job.save();

    res.status(201).json({
      message: "Job posted successfully ✅",
      job,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL JOBS (Public)
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().populate("postedBy", "name email");
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL JOBS (Admin only)
router.get("/admin/all", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const jobs = await Job.find().populate("postedBy", "name email");
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE JOB (Admin only)
router.delete("/admin/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// RECOMMENDED JOBS (Jobseeker)
router.get("/recommended", protect, async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({ message: "Only jobseekers can get recommendations" });
    }

    const user = await User.findById(req.user.id);

    const skills = user.resumeSkills || [];

    const jobs = await Job.find({
      skills: { $in: skills }
    });

    res.status(200).json(jobs);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET RECRUITER'S JOBS (Admin only)
router.get("/admin/recruiter-jobs/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const jobs = await Job.find({ postedBy: req.params.id });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
