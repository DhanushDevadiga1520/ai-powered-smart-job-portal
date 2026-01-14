import { useEffect, useState } from "react";
import axios from "axios";

function RecruiterDashboard() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/applications/recruiter",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setApplications(res.data);
      } catch (error) {
        console.log("Error fetching applications");
      }
    };

    fetchApplications();
  }, []);

  const updateStatus = async (id, status) => {
  try {
    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:5000/api/applications/status/${id}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Update UI instantly
    setApplications(applications.map(app =>
      app._id === id ? { ...app, status } : app
    ));
  } catch (error) {
    alert("Error updating status");
  }
};


 return (
  <div className="min-h-screen bg-gray-100 p-4 md:p-6">
    <div className="max-w-6xl mx-auto px-2 md:px-0">

      <h2 className="text-3xl font-bold text-blue-600 mb-6">
        Recruiter Dashboard
      </h2>

      {applications.length === 0 && (
        <p className="text-gray-600">No applications yet</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {applications.map((app) => (
          <div
            key={app._id}
            className="bg-white rounded-lg shadow p-4 md:p-5 break-words"
          >
            <h3 className="text-xl font-semibold text-gray-800">
              {app.job.title}
            </h3>

            <p className="text-gray-600">
              {app.job.company} – {app.job.location}
            </p>

            <hr className="my-3" />

            <p className="font-medium">
              Candidate: {app.applicant.name}
            </p>

            <p className="text-sm text-gray-600">
              Email: {app.applicant.email}
            </p>

            <div className="mt-3">
              <p className="text-sm text-gray-700">
                Match Score:
                <span className="ml-2 font-bold text-green-600">
                  {app.matchScore}%
                </span>
              </p>

              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${app.matchScore}%` }}
                ></div>
              </div>
            </div>

            <p className="mt-3 text-sm">
              Status:
              <span className="ml-2 font-medium text-blue-600">
                {app.status}
              </span>
            </p>

            <div className="flex flex-col md:flex-row gap-3 mt-4">
              <button
                onClick={() => updateStatus(app._id, "Shortlisted")}
                className="bg-green-600 text-white px-4 py-1 rounded"
              >
                Shortlist
              </button>

              <button
                onClick={() => updateStatus(app._id, "Rejected")}
                className="bg-red-500 text-white px-4 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  </div>
);

}

export default RecruiterDashboard;
