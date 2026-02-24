import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BackButton from '../components/BackButton';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  
  // Form states
  const [newAnnouncement, setNewAnnouncement] = useState({ 
    title: '', 
    message: '', 
    priority: 'Medium',
    targetAudience: 'All' 
  });
  
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ 
    title: '', 
    message: '', 
    priority: 'Medium' 
  });

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("https://api.kodebloom.com/api/announcements", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Sort by createdAt desc
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAnnouncements(sorted);
      }
    } catch (err) {
      console.error("Error fetching announcements", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.message.trim()) {
      alert('Please fill in title and message');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://api.kodebloom.com/api/announcements", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...newAnnouncement,
          targetAudience: [newAnnouncement.targetAudience]
        })
      });

      if (res.ok) {
        setNewAnnouncement({ title: '', message: '', priority: 'Medium', targetAudience: 'All' });
        fetchAnnouncements();
        showToast("Announcement published successfully!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to create announcement");
      }
    } catch (err) {
      alert("Error creating announcement");
    }
  };

  const handleUpdateAnnouncement = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://api.kodebloom.com/api/announcements/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: editData.title,
          message: editData.message,
          priority: editData.priority
        })
      });

      if (res.ok) {
        setEditId(null);
        fetchAnnouncements();
        showToast("Announcement updated successfully!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update announcement");
      }
    } catch (err) {
      alert("Error updating announcement");
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://api.kodebloom.com/api/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchAnnouncements();
        showToast("Announcement deleted successfully!");
      } else {
        alert("Failed to delete announcement");
      }
    } catch (err) {
      alert("Error deleting announcement");
    }
  };

  const showToast = (msg) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const startEdit = (announcement) => {
    setEditId(announcement._id);
    setEditData({
      title: announcement.title,
      message: announcement.message,
      priority: announcement.priority || 'Medium'
    });
  };

  const cancelEdit = () => {
    setEditId(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const canEdit = role === "Principal" || role === "Admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg max-w-sm">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium">{notificationMsg}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <Header />
      <div className="px-4 md:px-6 pt-4">
        <BackButton />
      </div>
      
      <div className="flex-grow p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 shadow-xl mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <span className="text-2xl">📢</span>
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">School Announcements</h1>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${canEdit ? 'bg-green-500/30 text-green-100' : 'bg-blue-500/30 text-blue-100'}`}>
                        {canEdit ? '🛠️ Edit Mode' : '👁️ View Only'}
                      </span>
                      <span className="text-white/80 text-sm">
                        {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add New Announcement Form (Principal/Admin only) */}
          {canEdit && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <span className="text-blue-600">✨</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Create New Announcement</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Important Notice"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newAnnouncement.priority}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    placeholder="Enter the detailed message here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="3"
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                  />
                </div>
                
                <div className="flex justify-end pt-2">
                  <button 
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center space-x-2"
                    onClick={handleAddAnnouncement}
                    disabled={!newAnnouncement.title.trim() || !newAnnouncement.message.trim()}
                  >
                    <span>📝</span>
                    <span>Publish Announcement</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Announcements List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading announcements...</div>
            ) : announcements.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4 opacity-20">📭</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No Announcements Yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {canEdit 
                    ? 'Create your first announcement using the form above' 
                    : 'Check back later for announcements.'}
                </p>
              </div>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  {/* Edit Mode */}
                  {canEdit && editId === announcement._id ? (
                    <div className="p-6 bg-blue-50">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                              value={editData.title}
                              onChange={(e) => setEditData({...editData, title: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                            <select
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                              value={editData.priority}
                              onChange={(e) => setEditData({...editData, priority: e.target.value})}
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                          <textarea
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                            value={editData.message}
                            onChange={(e) => setEditData({...editData, message: e.target.value})}
                            rows="4"
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-3 pt-2">
                          <button 
                            className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center space-x-2"
                            onClick={() => handleUpdateAnnouncement(announcement._id)}
                          >
                            <span>💾</span>
                            <span>Save Changes</span>
                          </button>
                          <button 
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                            onClick={cancelEdit}
                          >
                            <span>❌</span>
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{announcement.title}</h3>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              announcement.priority === 'High' ? 'bg-red-100 text-red-800' :
                              announcement.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {announcement.priority} Priority
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(announcement.createdAt)}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 whitespace-pre-line leading-relaxed bg-gray-50 p-4 rounded-lg">
                            {announcement.message}
                          </p>
                        </div>
                        
                        {canEdit && !editId && (
                          <div className="flex space-x-2 ml-4">
                            <button 
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              onClick={() => startEdit(announcement)}
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={() => handleDeleteAnnouncement(announcement._id)}
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcements;
