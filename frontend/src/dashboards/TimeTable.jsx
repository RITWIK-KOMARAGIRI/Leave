import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaTrash, FaPlus, FaClock, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import { fetchTimetable ,addClassApi, updateClassApi, deleteClassApi } from '../api/timetableApi';
const Timetable = () => {
  const navigate = useNavigate();
  // Days of the week
  const days = [
    { id: 'mon', name: 'Monday', short: 'Mon' },
    { id: 'tue', name: 'Tuesday', short: 'Tue' },
    { id: 'wed', name: 'Wednesday', short: 'Wed' },
    { id: 'thu', name: 'Thursday', short: 'Thu' },
    { id: 'fri', name: 'Friday', short: 'Fri' },
    { id: 'sat', name: 'Saturday', short: 'Sat' },
    { id: 'sun', name: 'Sunday', short: 'Sun' }
  ];
const [schedule, setSchedule] = useState({});
const [loading, setLoading] = useState(true);
const [isPublished, setIsPublished] = useState(false);
const [logs, setLogs] = useState([]);

  // Time periods with names
  const periods = [
    { id: 'p1', time: '8:00 - 9:00', name: 'P1' },
    { id: 'p2', time: '9:00 - 10:00', name: 'P2' },
    { id: 'p3', time: '10:00 - 11:00', name: 'P3' },
    { id: 'p4', time: '11:00 - 12:00', name: 'P4' },
    { id: 'p5', time: '12:00 - 13:00', name: 'P5' },
    { id: 'p6', time: '13:00 - 14:00', name: 'P6' },
    { id: 'p7', time: '14:00 - 15:00', name: 'P7' },
    { id: 'p8', time: '15:00 - 16:00', name: 'P8' },
    { id: 'p9', time: '16:00 - 17:00', name: 'P9' }
  ];
const [selectedClass, setSelectedClass] = useState("6");
const [selectedSection, setSelectedSection] = useState("A");

  // Available subjects
  const availableSubjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'English', 'History', 'Geography', 'Economics', 'Business Studies',
    'Art', 'Music', 'Physical Education', 'Languages', 'Elective'
  ];


  const [editingCell, setEditingCell] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [highlightPeriod, setHighlightPeriod] = useState(null);
  const [newClass, setNewClass] = useState({
    day: 'mon',
    period: 'p1',
    subject: '',
    teacher: '',
    room: ''
  });

  const performSearch = async (query) => {
    if (!query) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`https://api.kodebloom.com/api/timetable/search?query=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchTerm) performSearch(searchTerm);
      else setIsSearching(false);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const fetchLatest = async () => {
  const res = await fetchTimetable(selectedClass, selectedSection);
  formatAndSet(res.data.data);
};

 useEffect(() => {
  const loadTimetable = async () => {
    try {
      setLoading(true);

      const res = await fetchTimetable(selectedClass, selectedSection);

      const formatted = {};
      const dayMap = {
        Monday: "mon",
        Tuesday: "tue",
        Wednesday: "wed",
        Thursday: "thu",
        Friday: "fri",
        Saturday: "sat",
        Sunday: "sun",
      };

      timetable.forEach(item => {
        const dayKey = dayMap[item.day];
        const periodKey = `p${item.period.id}`;

        if (!formatted[dayKey]) formatted[dayKey] = {};

        formatted[dayKey][periodKey] = {
          subject: item.subject,
          teacher: item.teacher,
          room: item.room,
        };
      });

      setSchedule(formatted);
    } catch (err) {
      console.error("Failed to load timetable", err);
    } finally {
      setLoading(false);
    }
  };

  loadTimetable();
}, [selectedClass, selectedSection]);

const handleAddClass = async () => {
  try {
    await addClassApi({
      className: selectedClass,
      section: selectedSection,
      day: newClass.day,
      period: Number(newClass.period.replace("p", "")),
      subject: newClass.subject,
      teacher: newClass.teacher,
      room: newClass.room,
    });

    setShowAddForm(false);
    fetchLatest(); // reload timetable
  } catch (err) {
    alert("Failed to add class");
  }
};const handleSaveEdit = async () => {
  try {
    await updateClassApi(editingCell._id, {
      subject: editingCell.subject,
      teacher: editingCell.teacher,
      room: editingCell.room,
      day: editingCell.day,
      period: Number(editingCell.period.replace("p", "")),
    });

    setEditingCell(null);
    fetchLatest();
  } catch (err) {
    alert("Update failed");
  }
};const handleDeleteClass = async (id) => {
  if (!window.confirm("Delete this class?")) return;

  try {
    await deleteClassApi(id);
    fetchLatest();
  } catch {
    alert("Delete failed");
  }
};
  // Auto-highlight current period based on time
  useEffect(() => {
    const checkCurrentPeriod = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const period = periods.find(p => {
        const [start, end] = p.time.split(' - ');
        const [startHour, startMin] = start.split(':').map(Number);
        const [endHour, endMin] = end.split(':').map(Number);
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;
        return currentTime >= startTime && currentTime < endTime;
      });

      setHighlightPeriod(period ? period.id : null);
    };

    checkCurrentPeriod();
    const interval = setInterval(checkCurrentPeriod, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Add log entry
  const addLog = (action, details) => {
    const now = new Date();
    const timestamp = now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }) + ' ' + now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    const newLog = {
      id: logs.length + 1,
      action,
      details,
      timestamp,
      user: 'Admin' // You can change this to dynamic user if needed
    };
    
    setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 9)]); // Keep only last 10 logs
  };

  // Handle cell click for editing
  const handleCellClick = (dayId, periodId) => {
    const existingClass = schedule[dayId]?.[periodId];
    if (existingClass) {
      setEditingCell({
        day: dayId,
        period: periodId,
        ...existingClass,
        originalDay: dayId,
        originalPeriod: periodId
      });
    } else {
      setNewClass({
        day: dayId,
        period: periodId,
        subject: '',
        teacher: '',
        room: ''
      });
      setShowAddForm(true);
    }
  };

 
  const timetable = res?.data?.data || [];


  // Handle publish/unpublish
  const handlePublishToggle = () => {
    const newStatus = !isPublished;
    setIsPublished(newStatus);
    
    // Add log entry
    addLog(newStatus ? 'Timetable Published' : 'Timetable Unpublished', 
           newStatus ? 'Timetable published for students' : 'Timetable unpublished');
    
    alert(`Timetable ${newStatus ? 'published' : 'unpublished'} successfully!`);
  };

  // Export timetable
  const handleExport = () => {
    const dataStr = JSON.stringify(schedule, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'timetable-schedule.json';
    link.click();
    
    // Add log entry
    addLog('Timetable Exported', 'Timetable data exported to JSON file');
  };

  // Import timetable
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSchedule = JSON.parse(e.target.result);
        setSchedule(importedSchedule);
        
        // Add log entry
        addLog('Timetable Imported', 'Timetable data imported from file');
        
        alert('Timetable imported successfully!');
      } catch (error) {
        alert('Error importing file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };


  // Clear all logs
  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      setLogs([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-[95rem] mx-auto">
        {/* Header */}
        <Header/>
        {/* Back to Dashboard Button */}
        <div className="container px-2 pt-2">
          <button
            onClick={() => navigate('/principal/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition mb-2"
          >
            <FaArrowLeft />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Academic Timetable</h1>
          <p className="text-gray-600 mt-2">Manage your weekly schedule efficiently</p>
        </div>

               {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Left side controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Class and Section Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Class Filter */}
                <div className="relative">
<select
  value={selectedClass}
  onChange={(e) => setSelectedClass(e.target.value)}
  className="w-full sm:w-40 px-4 py-2 border border-gray-300 rounded-lg"
>
                    <option value="">Select Class</option>
                    <option value="10">Class 10</option>
                    <option value="9">Class 9</option>
                    <option value="8">Class 8</option>
                    <option value="7">Class 7</option>
                    <option value="6">Class 6</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                
                {/* Section Filter */}
                <div className="relative">
<select
  value={selectedSection}
  onChange={(e) => setSelectedSection(e.target.value)}
  className="w-full sm:w-40 px-4 py-2 border border-gray-300 rounded-lg"
>
                    <option value="">Select Section</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                    <option value="E">Section E</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search subjects, teachers, rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  🔍
                </div>
              </div>

              {/* Publish Status */}
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-lg font-medium ${isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {isPublished ? '✅ Published' : '📝 Draft'}
                </div>
                <button
                  onClick={handlePublishToggle}
                  className={`px-4 py-2 rounded-lg font-medium text-white ${isPublished ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
                >
                  {isPublished ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center gap-2"
              >
                <FaPlus />
                <span>Add Class</span>
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium flex items-center gap-2"
              >
                <span>💾 Export</span>
              </button>
              <label className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium flex items-center gap-2 cursor-pointer">
                <span>📁 Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium flex items-center gap-2"
              >
                <span>🔄 Reset</span>
              </button>
            </div>
          </div>

          {/* Current Time Highlight */}
          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Current period highlighted in blue</span>
            </div>
          </div>
        </div>

        {/* Timetable Grid or Search Results */}
        {isSearching && searchTerm ? (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Search Results for "{searchTerm}"</h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map(result => (
                  <div key={result._id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-lg text-blue-700">{result.subject}</div>
                        <div className="text-sm font-medium text-gray-800">{result.teacher}</div>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                        Class {result.className}-{result.section}
                      </span>
                    </div>
                    <div className="border-t border-gray-100 pt-2 mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400" />
                        <span className="capitalize">{result.day}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClock className="text-gray-400" />
                        <span>Period {result.period.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">🚪</span>
                        <span>{result.room}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">No classes found matching your search.</p>
              </div>
            )}
          </div>
        ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mb-8 overflow-x-auto">
          {/* Header Row - Periods */}
          <div className="grid grid-cols-10 border-b border-gray-200 min-w-[1200px]">
            <div className="p-4 bg-gray-50 font-semibold text-gray-700 sticky left-0 z-10">Day/Period</div>
            {periods.map(period => (
              <div
                key={period.id}
                className={`p-4 text-center border-l border-gray-200 ${highlightPeriod === period.id ? 'bg-blue-50' : 'bg-gray-50'}`}
              >
                <div className="font-semibold text-gray-800">{period.name}</div>
                <div className="text-xs text-gray-600 mt-1">{period.time}</div>
                {highlightPeriod === period.id && (
                  <div className="mt-1">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Days Rows */}
          {days.map(day => (
            <div key={day.id} className="grid grid-cols-10 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 min-w-[1200px]">
              {/* Day Column - Made sticky */}
              <div className="p-4 bg-gray-50 border-r border-gray-200 sticky left-0 z-10">
                <div className="font-semibold text-gray-800">{day.name}</div>
                <div className="text-sm text-gray-600">{day.short}</div>
              </div>

              {/* Period Cells - All 9 periods */}
              {periods.map(period => {
                const classInfo = schedule[day.id]?.[period.id];
                const isCurrentPeriod = highlightPeriod === period.id;
                
                return (
                  <div
                    key={`${day.id}-${period.id}`}
                    className={`p-3 border-l border-gray-200 min-h-[120px] flex items-center justify-center cursor-pointer transition-all duration-200 ${isCurrentPeriod ? 'bg-blue-50' : ''}`}
                    onClick={() => handleCellClick(day.id, period.id)}
                  >
                    {classInfo ? (
                      <div className={`w-full h-full p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow ${isCurrentPeriod ? 'ring-2 ring-blue-300' : ''}`}>
                        <div className="font-semibold text-sm text-gray-800 truncate w-full">{classInfo.subject}</div>
                        <div className="text-xs text-gray-600 mt-1 truncate w-full">{classInfo.teacher}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{classInfo.room}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCell({
                              day: day.id,
                              period: period.id,
                              ...classInfo,
                              originalDay: day.id,
                              originalPeriod: period.id
                            });
                          }}
                          className="mt-2 text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-1"
                        >
                          <FaEdit size={10} />
                          Edit
                        </button>
                      </div>
                    ) : (
                      <div className={`w-full h-full flex flex-col items-center justify-center ${isCurrentPeriod ? 'bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}>
                        <><FaPlus className="text-2xl" /><span className="text-xs mt-1">Add Class</span></>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        )}

        {/* Current Period Indicator */}
        {highlightPeriod && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-sm p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-semibold text-blue-800">Current Period</h3>
                  <p className="text-sm text-blue-600">
                    Period {periods.find(p => p.id === highlightPeriod)?.name.replace('P', '')} • 
                    {periods.find(p => p.id === highlightPeriod)?.time}
                  </p>
                </div>
              </div>
              <div className="text-sm text-blue-700">
                <FaClock className="inline mr-1" />
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        )}

        {/* Activity Logs Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Activity Logs</h3>
              <p className="text-gray-600 mt-1">Recent timetable modifications</p>
            </div>
            <button
              onClick={handleClearLogs}
              className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-medium flex items-center gap-2"
            >
              <FaTrash />
              Clear Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Details</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Timestamp</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">User</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {log.action === 'Class Added' && <FaPlus className="text-green-500" />}
                          {log.action === 'Class Modified' && <FaEdit className="text-blue-500" />}
                          {log.action === 'Class Deleted' && <FaTrash className="text-red-500" />}
                          {log.action.includes('Published') && <FaCheckCircle className="text-green-500" />}
                          {log.action === 'Timetable Reset' && <span className="text-orange-500">🔄</span>}
                          {log.action === 'Timetable Exported' && <span className="text-purple-500">💾</span>}
                          {log.action === 'Timetable Imported' && <span className="text-indigo-500">📁</span>}
                          <span className="font-medium text-gray-800">{log.action}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{log.details}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaCalendarAlt className="text-gray-400" />
                          {log.timestamp}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {log.user}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      No activity logs yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Showing {logs.length} recent activities
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Schedule Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {Object.values(schedule).reduce((total, day) => total + Object.keys(day || {}).length, 0)}
              </div>
              <div className="text-gray-600">Total Classes</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{days.length}</div>
              <div className="text-gray-600">Days</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{periods.length}</div>
              <div className="text-gray-600">Periods</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {new Set(Object.values(schedule).flatMap(day => Object.values(day || {}).map(c => c.subject))).size}
              </div>
              <div className="text-gray-600">Unique Subjects</div>
            </div>
          </div>
        </div>

     

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Timetable;