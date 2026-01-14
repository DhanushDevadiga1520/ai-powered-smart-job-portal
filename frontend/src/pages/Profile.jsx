import { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [applications, setApplications] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeFile, setResumeFile] = useState("");
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [photo, setPhoto] = useState(null);
  const isValidPhone = (phone) => /^\d{10}$/.test(phone);
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const appRes = await axios.get(
          "http://localhost:5000/api/applications/my",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setApplications(appRes.data);

        const userRes = await axios.get(
          "http://localhost:5000/api/auth/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSkills(userRes.data.resumeSkills || []);
        setResumeFile(userRes.data.resumeFile || "");
        setProfile(userRes.data);
      } catch (error) {
        console.log("Error loading profile");
      }
    };

    fetchProfile();
  }, []);

const updateProfile = async () => {
  if (!isValidPhone(profile.phone)) {
    return alert("Phone number must be exactly 10 digits ❌");
  }

  if (!isValidEmail(profile.email)) {
    return alert("Please enter a valid email address ❌");
  }

  try {
    const token = localStorage.getItem("token");

    await axios.put(
      "http://localhost:5000/api/auth/profile",
      profile,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    alert("Profile updated successfully ✅");
    setEditMode(false);
  } catch (error) {
    alert("Error updating profile ❌");
  }
};

const uploadPhoto = async () => {
  const formData = new FormData();
  formData.append("photo", photo);

  try {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      "http://localhost:5000/api/auth/upload-photo",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setProfile({ ...profile, photo: res.data.photo });
    alert("Profile photo uploaded ✅");
  } catch (error) {
    alert("Error uploading photo ❌");
  }
};

 return (
  <div className="min-h-screen bg-gray-100 p-4 md:p-6">
    <div className="max-w-5xl mx-auto px-2 md:px-0">

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-6 text-center md:text-left">
        <img
        src={
            profile.photo
            ? `http://localhost:5000/uploads/${profile.photo}`
            : "https://via.placeholder.com/120"
          }
          alt="Profile"
          className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border"
        />

        <div>
          <h2 className="text-2xl font-bold">{profile.name}</h2>
          <p className="text-gray-600">{profile.email}</p>
          <span className="inline-block mt-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
            {profile.role}
          </span>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <p><strong>Phone:</strong> {profile.phone || "Not added"}</p>
          <p><strong>Location:</strong> {profile.location || "Not added"}</p>
          <p><strong>Experience:</strong> {profile.experience || "Not added"}</p>
          <p><strong>Skills:</strong> {profile.skills?.join(", ") || "Not added"}</p>
        </div>

        <button
          onClick={() => setEditMode(true)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Edit Profile
        </button>
        {editMode && (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
<input
  type="file"
  onChange={(e) => setPhoto(e.target.files[0])}
  className="mb-3"
/>

<button
  onClick={uploadPhoto}
  className="bg-blue-600 text-white px-4 py-2 rounded"
>
  Upload Photo
</button>

    <input
      className="w-full border p-2 mb-3"
      placeholder="Phone"
      value={profile.phone || ""}
      onChange={(e) =>
        setProfile({ ...profile, phone: e.target.value })
      }
    />

    <input
      className="w-full border p-2 mb-3"
      placeholder="Location"
      value={profile.location || ""}
      onChange={(e) =>
        setProfile({ ...profile, location: e.target.value })
      }
    />

    <input
      className="w-full border p-2 mb-3"
      placeholder="Experience"
      value={profile.experience || ""}
      onChange={(e) =>
        setProfile({ ...profile, experience: e.target.value })
      }
    />

    <input
      className="w-full border p-2 mb-3"
      placeholder="Skills (comma separated)"
      value={profile.skills?.join(", ") || ""}
      onChange={(e) =>
        setProfile({
          ...profile,
          skills: e.target.value.split(",").map(s => s.trim()),
        })
      }
    />

    <div className="flex gap-3">
      <button
        onClick={updateProfile}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>

      <button
        onClick={() => setEditMode(false)}
        className="bg-gray-400 text-white px-4 py-2 rounded"
      >
        Cancel
      </button>
    </div>
  </div>
)}

      </div>


      {/* Resume */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-3">Resume</h3>

        {resumeFile ? (
          <a
            href={`http://localhost:5000/uploads/${resumeFile}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            View Resume
          </a>
        ) : (
          <p className="text-gray-600">No resume uploaded</p>
        )}
      </div>

      {/* Extracted Skills */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-3">
          Extracted Skills (AI)
        </h3>

        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No skills extracted yet</p>
        )}
      </div>

      {/* Applications */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">My Applications</h3>

        {applications.length === 0 && (
          <p className="text-gray-600">No applications yet</p>
        )}

        {applications.map((app) => (
          <div
            key={app._id}
            className="border-b py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">

            <div>
              <p className="font-medium">{app.job.title}</p>
              <p className="text-sm text-gray-600">{app.job.company}</p>
            </div>

            <div className="text-right">
              <p className="text-sm">
                Status:{" "}
                <span className="font-medium text-blue-600">
                  {app.status}
                </span>
              </p>
              <p className="text-sm text-green-600">
                Match: {app.matchScore}%
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  </div>
);

}

export default Profile;
