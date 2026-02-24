

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaUserGraduate } from "react-icons/fa";


const StaffDashboard = () => {
  const navigate = useNavigate();
  // Live time and date state
  const [currentTime, setCurrentTime] = useState(new Date());
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendancePercentage: 0
  });
  const [schedule, setSchedule] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Fetch data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const today = new Date().toISOString().split("T")[0];

        // 1. Fetch Dashboard Stats
        const statsRes = await fetch(`https://api.kodebloom.com/api/attendance/summary?date=${today}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsRes.json();
        setDashboardData({
          totalStudents: statsData.total || 0,
          presentToday: statsData.present || 0,
          absentToday: statsData.absent || 0,
          attendancePercentage: statsData.percentage || 0
        });

        // 2. Fetch Schedule (filter by teacher name if available)
        let scheduleUrl = "/api/timetable/today";
        if (user.name) {
          scheduleUrl += `?teacher=${encodeURIComponent(user.name)}`;
        }
        const scheduleRes = await fetch(scheduleUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const scheduleData = await scheduleRes.json();
        if (scheduleData.success) {
          setSchedule(scheduleData.data);
        }

        // 3. Fetch Announcements
        const annRes = await fetch("/api/announcements", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const annData = await annRes.json();
        // Show All announcements or targeted ones
        const relevantAnnouncements = annData.filter(a => 
          a.targetAudience === 'Staff' || a.targetAudience === 'All'
        );
        // Ensure at least some data is shown if available
        setAnnouncements(relevantAnnouncements.length > 0 ? relevantAnnouncements : annData);

      } catch (err) {
        console.error("Staff dashboard fetch error", err);
      }
    };

    fetchAllData();
  }, []);


  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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

  // Format short date for schedule
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

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate("/staff/students", {
        state: { search: searchQuery }
      });
      setSearchQuery('');
    }
  };


  // Sample schedule data with live time status
  const scheduleData = [
    {
      id: 1,
      startTime: "09:00",
      endTime: "10:00",
      className: "Class 8A",
      subject: "Mathematics",
      room: "Room 101"
    },
    {
      id: 2,
      startTime: "10:00",
      endTime: "11:00",
      className: "Class 9B",
      subject: "Mathematics",
      room: "Room 102"
    },
    {
      id: 3,
      startTime: "11:30",
      endTime: "12:30",
      className: "Class 10A",
      subject: "Mathematics",
      room: "Room 103"
    },
    {
      id: 4,
      startTime: "14:00",
      endTime: "15:00",
      className: "Class 7C",
      subject: "Mathematics",
      room: "Room 104"
    },
    {
      id: 5,
      startTime: "15:30",
      endTime: "16:30",
      className: "Class 11B",
      subject: "Physics",
      room: "Lab 1"
    }
  ];

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

  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <div className="w-64 bg-blue-900 text-white">
        <Sidebar />
      </div>

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1">

        {/* HEADER */}
        <Header />

        {/* CONTENT */}
        <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">

          {/* PAGE HEADER WITH LIVE TIME AND SEARCH */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Staff Dashboard</h1>
              <p className="text-gray-600 mt-1">{getGreeting()}, Welcome back!</p>
            </div>
            
            {/* SEARCH AND TIME CONTAINER */}
            <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0">
              {/* SEARCH BAR */}
              <div className="w-full md:w-auto">
                <form onSubmit={handleSearch} className="relative">
                  <div className="flex items-center">
                    <input
                      type="text"
                      placeholder="Search students, classes..."
                      className="px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      title="Search"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
              
             
            </div>
          </div>

          {/* FLASH NEWS WITH DATE */}
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded mb-6 hover:bg-yellow-200 transition-colors duration-200 cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-yellow-800 flex items-center">
                  <span className="mr-2">📢</span> Flash News - {formatShortDate(currentTime)}
                </h2>
                <marquee className="text-sm text-yellow-700 mt-1">
                  {announcements.length > 0 
                    ? announcements.map(a => `${a.title}: ${a.message}`).join(" | ") + " | "
                    : "No new announcements for today. Have a great day! | "
                  }
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
                         </div>
          {/* SUMMARY CARDS WITH TIME CONTEXT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">

            {/* Total Students */}
            <div className="bg-white p-5 rounded shadow border-l-4 border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="flex justify-between items-start">
                <p className="text-sm text-gray-500">Total Students</p>
                <span className="text-xs text-gray-400">As of {formatTime(currentTime)}</span>
              </div>
              <h3 className="text-2xl font-bold mt-1">{dashboardData.totalStudents}</h3>
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
              <h3 className="text-2xl font-bold mt-1 text-green-600">{dashboardData.presentToday}</h3>
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
              <h3 className="text-2xl font-bold mt-1 text-red-600">{dashboardData.absentToday}</h3>
              <div className="mt-2 text-xs text-gray-400">
                Students absent today
              </div>
            </div>

            {/* Classes Assigned */}
            <div className="bg-white p-5 rounded shadow border-l-4 border-purple-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="flex justify-between items-start">
                <p className="text-sm text-gray-500">Classes Today</p>
                <span className="text-xs text-gray-400">{scheduleData.length} sessions</span>
              </div>
              <h3 className="text-2xl font-bold mt-1">{scheduleData.length}</h3>
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
              <h3 className="text-2xl font-bold mt-1">{dashboardData.attendancePercentage}%</h3>
              <div className="mt-2 text-xs text-gray-400">
                Today's attendance rate
              </div>
            </div>

          </div>

          {/* ATTENDANCE SUMMARY WITH TIME */}
          <div className="mb-8 bg-white rounded shadow p-5 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">📊 Today's Attendance Summary</h2>
              <div className="text-sm text-gray-500">
                Last updated: {formatTime(currentTime)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Present</p>
                    <p className="text-2xl font-bold text-green-700">{dashboardData.presentToday}</p>
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
                    <p className="text-2xl font-bold text-red-700">{dashboardData.absentToday}</p>
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

          {/* TWO COLUMN SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* TODAY'S SCHEDULE WITH LIVE STATUS */}
            <div className="bg-white rounded shadow p-5 hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">📅 Today's Schedule</h2>
                <div className="text-sm text-gray-500">
                  {formatDate(currentTime)}
                </div>
              </div>
              <ul className="space-y-3">
                {scheduleData.map((classItem) => {
                  const status = getClassStatus(classItem.startTime, classItem.endTime);
                  const statusColors = {
                    upcoming: 'bg-gray-100 text-gray-800',
                    startingsoon: 'bg-orange-100 text-orange-800',
                    ongoing: 'bg-blue-100 text-blue-800',
                    justended: 'bg-yellow-100 text-yellow-800',
                    completed: 'bg-green-100 text-green-800'
                  };
                  
                  return (
                    <li 
                      key={classItem.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors duration-200 cursor-pointer group"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium group-hover:text-gray-700 transition-colors">
                            {classItem.startTime} – {classItem.endTime}
                          </span>
                          {status.status === 'ongoing' && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full animate-pulse">
                              LIVE
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                          {classItem.className} ({classItem.subject})
                        </p>
                        <p className="text-xs text-gray-500">{classItem.room}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full transition-colors ${statusColors[status.status]}`}>
                        {status.label}
                      </span>
                    </li>
                  );
                })}
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
                <li className="flex items-start gap-3 p-3 bg-green-50 rounded hover:bg-green-100 transition-colors duration-200 cursor-pointer group">
                  <div className="text-green-600 mt-1 group-hover:scale-110 transition-transform">✓</div>
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="font-medium group-hover:text-green-800 transition-colors">Attendance Marked</p>
                      <span className="text-xs text-gray-500">{formatTime(new Date(currentTime.getTime() - 10 * 60000))}</span>
                    </div>
                    <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                      Class 9B - {dashboardData.presentToday} present, {dashboardData.absentToday} absent
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-blue-50 rounded hover:bg-blue-100 transition-colors duration-200 cursor-pointer group">
                  <div className="text-blue-600 mt-1 group-hover:scale-110 transition-transform">📝</div>
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="font-medium group-hover:text-blue-800 transition-colors">Results Updated</p>
                      <span className="text-xs text-gray-500">{formatTime(new Date(currentTime.getTime() - 120 * 60000))}</span>
                    </div>
                    <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                      Class 10 Mathematics exam results uploaded
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-purple-50 rounded hover:bg-purple-100 transition-colors duration-200 cursor-pointer group">
                  <div className="text-purple-600 mt-1 group-hover:scale-110 transition-transform">👨‍🏫</div>
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="font-medium group-hover:text-purple-800 transition-colors">Class Assigned</p>
                      <span className="text-xs text-gray-500">
                        Yesterday, {formatTime(new Date(currentTime.getTime() - 24 * 60 * 60000))}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                      New class 8C assigned for Mathematics
                    </p>
                  </div>
                </li>
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

          {/* DATE TIME FOOTER */}
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
    </div>
  );
};

export default StaffDashboard;