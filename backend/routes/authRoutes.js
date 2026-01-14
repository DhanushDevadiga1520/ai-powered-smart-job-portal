const bcrypt = require("bcryptjs");
const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const protect = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const fs = require("fs");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf");

const skillsList = require("../utils/skillsList");

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });


// REGISTER USER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;  // 👈 include role

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "jobseeker",   // 👈 SAVE ROLE
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully ✅",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// LOGIN USER
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2️⃣ Check if blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account is blocked" });
    }

    // 3️⃣ Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 4️⃣ Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful ✅",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL USERS (Admin only)
router.get("/users", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE USER (Admin only)
router.delete("/admin/delete/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting last admin
    if (userToDelete.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });

      if (adminCount <= 1) {
        return res.status(400).json({
          message: "Cannot delete the last admin",
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully ✅" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE RESUME SKILLS (Jobseeker)
router.put("/resume", protect, async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({ message: "Only jobseekers can update resume" });
    }

    const { resumeSkills } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { resumeSkills },
      { new: true }
    );

    res.status(200).json({ message: "Resume updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPLOAD RESUME (Jobseeker only)
router.post(
  "/upload-resume",
  protect,
  upload.single("resume"),
  async (req, res) => {
    try {
      if (req.user.role !== "jobseeker") {
        return res
          .status(403)
          .json({ message: "Only jobseekers can upload resume" });
      }

      const filePath = `uploads/${req.file.filename}`;
      const data = new Uint8Array(fs.readFileSync(filePath));

const pdf = await pdfjsLib.getDocument({ data }).promise;
let text = "";

for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const content = await page.getTextContent();
  const strings = content.items.map(item => item.str).join(" ");
  text += strings + " ";
}

text = text.toLowerCase();

      const extractedSkills = skillsList.filter(skill =>
        text.includes(skill)
      );

      const user = await User.findByIdAndUpdate(
        req.user.id,
        {
          resumeFile: req.file.filename,
          resumeSkills: extractedSkills,
        },
        { new: true }
      );

      res.status(200).json({
        message: "Resume uploaded & skills extracted ✅",
        skills: extractedSkills,
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// GET CURRENT USER
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE PROFILE (Jobseeker)
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.phone = req.body.phone;
    user.location = req.body.location;
    user.experience = req.body.experience;
    user.skills = req.body.skills;

    await user.save();

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

// UPLOAD PROFILE PHOTO
router.post("/upload-photo", protect, upload.single("photo"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.photo = req.file.filename;
    await user.save();

    res.json({ message: "Photo uploaded successfully", photo: user.photo });
  } catch (error) {
    res.status(500).json({ message: "Upload failed" });
  }
});
// DELETE OWN ACCOUNT (Admin)
router.delete("/delete-me", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete themselves" });
    }

    const adminCount = await User.countDocuments({ role: "admin" });

    if (adminCount <= 1) {
      return res.status(400).json({
        message: "You are the last admin. Cannot delete yourself.",
      });
    }

    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({ message: "Admin account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// BLOCK / UNBLOCK USER (Admin only)
router.put("/admin/block/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      message: user.isBlocked ? "User blocked" : "User unblocked",
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PROMOTE RECRUITER TO ADMIN
router.put("/admin/promote/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "recruiter") {
      return res.status(400).json({ message: "Only recruiters can be promoted" });
    }

    user.role = "admin";
    await user.save();

    res.json({ message: "Recruiter promoted to admin ✅" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// VIEW USER PROFILE (Admin only)
router.get("/admin/user/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
