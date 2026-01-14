import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";


function Resume() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const uploadResume = async () => {
    if (!file) {
      setMessage("Please select a PDF file first");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("resume", file);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/upload-resume`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Resume uploaded successfully ✅");
    } catch (error) {
      setMessage("Error uploading resume ❌");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <h2 className="text-xl font-bold mb-4">Upload Resume (PDF)</h2>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />

      <br />

      <button
        onClick={uploadResume}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Upload Resume
      </button>

      {message && <p className="mt-3">{message}</p>}
    </div>
  );
}

export default Resume;
