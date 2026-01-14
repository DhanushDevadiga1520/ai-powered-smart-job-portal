import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function Home() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const { user } = useContext(AuthContext);
  const [recommended, setRecommended] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`);
        setJobs(res.data);
      } catch (error) {
        console.log("Error fetching jobs");
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
  const fetchRecommended = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/jobs/recommended`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRecommended(res.data);
    } catch (error) {
      console.log("Error fetching recommendations");
    }
  };

  fetchRecommended();
}, []);

useEffect(() => {
  const fetchAppliedJobs = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/applications/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const jobIds = res.data.map(app => app.job._id);
      setAppliedJobs(jobIds);

    } catch (error) {
      console.log("Error fetching applied jobs");
    }
  };

  if (user?.role === "jobseeker") {
    fetchAppliedJobs();
  }
}, [user]);


  // ✅ MOVE THIS FUNCTION HERE (BEFORE RETURN)
 const applyJob = async (jobId) => {
  try {
    const token = localStorage.getItem("token");

    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/applications/apply/${jobId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setAppliedJobs(prev => [...prev, jobId]);
    alert("Job applied successfully ✅");

  } catch (error) {
    alert(error.response?.data?.message || "Error applying job");
  }
};

  return (
  <div className="min-h-screen bg-gray-100 p-4 md:p-6">
    <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">
      Available Jobs
    </h2>

    {jobs.length === 0 && (
      <p className="text-center text-gray-600">No jobs available</p>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <div
          key={job._id}
          className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition break-words">

          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {job.title}
          </h3>

          <p className="text-gray-600">
            <strong>Company:</strong> {job.company}
          </p>

          <p className="text-gray-600">
            <strong>Location:</strong> {job.location}
          </p>

          <p className="text-gray-600">
            <strong>Skills:</strong> {job.skills.join(", ")}
          </p>

          {job.salary && (
            <p className="text-gray-700 font-medium mt-2">
              💰 {job.salary}
            </p>
          )}

        {user?.role === "jobseeker" && (
  <button
    onClick={() => applyJob(job._id)}
    disabled={appliedJobs.includes(job._id)}
    className={`mt-4 w-full py-2 rounded 
      ${appliedJobs.includes(job._id)
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700 text-white"}`}
  >
    {appliedJobs.includes(job._id) ? "Applied" : "Apply Now"}
  </button>
)}

        </div>
      ))}
    </div>
  </div>
);

}

export default Home;
