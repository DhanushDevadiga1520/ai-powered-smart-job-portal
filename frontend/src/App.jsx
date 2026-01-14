import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import PostJob from "./pages/PostJob";
import AdminDashboard from "./pages/AdminDashboard";
import Resume from "./pages/Resume";
import Profile from "./pages/Profile";


function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route
  path="/"
  element={
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  }
/>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
  path="/recruiter"
  element={
    <ProtectedRoute>
      <RecruiterDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/post-job"
  element={
    <ProtectedRoute>
      <PostJob />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/resume"
  element={
    <ProtectedRoute>
      <Resume />
    </ProtectedRoute>
  }
/>
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>

      </Routes>
    </>
  );
}

export default App;
