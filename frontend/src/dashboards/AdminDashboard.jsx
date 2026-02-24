import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUserTie, 
  FaClipboardList, 
  FaDownload, 
  FaTrash, 
  FaCheckCircle, 
  FaPlus,
  FaSignOutAlt,
  FaSearch,
  FaFilter,
  FaCog
} from "react-icons/fa";
import Header from "../components/Header";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("logs");
  const [logs, setLogs] = useState([]);
  const [principals, setPrincipals] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Principal Form State
  const [newPrincipal, setNewPrincipal] = useState({ email: "", password: "" });
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({ name: "", email: "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  // Log Filters
  const [logFilters, setLogFilters] = useState({
    role: "",
    action: "",
    email: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "Admin") {
      navigate("/select-role");
      return;
    }

    if (activeTab === "logs") fetchLogs();
    if (activeTab === "principals") fetchPrincipals();
    if (activeTab === "settings") fetchAdminProfile();

    // Real-time logs update every 5 seconds
    const interval = setInterval(() => {
      if (activeTab === "logs") {
        fetchLogs();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [logFilters, activeTab, navigate]);

  const fetchAdminProfile = async () => {
    // In a real app, you might have a route to get "me", 
    // or we just use the stored user info if available, 
    // but better to fetch fresh data if possible.
    // Since we don't have a specific "get me" route for Admin yet, 
    // we can assume the user knows their current email or use the login response data stored in localStorage.
    // However, to fill the form, let's just use empty or stored values.
    // Ideally: router.get("/me", ...)
    // For now, let's leave fields empty or pre-fill from localStorage if we stored user details.
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setProfileData({ name: user.name || "", email: user.email || "" });
  };

  const fetchLogs = async () => {
    try {
      // Only set loading on initial fetch, not polling
      if (logs.length === 0) setLoading(true);

      // Filter out empty values
      const filteredFilters = Object.fromEntries(
        Object.entries(logFilters).filter(([key, value]) => value && value.trim() !== "")
      );
      
      const queryParams = new URLSearchParams(filteredFilters).toString();
      const url = queryParams ? `https://api.kodebloom.com/api/admin/logs?${queryParams}&limit=10` : `http://localhost:5002/api/admin/logs?limit=10`;
      
      const token = localStorage.getItem("token");
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch logs");
    } finally {
      if (logs.length === 0) setLoading(false);
    }
  };

  const fetchPrincipals = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://api.kodebloom.com/api/admin/principals", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setPrincipals(data);
    } catch (err) {
      console.error("Error fetching principals", err);
    }
  };

  const handleCreatePrincipal = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://api.kodebloom.com/api/admin/create-principal", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newPrincipal)
      });
      if (res.ok) {
        alert("Principal created successfully!");
        setShowCreateModal(false);
        setNewPrincipal({ email: "", password: "" });
        fetchPrincipals();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to create principal");
      }
    } catch (err) {
      alert("Error creating principal");
    }
  };

  const handleActivatePrincipal = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://api.kodebloom.com/api/admin/approve-principal/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPrincipals();
        alert("Principal activated!");
      }
    } catch (err) {
      alert("Error activating principal");
    }
  };

  const handleDeletePrincipal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Principal? This action cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://api.kodebloom.com/api/admin/delete-principal/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPrincipals();
        alert("Principal deleted!");
      }
    } catch (err) {
      alert("Error deleting principal");
    }
  };

  const handleDownloadLogs = async () => {
    try {
      const queryParams = new URLSearchParams(logFilters).toString();
      const token = localStorage.getItem("token");
      const res = await fetch(`https://api.kodebloom.com/api/admin/logs/pdf?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "system_logs.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      alert("Error downloading logs");
    }
  };

  const handleLogout = async () => {
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://api.kodebloom.com/api/admin/update-profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Profile updated successfully");
        // Update local storage if needed
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...user, ...data.admin }));
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (err) {
      alert("Error updating profile");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://api.kodebloom.com/api/admin/change-password", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Password updated successfully");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        alert(data.message || "Failed to update password");
      }
    } catch (err) {
      alert("Error updating password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">System Management & Logs</p>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("logs")}
              className={`pb-3 px-4 font-medium transition ${
                activeTab === "logs" 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaClipboardList /> System Logs
              </div>
            </button>
            <button
              onClick={() => setActiveTab("principals")}
              className={`pb-3 px-4 font-medium transition ${
                activeTab === "principals" 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaUserTie /> Manage Principals
              </div>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`pb-3 px-4 font-medium transition ${
                activeTab === "settings" 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaCog /> Settings
              </div>
            </button>
          </div>

          {/* Content Area */}
          {activeTab === "logs" ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-800">System Activity Logs</h2>
                <button
                  onClick={handleDownloadLogs}
                  className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
                >
                  <FaDownload /> Download PDF
                </button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                <input 
                  type="text" 
                  placeholder="Filter by Email" 
                  className="p-2 border rounded"
                  value={logFilters.email}
                  onChange={(e) => setLogFilters({...logFilters, email: e.target.value})}
                />
                <select 
                  className="p-2 border rounded"
                  value={logFilters.role}
                  onChange={(e) => setLogFilters({...logFilters, role: e.target.value})}
                >
                  <option value="">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Principal">Principal</option>
                  <option value="Staff">Staff</option>
                </select>
                <select 
                  className="p-2 border rounded"
                  value={logFilters.action}
                  onChange={(e) => setLogFilters({...logFilters, action: e.target.value})}
                >
                  <option value="">All Actions</option>
                  <option value="LOGIN">Login</option>
                  <option value="LOGOUT">Logout</option>
                  <option value="LOGIN_FAILED">Login Failed</option>
                  <option value="CREATE_PRINCIPAL">Create Principal</option>
                  <option value="APPROVE_PRINCIPAL">Approve Principal</option>
                  <option value="DELETE_PRINCIPAL">Delete Principal</option>
                  <option value="CREATE_STAFF">Create Staff</option>
                  <option value="UPDATE_STAFF">Update Staff</option>
                  <option value="DELETE_STAFF">Delete Staff</option>
                  <option value="BULK_DELETE_STAFF">Bulk Delete Staff</option>
                  <option value="CREATE_STUDENT">Create Student</option>
                  <option value="UPDATE_STUDENT">Update Student</option>
                  <option value="DELETE_STUDENT">Delete Student</option>
                  <option value="CREATE_LEAVE_REQUEST">Create Leave Request</option>
                  <option value="UPDATE_ATTENDANCE">Update Attendance</option>
                  <option value="CREATE_ANNOUNCEMENT">Create Announcement</option>
                  <option value="UPDATE_ANNOUNCEMENT">Update Announcement</option>
                  <option value="DELETE_ANNOUNCEMENT">Delete Announcement</option>
                  <option value="CREATE_TIMETABLE">Create Timetable</option>
                  <option value="UPDATE_TIMETABLE">Update Timetable</option>
                  <option value="DELETE_TIMETABLE">Delete Timetable</option>
                  <option value="UPDATE_ADMIN_PROFILE">Update Admin Profile</option>
                </select>
                <input 
                  type="date" 
                  className="p-2 border rounded"
                  value={logFilters.startDate}
                  onChange={(e) => setLogFilters({...logFilters, startDate: e.target.value})}
                />
                <input 
                  type="date" 
                  className="p-2 border rounded"
                  value={logFilters.endDate}
                  onChange={(e) => setLogFilters({...logFilters, endDate: e.target.value})}
                />
              </div>

              {/* Logs Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3">Timestamp</th>
                      <th className="px-6 py-3">Action</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">User Email</th>
                      <th className="px-6 py-3">IP Address</th>
                      <th className="px-6 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan="6" className="text-center py-8">Loading logs...</td></tr>
                    ) : logs.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-8 text-gray-500">No logs found</td></tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ip}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {JSON.stringify(log.details)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === "principals" ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Principal Accounts</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <FaPlus /> Create Principal
                </button>
              </div>

              {/* Principals List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {principals.map((p) => (
                  <div key={p._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-blue-50 rounded-full">
                        <FaUserTie className="text-blue-600 text-xl" />
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        p.isActive 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {p.isActive ? "Active" : "Pending Activation"}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">{p.email}</h3>
                    <p className="text-sm text-gray-500 mb-4">ID: {p._id}</p>
                    
                    <div className="flex gap-2">
                      {!p.isActive && (
                        <button
                          onClick={() => handleActivatePrincipal(p._id)}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                        >
                          <FaCheckCircle /> Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePrincipal(p._id)}
                        className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition flex items-center justify-center gap-2"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                ))}
                {principals.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No principals found. Create one to get started.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Admin Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Profile Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Update Profile</h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                    </div>
                    <button 
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Update Profile
                    </button>
                  </form>
                </div>

                {/* Password Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Change Password</h3>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      />
                    </div>
                    <button 
                      type="submit"
                      className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
                    >
                      Change Password
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Principal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Principal</h3>
            <form onSubmit={handleCreatePrincipal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newPrincipal.email}
                  onChange={(e) => setNewPrincipal({...newPrincipal, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newPrincipal.password}
                  onChange={(e) => setNewPrincipal({...newPrincipal, password: e.target.value})}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
