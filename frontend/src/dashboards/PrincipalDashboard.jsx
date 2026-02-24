import { useState, useEffect, useRef } from 'react';
import PrincipalSidebar from "../components/PrincipalSidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaEye, FaSearch, FaBell, FaUserGraduate, FaChalkboardTeacher, FaCalendarTimes, FaUserInjured, FaCalendarCheck, FaArrowRight, FaArrowLeft, FaIdCard } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
const PrincipalDashboard = () => {
  // Live time and date state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('student');
  const [newsIndex, setNewsIndex] = useState(0);
  const [teachers, setTeachers] = useState([]);
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    sick: 0,
    leave: 0,
    percentage: 0
  });
  
  // Real data state
  const [schedule, setSchedule] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Fetch functions
  const fetchSchedule = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://api.kodebloom.com/api/timetable/today", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSchedule(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch schedule", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://api.kodebloom.com/api/admin/logs?limit=5", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.logs) {
        setRecentLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://api.kodebloom.com/api/announcements", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        // Show All announcements to Principal
        const relevant = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAnnouncements(relevant);
      }
    } catch (err) {
      console.error("Failed to fetch announcements", err);
    }
  };

  useEffect(() => {
    fetchSchedule();
    fetchLogs();
    fetchAnnouncements();
    fetchStudents();
    fetchTodayAttendance();
    fetchTeachers();
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || (role !== "Principal" && role !== "Admin")) {
      navigate("/select-role");
      return;
    }
  }, [navigate]);
const fetchStudents = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("https://api.kodebloom.com/api/students", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    setStudents(data);
  } catch (err) {
    console.error("Failed to fetch students", err);
  }
};
useEffect(() => {
  fetchStudents();
}, []);

const fetchTodayAttendance = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const token = localStorage.getItem("token");

    const res = await fetch(`https://api.kodebloom.com/api/attendance/summary?date=${today}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();

    setAttendanceSummary(data);
  } catch (err) {
    console.error("Failed to fetch attendance summary", err);
  }
};
useEffect(() => {
  fetchTodayAttendance();
}, []);

  // Format time to 12-hour format with AM/PM
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Format date with weekday
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format short date
  const formatShortDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Get day of week
  const getDayOfWeek = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Student data - Updated to match StaffDashboard format
const studentStats = {
  total: attendanceSummary.total,
  present: attendanceSummary.present,
  sick: attendanceSummary.sick,
  leave: attendanceSummary.leave,
  absent: attendanceSummary.absent,
  attendance: attendanceSummary.percentage
};

 useEffect(() => {
  fetchTeachers();
}, []);

const fetchTeachers = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("https://api.kodebloom.com/api/staff", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    setTeachers(data);
  } catch (err) {
    console.error("Failed to fetch teachers", err);
  }
};
  // Teacher data - Updated to match StaffDashboard format
const teacherStats = {
  total: teachers.length,
  present: teachers.filter(t => t.status === "Active").length,
  absent: 0, // future attendance integration
  leave: 0,  // future leave integration
  attendance: teachers.length
    ? ((teachers.filter(t => t.status === "Active").length / teachers.length) * 100).toFixed(1)
    : 0
};


  // Determine class status based on current time
  const getClassStatus = (startTime, endTime) => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    if (currentTotalMinutes < startTotalMinutes - 5) {
      return { status: 'upcoming', label: 'Upcoming', color: 'gray' };
    } else if (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes) {
      return { status: 'ongoing', label: 'In Progress', color: 'blue' };
    } else if (currentTotalMinutes > endTotalMinutes && currentTotalMinutes <= endTotalMinutes + 15) {
      return { status: 'justended', label: 'Just Ended', color: 'yellow' };
    } else if (currentTotalMinutes > endTotalMinutes + 15) {
      return { status: 'completed', label: 'Completed', color: 'green' };
    } else {
      return { status: 'startingsoon', label: 'Starting Soon', color: 'orange' };
    }
  };

  // Handle search
  const handleSearch = (e) => {
  e.preventDefault();
  if (!searchQuery.trim()) return;

  navigate("/principal/students", {
    state: { search: searchQuery }
  });

  setSearchQuery("");
};


  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <div className="w-64 bg-blue-900 text-white">
        <PrincipalSidebar />
      </div>

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1">

        {/* HEADER */}
        <Header />

        {/* CONTENT */}
        <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">

          {/* PAGE HEADER WITH LIVE TIME AND SEARCH - Updated to match StaffDashboard */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Principal Dashboard</h1>
              <p className="text-gray-600 mt-1">{getGreeting()}, Principal</p>
            </div>
            
            {/* SEARCH AND TIME CONTAINER - Updated layout */}
            <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0">
              {/* SEARCH BAR - Updated to match StaffDashboard */}
              <div className="w-full md:w-auto">
                <form onSubmit={handleSearch} className="relative">
                  <div className="flex items-center">
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700 border-r-0 h-[42px]"
                    >
                      <option value="student">Students</option>
                      <option value="teacher">Teachers</option>
                    </select>
                    <input
                      type="text"
                      placeholder={searchType === 'student' ? "Search students..." : "Search teachers..."}
                      className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64 h-[42px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-[42px]"
                      title="Search"
                    >
                      <FaSearch className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
              
              
                  
                
              
            </div>
          </div>

          {/* FLASH NEWS - Updated to match StaffDashboard */}
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded mb-6 hover:bg-yellow-200 transition-colors duration-200 cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-yellow-800 flex items-center">
                  <span className="mr-2">📢</span> Flash News - {formatShortDate(currentTime)}
                </h2>
                <marquee className="text-sm text-yellow-700 mt-1">
                  {announcements.length > 0 
                    ? announcements.map(a => `${a.title}: ${a.message} | `).join('') 
                    : "No new announcements for today | "}
                  Live time: {formatTime(currentTime)} | Today is {getDayOfWeek(currentTime)}
                </marquee>
              </div>
              <div className="text-xs text-yellow-700 bg-yellow-200 px-2 py-1 rounded">
                Updated Just Now
              </div>
            </div>
          </div>

          {/* STUDENTS OVERVIEW CARDS - Updated to match StaffDashboard format */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FaUserGraduate className="text-xl text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Students Overview</h2>
            </div>
            
            {/* UPDATED CARDS LAYOUT to match StaffDashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {/* Total Students */}
              <div onClick={() => navigate("/principal/students")} className="bg-white p-5 rounded shadow border-l-4 border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div  className="flex justify-between items-start">
                  <p className="text-sm text-gray-500">Total Students</p>
                  <span className="text-xs text-gray-400">As of {formatTime(currentTime)}</span>
                </div>
                <h3 className="text-2xl font-bold mt-1">{studentStats.total}</h3>
                <div className="mt-2 text-xs text-gray-400">
                  Across all classes
                </div>
              </div>

              {/* Present Today */}
              <div className="bg-white p-5 rounded shadow border-l-4 border-green-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-gray-500">Present Today</p>
                  <span className="text-xs text-gray-400">Updated Now</span>
                </div>
                <h3 className="text-2xl font-bold mt-1 text-green-600">{studentStats.present}</h3>
                <div className="mt-2 text-xs text-gray-400">
                  Students attended today
                </div>
              </div>

              {/* Absent Today */}
              <div className="bg-white p-5 rounded shadow border-l-4 border-red-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-gray-500">Absent Today</p>
                  <span className="text-xs text-gray-400">Live Count</span>
                </div>
                <h3 className="text-2xl font-bold mt-1 text-red-600">{studentStats.absent}</h3>
                <div className="mt-2 text-xs text-gray-400">
                  Students absent today
                </div>
              </div>

              {/* Classes Today */}
              <div className="bg-white p-5 rounded shadow border-l-4 border-yellow-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-gray-500">Classes Today</p>
                  <span className="text-xs text-gray-400">{schedule.length} sessions</span>
                </div>
                <h3 className="text-2xl font-bold mt-1">{schedule.length}</h3>
                <div className="mt-2 text-xs text-gray-400">
                  Scheduled for today
                </div>
              </div>

              {/* Attendance Percentage */}
              <div className="bg-white p-5 rounded shadow border-l-4 border-amber-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-gray-500">Attendance %</p>
                  <span className="text-xs text-gray-400">Live</span>
                </div>
                <h3 className="text-2xl font-bold mt-1">{studentStats.attendance}%</h3>
                <div className="mt-2 text-xs text-gray-400">
                  Today's attendance rate
                </div>
              </div>
            </div>

            {/* ATTENDANCE SUMMARY WITH TIME - Updated to match StaffDashboard */}
            <div className="mb-8 bg-white rounded shadow p-5 hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">📊 Today's Student Attendance Summary</h2>
                <div className="text-sm text-gray-500">
                  Last updated: {formatTime(currentTime)}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Present</p>
                      <p className="text-2xl font-bold text-green-700">{studentStats.present}</p>
                    </div>
                    <div className="text-green-600 text-2xl animate-pulse">
                      ✓
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Absent</p>
                      <p className="text-2xl font-bold text-red-700">{studentStats.absent}</p>
                    </div>
                    <div className="text-red-600 text-2xl">
                      ✗
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Live Time</p>
                      <p className="text-xl font-bold text-blue-700">{formatTime(currentTime)}</p>
                    </div>
                    <div className="text-blue-600 text-2xl">
                      ⏰
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TEACHERS OVERVIEW CARDS - Updated to match StaffDashboard format */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-600 rounded-lg">
                <FaChalkboardTeacher className="text-xl text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Teachers Overview</h2>
            </div>
            
            {/* UPDATED CARDS LAYOUT to match StaffDashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {/* Total Teachers */}
             <div
  onClick={() => navigate("/principal/staff")}
  className="bg-white p-5 rounded shadow border-l-4 border-purple-500
             hover:shadow-lg hover:-translate-y-1 transition-all duration-300
             cursor-pointer"
>

                <div className="flex justify-between items-start">
                  <p className="text-sm text-gray-500">Total Teachers</p>
                  <span className="text-xs text-gray-400">As of {formatTime(currentTime)}</span>
                </div>
                <h3 className="text-2xl font-bold mt-1">{teacherStats.total}</h3>
                <div className="mt-2 text-xs text-gray-400">
                  All departments
                </div>
              </div>

              {/* Present Today */}
              <div className="bg-white p-5 rounded shadow border-l-4 border-green-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-gray-500">Present Today</p>
                  <span className="text-xs text-gray-400">Updated Now</span>
                </div>
                <h3 className="text-2xl font-bold mt-1 text-green-600">{teacherStats.present}</h3>
                <div className="mt-2 text-xs text-gray-400">
                  Teaching today
                </div>
              </div>

              {/* Absent Teachers */}
              <div className="bg-white p-5 rounded shadow border-l-4 border-red-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-gray-500">Absent Today</p>
                  <span className="text-xs text-gray-400">Live Count</span>
                </div>
                <h3 className="text-2xl font-bold mt-1 text-red-600">{teacherStats.absent}</h3>
                <div className="mt-2 text-xs text-gray-400">
                  Teachers absent today
                </div>
              </div>

              {/* On Leave */}
              <div className="bg-white p-5 rounded shadow border-l-4 border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-gray-500">On Leave</p>
                  <span className="text-xs text-gray-400">Approved leave</span>
                </div>
                <h3 className="text-2xl font-bold mt-1">{teacherStats.leave}</h3>
                <div className="mt-2 text-xs text-gray-400">
                  Leave approved
                </div>
              </div>

              {/* Attendance Percentage */}
              <div className="bg-white p-5 rounded shadow border-l-4 border-amber-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-gray-500">Attendance %</p>
                  <span className="text-xs text-gray-400">Live</span>
                </div>
                <h3 className="text-2xl font-bold mt-1">{teacherStats.attendance}%</h3>
                <div className="mt-2 text-xs text-gray-400">
                  Today's attendance rate
                </div>
              </div>
            </div>

            {/* TEACHER ATTENDANCE SUMMARY - Updated to match StaffDashboard */}
            <div className="mb-8 bg-white rounded shadow p-5 hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">📊 Today's Teacher Attendance Summary</h2>
                <div className="text-sm text-gray-500">
                  Last updated: {formatTime(currentTime)}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Present</p>
                      <p className="text-2xl font-bold text-green-700">{teacherStats.present}</p>
                    </div>
                    <div className="text-green-600 text-2xl animate-pulse">
                      ✓
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Absent</p>
                      <p className="text-2xl font-bold text-red-700">{teacherStats.absent}</p>
                    </div>
                    <div className="text-red-600 text-2xl">
                      ✗
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Attendance %</p>
                      <p className="text-2xl font-bold text-purple-700">{teacherStats.attendance}%</p>
                    </div>
                    <div className="text-purple-600 text-2xl">
                      📊
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TWO COLUMN SECTION - REPLACED WITH TODAY'S SCHEDULE AND RECENT ACTIVITY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* TODAY'S SCHEDULE WITH LIVE STATUS */}
            <div className="bg-white rounded shadow p-5 hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">📅 Today's Schedule</h2>
                <div className="text-sm text-gray-500">
                  {formatDate(currentTime)}
                </div>
              </div>
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                {schedule.length > 0 ? (
                  schedule.map((classItem) => {
                  const startTime = classItem.period.startTime;
                  const endTime = classItem.period.endTime;
                  const status = getClassStatus(startTime, endTime);
                  const statusColors = {
                    upcoming: 'bg-gray-100 text-gray-800',
                    startingsoon: 'bg-orange-100 text-orange-800',
                    ongoing: 'bg-blue-100 text-blue-800',
                    justended: 'bg-yellow-100 text-yellow-800',
                    completed: 'bg-green-100 text-green-800'
                  };
                  
                  return (
                    <li 
                      key={classItem._id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors duration-200 cursor-pointer group"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium group-hover:text-gray-700 transition-colors">
                            {startTime} – {endTime}
                          </span>
                          {status.status === 'ongoing' && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full animate-pulse">
                              LIVE
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                          Class {classItem.className}{classItem.section} ({classItem.subject})
                        </p>
                        <p className="text-xs text-gray-500">{classItem.room} • {classItem.teacher}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full transition-colors ${statusColors[status.status]}`}>
                        {status.label}
                      </span>
                    </li>
                  );
                })
                ) : (
                  <p className="text-center text-gray-500 py-4">No classes scheduled for today.</p>
                )}
              </ul>
              
              {/* LIVE TIME INDICATOR */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-800">Live Status Updates</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Next refresh in <span className="font-bold">{60 - currentTime.getSeconds()}</span>s
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT ACTIVITY WITH TIMESTAMPS */}
            <div className="bg-white rounded shadow p-5 hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">🕒 Recent Activity</h2>
                <div className="text-sm text-gray-500">
                  Updated {formatTime(currentTime)}
                </div>
              </div>
              <ul className="space-y-3">
                {recentLogs.length > 0 ? (
                  recentLogs.map((log) => (
                    <li key={log._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors duration-200 cursor-pointer group">
                      <div className="text-blue-600 mt-1 group-hover:scale-110 transition-transform">
                        {log.action.includes('DELETE') ? '🗑️' : log.action.includes('UPDATE') ? '📝' : '✅'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium group-hover:text-blue-800 transition-colors">
                            {log.action.replace(/_/g, ' ')}
                          </p>
                          <span className="text-xs text-gray-500">{formatTime(new Date(log.createdAt))}</span>
                        </div>
                        <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors truncate">
                          By {log.role} ({log.email})
                        </p>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No recent activity.</p>
                )}
              </ul>
              
              {/* TIME TRACKER */}
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Current Session:</span> {getDayOfWeek(currentTime)} Classes
                  </div>
                  <div className="text-sm font-medium text-gray-800">
                    Day {Math.floor((currentTime.getHours() - 8) / 2) + 1} of 4
                  </div>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-1000"
                    style={{ 
                      width: `${((currentTime.getHours() - 8) / 8) * 100}%`,
                      maxWidth: '100%'
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>8:00 AM</span>
                  <span>Current: {formatTime(currentTime)}</span>
                  <span>4:00 PM</span>
                </div>
              </div>
            </div>

          </div>

          {/* DATE TIME FOOTER - Updated to match StaffDashboard */}
          <div className="mt-8 p-4 bg-gray-800 text-white rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <div className="text-sm text-gray-300">System Status</div>
                <div className="text-lg font-bold">All Systems Operational</div>
                <div className="text-xs text-gray-400 mt-1">
                  Last system check: {formatTime(currentTime)}
                </div>
              </div>
              <div className="mt-4 md:mt-0 text-center md:text-right">
                <div className="text-3xl font-bold tracking-wider">
                  {formatTime(currentTime)}
                </div>
                <div className="text-sm text-gray-300">
                  {formatDate(currentTime)}
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* STUDENT DETAIL MODAL - Keeping for reference */}
      {selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Blurred background */}
          <div className="absolute inset-0 backdrop-blur-md bg-black/30"></div>
          
          <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-blue-600 px-6 py-4 text-white rounded-t-lg flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaUserGraduate />
                Student Details
              </h2>
              <button onClick={() => setSelectedStudent(null)} className="text-white text-2xl hover:text-gray-200">×</button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 flex flex-col items-center">
                  <div className="relative">
                    <img
                      src={selectedStudent.profilePhoto}
                      className="w-48 h-48 rounded-lg border-4 border-white shadow-lg"
                      alt={selectedStudent.name}
                    />
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      ID: {selectedStudent.id}
                    </div>
                  </div>
                  <div className="mt-8 text-center">
                    <h3 className="text-2xl font-bold text-gray-800">{selectedStudent.name}</h3>
                    <p className="text-gray-600">Class {selectedStudent.class}-{selectedStudent.section}</p>
                    <span className={`mt-3 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 justify-center ${getStatusColor(selectedStudent.status)}`}>
                      {getStatusIcon(selectedStudent.status)}
                      {selectedStudent.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-blue-700 mb-2">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Roll Number</label>
                        <p className="font-semibold text-gray-800">{selectedStudent.rollNo}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Student ID</label>
                        <p className="font-semibold text-gray-800">{selectedStudent.id}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Father's Name</label>
                        <p className="font-semibold text-gray-800">{selectedStudent.father}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Mother's Name</label>
                        <p className="font-semibold text-gray-800">{selectedStudent.mother}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500 flex items-center gap-2">
                          <FaIdCard className="text-blue-500" />
                          Aadhar ID
                        </label>
                        <p className="font-semibold text-gray-800">{selectedStudent.aadharId}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                        <p className="font-semibold text-gray-800">{selectedStudent.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Emergency Contact</label>
                        <p className="font-semibold text-gray-800">{selectedStudent.emergency}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500">Address</label>
                        <p className="font-semibold text-gray-800">{selectedStudent.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TEACHER DETAIL MODAL - Keeping for reference */}
      {selectedTeacher && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Blurred background */}
          <div className="absolute inset-0 backdrop-blur-md bg-black/30"></div>
          
          <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-purple-600 px-6 py-4 text-white rounded-t-lg flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaChalkboardTeacher />
                Teacher Details
              </h2>
              <button onClick={() => setSelectedTeacher(null)} className="text-white text-2xl hover:text-gray-200">×</button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 flex flex-col items-center">
                  <div className="relative">
                    <img
                      src={selectedTeacher.profilePhoto}
                      className="w-48 h-48 rounded-lg border-4 border-white shadow-lg"
                      alt={selectedTeacher.name}
                    />
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      ID: {selectedTeacher.teacherId}
                    </div>
                  </div>
                  <div className="mt-8 text-center">
                    <h3 className="text-2xl font-bold text-gray-800">{selectedTeacher.name}</h3>
                    <p className="text-gray-600">{selectedTeacher.subject} Teacher</p>
                    <span className="mt-3 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-2 justify-center">
                      <FaCalendarTimes />
                      ON LEAVE
                    </span>
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-purple-700 mb-2">Professional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Teacher ID</label>
                        <p className="font-semibold text-gray-800">{selectedTeacher.teacherId}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Subject</label>
                        <p className="font-semibold text-gray-800">{selectedTeacher.subject}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500">Classes Assigned</label>
                        <p className="font-semibold text-gray-800">{selectedTeacher.classes}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500 flex items-center gap-2">
                          <FaIdCard className="text-purple-500" />
                          Aadhar ID
                        </label>
                        <p className="font-semibold text-gray-800">{selectedTeacher.aadharId}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">Leave & Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Leave Reason</label>
                        <p className="font-semibold text-gray-800">{selectedTeacher.reason}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                        <p className="font-semibold text-gray-800">{selectedTeacher.phone}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500">Emergency Contact</label>
                        <p className="font-semibold text-gray-800">{selectedTeacher.emergency}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalDashboard;