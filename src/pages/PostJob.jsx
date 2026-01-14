import { useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function PostJob() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [salary, setSalary] = useState("");
  const [message, setMessage] = useState("");
  const { user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/jobs/create`,
        {
          title,
          company,
          location,
          skills: skills.split(",").map((s) => s.trim()),
          description,
          salary,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Job posted successfully ✅");

      // Clear form
      setTitle("");
      setCompany("");
      setLocation("");
      setSkills("");
      setDescription("");
      setSalary("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Error posting job");
    }
  };

  if (user?.role !== "recruiter") {
  return <Navigate to="/" />;
}
 
 return (
  <div className="min-h-screen bg-gray-100 p-4 md:p-6">
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 md:p-8">

      <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">
        Post a New Job
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block font-medium text-gray-700">Job Title</label>
          <input
            type="text"
            className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Company</label>
          <input
            type="text"
            className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Location</label>
          <input
            type="text"
            className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Skills (comma separated)</label>
          <input
            type="text"
            className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Salary</label>
          <input
            type="text"
            className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Job Description</label>
          <textarea
            rows="5"
            className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700"
        >
          Post Job
        </button>

      </form>

      {message && (
        <p className="text-center mt-4 text-green-600">
          {message}
        </p>
      )}

    </div>
  </div>
);

}

export default PostJob;
