import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md px-4 py-3">
      <div className="flex justify-between items-center">

        {/* Logo */}
        <h1 className="text-xl font-bold text-blue-600">
          Smart Job Portal
        </h1>

        {/* Hamburger */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-5">
          <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>

          {user?.role === "jobseeker" && (
            <>
              <Link to="/profile">Profile</Link>
              <Link to="/resume">Resume</Link>
            </>
          )}

          {user?.role === "recruiter" && (
            <>
              <Link to="/recruiter">Dashboard</Link>
              <Link to="/post-job">Post Job</Link>
            </>
          )}

          {user?.role === "admin" && (
            <Link to="/admin">Admin Panel</Link>
          )}

          {user ? (
            <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="text-blue-600">Login</Link>
              <Link to="/register" className="text-blue-600">Register</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden mt-4 flex flex-col gap-3">

          <Link to="/" onClick={() => setOpen(false)}>Home</Link>

          {user?.role === "jobseeker" && (
            <>
              <Link to="/profile" onClick={() => setOpen(false)}>Profile</Link>
              <Link to="/resume" onClick={() => setOpen(false)}>Resume</Link>
            </>
          )}

          {user?.role === "recruiter" && (
            <>
              <Link to="/recruiter" onClick={() => setOpen(false)}>Dashboard</Link>
              <Link to="/post-job" onClick={() => setOpen(false)}>Post Job</Link>
            </>
          )}

          {user?.role === "admin" && (
            <Link to="/admin" onClick={() => setOpen(false)}>Admin Panel</Link>
          )}

          {user ? (
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
