// import { NavLink, useNavigate } from "react-router-dom";
// import {
//   FaTachometerAlt,
//   FaUserGraduate,
//   FaClipboardCheck,
//   FaCalendarAlt,
//   FaPaperPlane,
//   FaUserCircle,
//   FaSignOutAlt,
//   FaChalkboardTeacher,
//   FaBars,
//   FaTimes,
//   FaUser,
//   FaBullhorn,
//   FaUsers
// } from "react-icons/fa";
// import { useState } from "react";

// const PrincipalSidebar = () => {
//   const navigate = useNavigate();
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   const logout = () => {
//     localStorage.clear();
//     navigate("/principal-login");
//   };

//   return (
//     <>
//       {/* Mobile Menu Button */}
//       <button
//         onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//         className="lg:hidden fixed top-4 left-4 z-50 bg-blue-700 text-white p-3 rounded-lg shadow-lg"
//       >
//         {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
//       </button>

//       {/* Sidebar */}
//       <div
//         className={`
//           fixed lg:static inset-y-0 left-0 w-64
//           bg-gradient-to-b from-blue-800 to-blue-900
//           text-white min-h-screen
//           transform ${
//             isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
//           }
//           transition-transform duration-300 z-40 shadow-xl flex flex-col
//         `}
//       >
//         {/* Header */}
//         <div className="p-6 border-b border-blue-700">
//           <div className="flex items-center gap-3">
//             <div className="bg-blue-600 p-3 rounded-xl">
//               <FaChalkboardTeacher className="text-2xl" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold">Principal Portal</h1>
//               <p className="text-blue-200 text-sm">School Administration</p>
//             </div>
//           </div>
//         </div>

//         {/* User Info */}
//         <div className="px-6 py-4 border-b border-blue-700 bg-blue-800/30">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
//               <FaUser className="text-xl" />
//             </div>
//             <div>
//               <p className="font-semibold">Principal Account</p>
//               <p className="text-xs text-blue-200">Full Access</p>
//             </div>
//           </div>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 p-4 overflow-y-auto space-y-2">

//           {/* Dashboard */}
//           <NavLink
//             to="/principal/dashboard"
//             end
//             className={({ isActive }) =>
//               `flex items-center px-4 py-3 rounded-xl ${
//                 isActive
//                   ? "bg-white/10 border-l-4 border-blue-400"
//                   : "hover:bg-white/5"
//               }`
//             }
//             onClick={() => setIsMobileMenuOpen(false)}
//           >
//             <FaTachometerAlt className="text-lg" />
//             <span className="ml-3">Dashboard</span>
//           </NavLink>

//           {/* Student Management */}
//           <NavLink
//             to="/principal/students"
//             className={({ isActive }) =>
//               `flex items-center px-4 py-3 rounded-xl ${
//                 isActive
//                   ? "bg-white/10 border-l-4 border-blue-400"
//                   : "hover:bg-white/5"
//               }`
//             }
//             onClick={() => setIsMobileMenuOpen(false)}
//           >
//             <FaUserGraduate className="text-lg" />
//             <span className="ml-3">Student Management</span>
//           </NavLink>

//           {/* Staff Management */}
//           <NavLink
//             to="/principal/staff"
//             className={({ isActive }) =>
//               `flex items-center px-4 py-3 rounded-xl ${
//                 isActive
//                   ? "bg-white/10 border-l-4 border-blue-400"
//                   : "hover:bg-white/5"
//               }`
//             }
//             onClick={() => setIsMobileMenuOpen(false)}
//           >
//             <FaUsers className="text-lg" />
//             <span className="ml-3">Staff Management</span>
//           </NavLink>

//           {/* Announcements */}
//           <NavLink
//             to="/principal/announcements"
//             className={({ isActive }) =>
//               `flex items-center px-4 py-3 rounded-xl ${
//                 isActive
//                   ? "bg-white/10 border-l-4 border-blue-400"
//                   : "hover:bg-white/5"
//               }`
//             }
//             onClick={() => setIsMobileMenuOpen(false)}
//           >
//             <FaBullhorn className="text-lg" />
//             <span className="ml-3">Announcements</span>
//           </NavLink>

//           {/* Timetable */}
//           <NavLink
//             to="/principal/timetable"
//             className={({ isActive }) =>
//               `flex items-center px-4 py-3 rounded-xl ${
//                 isActive
//                   ? "bg-white/10 border-l-4 border-blue-400"
//                   : "hover:bg-white/5"
//               }`
//             }
//             onClick={() => setIsMobileMenuOpen(false)}
//           >
//             <FaCalendarAlt className="text-lg" />
//             <span className="ml-3">Timetable</span>
//           </NavLink>

//           {/* Attendance */}
//           <NavLink
//             to="/principal/attendance"
//             className={({ isActive }) =>
//               `flex items-center px-4 py-3 rounded-xl ${
//                 isActive
//                   ? "bg-white/10 border-l-4 border-blue-400"
//                   : "hover:bg-white/5"
//               }`
//             }
//             onClick={() => setIsMobileMenuOpen(false)}
//           >
//             <FaClipboardCheck className="text-lg" />
//             <span className="ml-3">Attendance</span>
//           </NavLink>

//           {/* Profile */}
//           <NavLink
//             to="/principal/profile"
//             className={({ isActive }) =>
//               `flex items-center px-4 py-3 rounded-xl ${
//                 isActive
//                   ? "bg-white/10 border-l-4 border-blue-400"
//                   : "hover:bg-white/5"
//               }`
//             }
//             onClick={() => setIsMobileMenuOpen(false)}
//           >
//             <FaUserCircle className="text-lg" />
//             <span className="ml-3">Profile</span>
//           </NavLink>
//         </nav>

//         {/* Logout */}
//         <div className="p-6 border-t border-blue-700">
//           <button
//             onClick={logout}
//             className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 py-3 rounded-xl transition-all duration-300"
//           >
//             <FaSignOutAlt />
//             <span>Logout</span>
//           </button>
//           <p className="text-xs text-center text-blue-300 mt-4">
//             v1.0.0 • Principal Portal
//           </p>
//         </div>
//       </div>

//       {/* Mobile Overlay */}
//       {isMobileMenuOpen && (
//         <div
//           onClick={() => setIsMobileMenuOpen(false)}
//           className="lg:hidden fixed inset-0 bg-black/50 z-30"
//         />
//       )}
//     </>
//   );
// };

// export default PrincipalSidebar;



import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserGraduate,
  FaClipboardCheck,
  FaCalendarAlt,
  FaUserCircle,
  FaSignOutAlt,
  FaChalkboardTeacher,
  FaBars,
  FaTimes,
  FaUser,
  FaBullhorn,
  FaUsers,
  FaCaretRight,
  FaCaretDown,
} from "react-icons/fa";
import { useState } from "react";

const PrincipalSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ FIXED
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);

  const isAttendanceRoute =
    location.pathname.startsWith("/principal/attendance");

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
      localStorage.clear();
      navigate("/select-role");
    }
  };

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-700 text-white p-3 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* SIDEBAR */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 w-64
          bg-gradient-to-b from-blue-800 to-blue-900
          text-white min-h-screen
          transform ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          transition-transform duration-300 z-40 shadow-xl flex flex-col
        `}
      >
        {/* HEADER */}
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-xl">
              <FaChalkboardTeacher className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Principal Portal</h1>
              <p className="text-blue-200 text-sm">School Administration</p>
            </div>
          </div>
        </div>

        {/* USER INFO */}
        <div className="px-6 py-4 border-b border-blue-700 bg-blue-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <FaUser />
            </div>
            <div>
              <p className="font-semibold">Principal Account</p>
              <p className="text-xs text-blue-200">Full Access</p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 overflow-y-auto space-y-2">

          {/* DASHBOARD */}
          <NavLink
            to="/principal/dashboard"
            end
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl ${
                isActive
                  ? "bg-white/10 border-l-4 border-blue-400"
                  : "hover:bg-white/5"
              }`
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FaTachometerAlt />
            <span className="ml-3">Dashboard</span>
          </NavLink>

          {/* STUDENTS */}
          <NavLink
            to="/principal/students"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl ${
                isActive
                  ? "bg-white/10 border-l-4 border-blue-400"
                  : "hover:bg-white/5"
              }`
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FaUserGraduate />
            <span className="ml-3">Student Management</span>
          </NavLink>

          {/* STAFF */}
          <NavLink
            to="/principal/staff"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl ${
                isActive
                  ? "bg-white/10 border-l-4 border-blue-400"
                  : "hover:bg-white/5"
              }`
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FaUsers />
            <span className="ml-3">Staff Management</span>
          </NavLink>

          {/* ATTENDANCE (DROPDOWN) */}
          <div className="space-y-1">
            <button
              onClick={() => setIsAttendanceOpen(!isAttendanceOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 ${
                isAttendanceRoute
                  ? "bg-white/10 border-l-4 border-blue-400"
                  : ""
              }`}
            >
              <div className="flex items-center">
                <FaClipboardCheck />
                <span className="ml-3">Attendance</span>
              </div>
              {isAttendanceOpen ? <FaCaretDown /> : <FaCaretRight />}
            </button>

            {isAttendanceOpen && (
              <div className="ml-8 space-y-1">
                <NavLink
                  to="/principal/attendance/students"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg text-sm ${
                      isActive
                        ? "bg-blue-600/30 text-blue-300"
                        : "hover:bg-white/5"
                    }`
                  }
                >
                  • Students Attendance
                </NavLink>

                <NavLink
                  to="/principal/attendance/staff"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg text-sm ${
                      isActive
                        ? "bg-blue-600/30 text-blue-300"
                        : "hover:bg-white/5"
                    }`
                  }
                >
                  • Staff Attendance
                </NavLink>
              </div>
            )}
          </div>

          {/* ANNOUNCEMENTS */}
          <NavLink
            to="/principal/announcements"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl ${
                isActive
                  ? "bg-white/10 border-l-4 border-blue-400"
                  : "hover:bg-white/5"
              }`
            }
          >
            <FaBullhorn />
            <span className="ml-3">Announcements</span>
          </NavLink>

          {/* TIMETABLE */}
          <NavLink
            to="/principal/timetable"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl ${
                isActive
                  ? "bg-white/10 border-l-4 border-blue-400"
                  : "hover:bg-white/5"
              }`
            }
          >
            <FaCalendarAlt />
            <span className="ml-3">Timetable</span>
          </NavLink>

          {/* PROFILE */}
          <NavLink
            to="/principal/profile"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl ${
                isActive
                  ? "bg-white/10 border-l-4 border-blue-400"
                  : "hover:bg-white/5"
              }`
            }
          >
            <FaUserCircle />
            <span className="ml-3">Profile</span>
          </NavLink>
        </nav>

        {/* LOGOUT */}
        <div className="p-6 border-t border-blue-700">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-700 py-3 rounded-xl"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}
    </>
  );
};

export default PrincipalSidebar;
