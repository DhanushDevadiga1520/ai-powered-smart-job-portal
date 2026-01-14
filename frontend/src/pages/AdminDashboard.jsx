import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);

  const jobseekers = users.filter(u => u.role === "jobseeker");
  const recruiters = users.filter(u => u.role === "recruiter");

  if (user?.role !== "admin") {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const usersRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers(usersRes.data);

        const jobsRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/jobs/admin/all`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setJobs(jobsRes.data);

      } catch (error) {
        console.log("Error fetching admin data");
      }
    };

    fetchData();
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/auth/admin/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(users.filter((u) => u._id !== id));
      alert("User deleted successfully ✅");
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting user");
    }
  };

  const deleteJob = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/jobs/admin/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setJobs(jobs.filter((j) => j._id !== id));
    } catch (error) {
      alert("Error deleting job");
    }
  };

  const toggleBlockUser = async (id) => {
  try {
    const token = localStorage.getItem("token");

    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/auth/admin/block/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("User block status updated");
    window.location.reload();
  } catch (error) {
    alert("Error blocking user");
  }
};

const promoteUser = async (id) => {
  if (!window.confirm("Promote this recruiter to admin?")) return;

  try {
    const token = localStorage.getItem("token");

    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/auth/admin/promote/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Recruiter promoted to admin ✅");
    window.location.reload();
  } catch (error) {
    alert(error.response?.data?.message || "Error promoting user");
  }
};

const viewProfile = async (id) => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/auth/admin/user/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert(`
Name: ${res.data.name}
Email: ${res.data.email}
Phone: ${res.data.phone || "N/A"}
Location: ${res.data.location || "N/A"}
Experience: ${res.data.experience || "N/A"}
Skills: ${res.data.skills?.join(", ") || "N/A"}
Role: ${res.data.role}
Blocked: ${res.data.isBlocked ? "Yes" : "No"}
`);
  } catch (error) {
    alert("Error loading profile");
  }
};

const viewRecruiterJobs = async (id) => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/jobs/admin/recruiter-jobs/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.length === 0) {
      return alert("This recruiter has not posted any jobs");
    }

    const jobList = res.data
      .map(job => `• ${job.title} (${job.location})`)
      .join("\n");

    alert(`Recruiter's Jobs:\n\n${jobList}`);
  } catch (error) {
    alert("Error loading recruiter jobs");
  }
};

 return (
  <div className="min-h-screen bg-gray-100 p-4 md:p-6">
    <div className="max-w-7xl mx-auto px-2 md:px-0">

      <h2 className="text-3xl font-bold text-blue-600 mb-6">
        Admin Dashboard
      </h2>

      {/* Job Seekers */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Job Seekers</h3>

        {jobseekers.length === 0 && (
          <p className="text-gray-600">No job seekers found</p>
        )}

        {jobseekers.map((u) => (
          <div
            key={u._id}
            className="border-b py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">

            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-gray-600">{u.email}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <button
                onClick={() => viewProfile(u._id)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                View
              </button>

              <button
                onClick={() => toggleBlockUser(u._id)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                {u.isBlocked ? "Unblock" : "Block"}
              </button>

              <button
                onClick={() => deleteUser(u._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recruiters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Recruiters</h3>

        {recruiters.length === 0 && (
          <p className="text-gray-600">No recruiters found</p>
        )}

        {recruiters.map((u) => (
          <div
            key={u._id}
            className="border-b py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2"
          >
            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-gray-600">{u.email}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-2">

              <button
                onClick={() => viewRecruiterJobs(u._id)}
                className="bg-purple-600 text-white px-3 py-1 rounded"
              >
                Jobs
              </button>

              <button
                onClick={() => promoteUser(u._id)}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Promote
              </button>

              <button
                onClick={() => deleteUser(u._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Jobs */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">All Jobs</h3>

        {jobs.length === 0 && (
          <p className="text-gray-600">No jobs found</p>
        )}

        {jobs.map((job) => (
          <div
            key={job._id}
            className="border-b py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2"
          >
            <div>
              <p className="font-medium">{job.title}</p>
              <p className="text-sm text-gray-600">
                {job.company} – {job.location}
              </p>
            </div>

            <button
              onClick={() => deleteJob(job._id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

    </div>
  </div>
);

}

export default AdminDashboard;
