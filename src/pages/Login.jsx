import { useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post( 
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", res.data.token);
      login(res.data.user);

      if (res.data.user.role === "jobseeker") {
        navigate("/");
      } else if (res.data.user.role === "recruiter") {
        navigate("/recruiter");
      } else if (res.data.user.role === "admin") {
        navigate("/admin");
      }
      setMessage("Login successful ✅");

    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

 return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
        Login to Smart Job Portal
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700"
        >
          Login
        </button>
      </form>

      {message && (
        <p className="text-center mt-4 text-red-600">
          {message}
        </p>
      )}

      <p className="text-center mt-6 text-gray-600">
        Don’t have an account?{" "}
        <Link to="/register" className="text-blue-600 font-medium">
        Register
        </Link>
      </p>
    </div>
  </div>
);


}

export default Login;
