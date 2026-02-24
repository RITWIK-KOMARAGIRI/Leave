import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserGraduate,
  FaClipboardCheck,
  FaCalendarAlt,
  FaPaperPlane,
  FaHistory,
  FaUserCircle,
  FaSignOutAlt,
  FaChalkboardTeacher,
  FaBars,
  FaTimes,
  FaUser
} from "react-icons/fa";
import { useState } from "react";

const Sidebar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("https://api.kodebloom.com/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Logout API call failed:", err);
    } finally {
      // Clear any session/token here
      localStorage.clear();
      navigate("/select-role");
    }
  };

  const menuItems = [
    { path: "/staff/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { path: "/staff/students", icon: <FaUserGraduate />, label: "Students" },
    { path: "/staff/attendance", icon: <FaClipboardCheck />, label: "Attendance" },
    { path: "/staff/timetable", icon: <FaCalendarAlt />, label: "Time Table" },
    { path: "/staff/leave-request", icon: <FaPaperPlane />, label: "Leave Request" },
    { path: "/staff/leave-history", icon: <FaHistory />, label: "Leave History" },
    { path: "/staff/profile", icon: <FaUserCircle />, label: "Profile" },
  ];

  const NavLinkContent = ({ item }) => (
    <>
      <span className="text-xl">{item.icon}</span>
      <span className="ml-3 font-medium">{item.label}</span>
    </>
  );

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-700 text-white p-3 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:static
        inset-y-0 left-0
        w-64
        bg-gradient-to-b from-blue-800 to-blue-900
        text-white
        min-h-screen
        transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        transition-transform duration-300 ease-in-out
        z-40
        shadow-xl
        flex flex-col
      `}>
        
        {/* Header */}
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-3 rounded-xl">
              <FaChalkboardTeacher className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Staff Portal</h1>
              <p className="text-blue-200 text-sm">Administration Dashboard</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-blue-700 bg-blue-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <FaUser className="text-xl" />
            </div>
            <div>
              <p className="font-semibold">Staff Account</p>
              <p className="text-xs text-blue-200 mt-1">Portal Access</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/staff"}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center
                  px-4 py-3
                  rounded-xl
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-white/10 text-white shadow-md border-l-4 border-blue-400' 
                    : 'text-blue-100 hover:bg-white/5 hover:text-white hover:pl-5'
                  }
                `}
              >
                <NavLinkContent item={item} />
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer / Logout */}
        <div className="p-6 border-t border-blue-700">
          <button
            onClick={logout}
            className="
              w-full
              flex items-center justify-center gap-3
              bg-gradient-to-r from-red-600 to-red-700
              hover:from-red-700 hover:to-red-800
              text-white
              font-semibold
              py-3 px-4
              rounded-xl
              transition-all duration-200
              transform hover:-translate-y-0.5
              shadow-md hover:shadow-lg
              active:translate-y-0
            "
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
          
          {/* Version */}
          <div className="mt-4 pt-4 border-t border-blue-700/50 text-center">
            <p className="text-xs text-blue-300">v1.0.0 • Staff Portal</p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}
    </>
  );
};

export default Sidebar;