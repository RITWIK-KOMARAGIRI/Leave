import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BackButton from "../components/BackButton";

import { 
  Search, Calendar, Clock, User, Phone, Mail, MapPin,
  BookOpen, Home, Award, Shield, CheckCircle, XCircle,
  Download, Filter, ChevronDown, ChevronUp, Eye,
  Printer, FileText, History, School, Hash, Users,
  TrendingUp, BarChart, PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';


// Mock leave history data


// Main Component
const StudentLeaveHistory = () => {
  const [students, setStudents] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [showLeaveDetails, setShowLeaveDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

const uniqueClasses = [...new Set(students.map(s => s.class))].filter(Boolean);
const uniqueSections = [...new Set(students.map(s => s.section))].filter(Boolean);

  
const totalStudents = students.length;

const totalLeaves = leaveHistory.length;

const activeLeaves = leaveHistory.filter(
  l => l.status === "active"
).length;

const upcomingLeaves = leaveHistory.filter(
  l => l.status === "upcoming"
).length;

useEffect(() => {
  const fetchStudents = async () => {
    const res = await fetch("https://api.kodebloom.com/api/students");
    const data = await res.json();

    console.log("STUDENTS:", data);

    setStudents(data);
    setFilteredStudents(data); // initial
  };

  fetchStudents();
}, []);

useEffect(() => {
  if (!students.length) return;

  const fetchLeaves = async () => {
    const res = await fetch("/api/leave-request", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    const json = await res.json();

    if (!json.success) return;

    const mapped = json.data.map(l => {
      const student = students.find(
        s => String(s.rollNumber) === String(l.studentId)
      );

      return {
        id: l._id,
        studentId: l.studentId,
        studentName: student?.name || l.studentName,
        rollNo: student?.rollNumber || l.studentId,
        class: student?.class || "-",
        section: student?.section || "-",
        guardianName: student?.fatherName || "Guardian",
        contact: student?.fatherMobile || "-",
        purpose: l.leaveReason,
        departureDate: l.startDate,
        returnDate: l.endDate,
        status: l.status,
        issuedDate: l.createdAt
      };
    });

    setLeaveHistory(mapped);
  };

  fetchLeaves();
}, [students]);
useEffect(() => {
  let data = students;

  if (selectedClass)
    data = data.filter(s => s.class === selectedClass);

  if (selectedSection)
    data = data.filter(s => s.section === selectedSection);

  if (searchTerm)
    data = data.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(s.rollNumber).includes(searchTerm)
    );

  setFilteredStudents(data);
}, [searchTerm, selectedClass, selectedSection, students]);

useEffect(() => {
  let data = leaveHistory;

  if (selectedStudent) {
    data = data.filter(
      l => String(l.studentId) === String(selectedStudent.rollNumber)
    );
  }

  if (statusFilter !== "all") {
    data = data.filter(l => l.status === statusFilter);
  }

  setFilteredLeaves(data);
}, [leaveHistory, selectedStudent, statusFilter]);

  // Filter leaves based on selected student and filters

  // Handle student selection
  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSelectedLeave(null);
    setShowDetails(true);
  };

  // Handle leave selection
  const handleSelectLeave = (leave) => {
    setSelectedLeave(leave);
    setShowLeaveDetails(true);
  };

  // Calculate statistics
  const calculateStats = () => {
    if (!selectedStudent) return null;
    
const studentLeaves = leaveHistory.filter(
  l => String(l.studentId) === String(selectedStudent.rollNo)
);

    const completedLeaves = studentLeaves.filter(l => l.status === 'completed').length;
    const activeLeaves = studentLeaves.filter(l => l.status === 'active').length;
    const upcomingLeaves = studentLeaves.filter(l => l.status === 'upcoming').length;
    const totalLeaves = studentLeaves.length;
    
    // Calculate average leave duration
    let totalDays = 0;
    studentLeaves.forEach(leave => {
      const start = new Date(leave.departureDate);
      const end = new Date(leave.returnDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalDays += diffDays;
    });
    const avgDuration = totalLeaves > 0 ? (totalDays / totalLeaves).toFixed(1) : 0;
    
    // Most common purpose
    const purposeCount = {};
    studentLeaves.forEach(leave => {
      purposeCount[leave.purpose] = (purposeCount[leave.purpose] || 0) + 1;
    });
    const mostCommonPurpose = Object.keys(purposeCount).length > 0 
      ? Object.keys(purposeCount).reduce((a, b) => purposeCount[a] > purposeCount[b] ? a : b)
      : 'N/A';
    
    return {
      totalLeaves,
      completedLeaves,
      activeLeaves,
      upcomingLeaves,
      avgDuration,
      mostCommonPurpose
    };
  };

  const stats = selectedStudent ? calculateStats() : null;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Render Student Details Modal
  const renderStudentDetails = () => {
    if (!selectedStudent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img
                src={selectedStudent.photo}
                alt={selectedStudent.name}
                className="w-16 h-16 rounded-full border-4 border-blue-100"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedStudent.name}</h2>
                <p className="text-gray-600">
                  Class {selectedStudent.class} - {selectedStudent.section} | Roll No: {selectedStudent.rollNo}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDetails(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <XCircle className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="px-6">
              <nav className="flex space-x-8">
                {['overview', 'personal', 'academic', 'medical', 'family', 'leaves'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Basic Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Leaves</p>
                          <p className="text-2xl font-bold text-gray-800">{stats?.totalLeaves || 0}</p>
                        </div>
                        <History className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Completed</p>
                          <p className="text-2xl font-bold text-gray-800">{stats?.completedLeaves || 0}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Active</p>
                          <p className="text-2xl font-bold text-gray-800">{stats?.activeLeaves || 0}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-yellow-500" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Upcoming</p>
                          <p className="text-2xl font-bold text-gray-800">{stats?.upcomingLeaves || 0}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-purple-500" />
                      </div>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-500" />
                        Personal Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date of Birth</span>
                          <span className="font-medium">{formatDate(selectedStudent.dob)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Age</span>
                          <span className="font-medium">{selectedStudent.age} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gender</span>
                          <span className="font-medium">{selectedStudent.gender}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Blood Group</span>
                          <span className="font-medium">{selectedStudent.bloodGroup}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Religion</span>
                          <span className="font-medium">{selectedStudent.religion}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <School className="w-5 h-5 mr-2 text-green-500" />
                        School Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Admission No</span>
                          <span className="font-medium">{selectedStudent.admissionNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date of Joining</span>
                          <span className="font-medium">{formatDate(selectedStudent.dateOfJoining)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Academic Year</span>
                          <span className="font-medium">{selectedStudent.academicYear}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hostel</span>
                          <span className="font-medium">{selectedStudent.hostelWing} - Room {selectedStudent.roomNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">House</span>
                          <span className="font-medium">{selectedStudent.house}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Leaves */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <History className="w-5 h-5 mr-2 text-purple-500" />
                      Recent Leave History
                    </h3>
                    <div className="space-y-3">
                      {filteredLeaves.slice(0, 3).map((leave) => (
                        <div
                          key={leave.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectLeave(leave)}
                        >
                          <div>
                            <div className="font-medium">{leave.purpose}</div>
                            <div className="text-sm text-gray-600">
                              {formatDate(leave.departureDate)} - {formatDate(leave.returnDate)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              leave.status === 'completed' ? 'bg-green-100 text-green-800' :
                              leave.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {leave.status}
                            </span>
                            <Eye className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Stats & Contact */}
                <div className="space-y-6">
                  {/* Leave Stats */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">Leave Statistics</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Average Duration</span>
                          <span className="font-medium">{stats?.avgDuration || 0} days</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.min((stats?.avgDuration || 0) * 20, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Most Common Purpose</span>
                          <span className="font-medium">{stats?.mostCommonPurpose}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-red-500" />
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{selectedStudent.primaryContact}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{selectedStudent.secondaryContact}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{selectedStudent.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-red-600">Emergency: {selectedStudent.emergencyContact}</span>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-orange-500" />
                      Address
                    </h3>
                    <p className="text-sm text-gray-600">{selectedStudent.address}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoCard label="Full Name" value={selectedStudent.name} />
                  <InfoCard label="Admission Number" value={selectedStudent.admissionNo} />
                  <InfoCard label="Date of Birth" value={formatDate(selectedStudent.dob)} />
                  <InfoCard label="Age" value={`${selectedStudent.age} years`} />
                  <InfoCard label="Gender" value={selectedStudent.gender} />
                  <InfoCard label="Blood Group" value={selectedStudent.bloodGroup} />
                  <InfoCard label="Religion" value={selectedStudent.religion} />
                  <InfoCard label="Nationality" value={selectedStudent.nationality} />
                  <InfoCard label="Academic Year" value={selectedStudent.academicYear} />
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-4">Address Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Current Address</h4>
                      <p className="text-gray-600">{selectedStudent.address}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedStudent.city}, {selectedStudent.state} - {selectedStudent.pincode}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Permanent Address</h4>
                      <p className="text-gray-600">{selectedStudent.permanentAddress || selectedStudent.address}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedStudent.city}, {selectedStudent.state} - {selectedStudent.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoCard label="Class" value={selectedStudent.class} />
                  <InfoCard label="Section" value={selectedStudent.section} />
                  <InfoCard label="Roll Number" value={selectedStudent.rollNo} />
                  <InfoCard label="Date of Joining" value={formatDate(selectedStudent.dateOfJoining)} />
                  <InfoCard label="Academic Year" value={selectedStudent.academicYear} />
                  <InfoCard label="Hostel Wing" value={selectedStudent.hostelWing} />
                  <InfoCard label="Room Number" value={selectedStudent.roomNo} />
                  <InfoCard label="House" value={selectedStudent.house} />
                  <InfoCard label="Bus Route" value={selectedStudent.busRoute} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">Academic Performance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Last Year Percentage</span>
                        <span className="font-bold text-green-600">{selectedStudent.lastYearPercentage}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Attendance Percentage</span>
                        <span className="font-bold text-blue-600">{selectedStudent.attendancePercentage}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Disciplinary Record</span>
                        <span className={`font-medium ${
                          selectedStudent.disciplinaryRecord === 'Excellent' ? 'text-green-600' :
                          selectedStudent.disciplinaryRecord === 'Good' ? 'text-blue-600' :
                          'text-yellow-600'
                        }`}>
                          {selectedStudent.disciplinaryRecord}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">Achievements</h3>
                    <div className="space-y-2">
                      {selectedStudent.achievements.split('|').map((achievement, index) => (
                        <div key={index} className="flex items-start">
                          <Award className="w-4 h-4 text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-gray-600">{achievement.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'medical' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">Medical Information</h3>
                    <div className="space-y-4">
                      <InfoCard label="Blood Group" value={selectedStudent.bloodGroup} />
                      <div>
                        <label className="text-sm font-medium text-gray-700">Medical History</label>
                        <p className="text-gray-600 mt-1">{selectedStudent.medicalHistory}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Allergies</label>
                        <p className="text-gray-600 mt-1">{selectedStudent.allergies}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">Doctor & Insurance</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Doctor Name</label>
                        <p className="text-gray-600 mt-1">{selectedStudent.doctorName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Doctor Contact</label>
                        <p className="text-gray-600 mt-1">{selectedStudent.doctorContact}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Insurance Provider</label>
                        <p className="text-gray-600 mt-1">{selectedStudent.insuranceProvider}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Insurance Policy No</label>
                        <p className="text-gray-600 mt-1">{selectedStudent.insurancePolicyNo}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'family' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-500" />
                      Father's Information
                    </h3>
                    <div className="space-y-3">
                      <InfoCard label="Name" value={selectedStudent.fatherName} />
                      <InfoCard label="Occupation" value={selectedStudent.fatherOccupation} />
                      <InfoCard label="Contact Number" value={selectedStudent.fatherContact} />
                      <InfoCard label="Email" value={selectedStudent.fatherEmail} />
                      <InfoCard label="Aadhar Number" value={selectedStudent.fatherAadhar} />
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-pink-500" />
                      Mother's Information
                    </h3>
                    <div className="space-y-3">
                      <InfoCard label="Name" value={selectedStudent.motherName} />
                      <InfoCard label="Occupation" value={selectedStudent.motherOccupation} />
                      <InfoCard label="Contact Number" value={selectedStudent.motherContact} />
                      <InfoCard label="Email" value={selectedStudent.motherEmail} />
                      <InfoCard label="Aadhar Number" value={selectedStudent.motherAadhar} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'leaves' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Leave History</h3>
                  
                  {/* Filters */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="quarter">Last 3 Months</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="active">Active</option>
                      <option value="upcoming">Upcoming</option>
                    </select>
                  </div>

                  {/* Leave List */}
                  <div className="space-y-4">
                    {filteredLeaves.length > 0 ? (
                      filteredLeaves.map((leave) => (
                        <div
                          key={leave.id}
                          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleSelectLeave(leave)}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="mb-4 md:mb-0">
                              <div className="flex items-center space-x-3">
                                <h4 className="font-semibold text-lg text-gray-800">{leave.purpose}</h4>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  leave.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  leave.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {leave.status}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {formatDate(leave.departureDate)} - {formatDate(leave.returnDate)}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {leave.departureTime} to {leave.returnTime}
                                </span>
                                <span>Guardian: {leave.guardianName}</span>
                              </div>
                              {leave.notes && (
                                <p className="text-sm text-gray-600 mt-2">{leave.notes}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Pass ID: {leave.id}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                Issued on {formatDate(leave.issuedDate)} at {leave.issuedTime}
                              </div>
                              <div className="mt-2">
                                <span className={`px-3 py-1 text-xs rounded-full ${
                                  leave.gatePassPrinted 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {leave.gatePassPrinted ? 'Gate Pass Printed' : 'Pending Print'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No leave records found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Last Updated:</span>
              <span className="text-sm font-medium">{formatDate(new Date().toISOString())}</span>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <Printer className="w-4 h-4" />
                <span>Print Profile</span>
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Leave Details Modal
  const renderLeaveDetails = () => {
    if (!selectedLeave) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full">
          {/* Header */}
          <Header/>
          <div className="border-b border-gray-200 p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{selectedLeave.purpose}</h2>
              <p className="text-gray-600">Gate Pass ID: {selectedLeave.id}</p>
            </div>
            <button
              onClick={() => setShowLeaveDetails(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <XCircle className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Student Information</h3>
                  <div className="space-y-2">
                    <InfoRow label="Name" value={selectedLeave.studentName} />
                    <InfoRow label="Class" value={`${selectedLeave.class} - ${selectedLeave.section}`} />
                    <InfoRow label="Roll Number" value={selectedLeave.rollNo} />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Leave Details</h3>
                  <div className="space-y-2">
                    <InfoRow label="Purpose" value={selectedLeave.purpose} />
                    <InfoRow label="Status" value={
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        selectedLeave.status === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedLeave.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedLeave.status}
                      </span>
                    } />
                    <InfoRow label="Gate Pass" value={
                      selectedLeave.gatePassPrinted ? (
                        <span className="text-green-600 font-medium">Printed ✓</span>
                      ) : (
                        <span className="text-yellow-600 font-medium">Pending Print</span>
                      )
                    } />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Dates & Times</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Departure</h4>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{formatDate(selectedLeave.departureDate)}</span>
                        <span className="text-gray-600">{selectedLeave.departureTime}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Return</h4>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{formatDate(selectedLeave.returnDate)}</span>
                        <span className="text-gray-600">{selectedLeave.returnTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Guardian Information</h3>
                  <div className="space-y-2">
                    <InfoRow label="Name" value={selectedLeave.guardianName} />
                    <InfoRow label="Contact" value={selectedLeave.contact} />
                    <InfoRow label="Issued By" value={selectedLeave.issuedBy} />
                    <InfoRow label="Issued On" value={`${formatDate(selectedLeave.issuedDate)} at ${selectedLeave.issuedTime}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedLeave.notes && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Additional Notes</h3>
                <p className="text-yellow-700">{selectedLeave.notes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              View Gate Pass
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Reprint Gate Pass
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Helper Components
  const InfoCard = ({ label, value }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <BackButton to="/staff/dashboard" />
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Leave History</h1>
          <p className="text-gray-600">Track and manage student leave records with detailed analytics</p>
        </header>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Class Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <School className="inline w-4 h-4 mr-2" />
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Classes</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>

            {/* Section Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline w-4 h-4 mr-2" />
                Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sections</option>
                {uniqueSections.map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline w-4 h-4 mr-2" />
                Search Student
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, roll number, or admission number..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-90">Total Students</p>
                <p className="text-3xl font-bold mt-2">{totalStudents}</p>
              </div>
              <Users className="w-12 h-12 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-90">Total Leaves</p>
                <p className="text-3xl font-bold mt-2">{leaveHistory.length}</p>
              </div>
              <History className="w-12 h-12 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-90">Active Leaves</p>
                <p className="text-3xl font-bold mt-2">
                  {leaveHistory.filter(l => l.status === 'active').length}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-90">Upcoming Leaves</p>
                <p className="text-3xl font-bold mt-2">
                  {leaveHistory.filter(l => l.status === 'upcoming').length}
                </p>
              </div>
              <Calendar className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Students List</h2>
            <p className="text-sm text-gray-600">
              {filteredStudents.length} students found
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class & Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave History
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => {
                 const studentLeaves = leaveHistory.filter(
  l => String(l.studentId) === String(student.rollNo)
);

                  const completedLeaves = studentLeaves.filter(l => l.status === 'completed').length;
                  const activeLeaves = studentLeaves.filter(l => l.status === 'active').length;
                  const upcomingLeaves = studentLeaves.filter(l => l.status === 'upcoming').length;

                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={student.photo}
                            alt={student.name}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">Roll No: {student.rollNo}</div>
                            <div className="text-sm text-gray-500">Admission: {student.admissionNo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">Class {student.class} - {student.section}</div>
                        <div className="text-sm text-gray-500">Hostel: {student.hostelWing} - Room {student.roomNo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.primaryContact}</div>
                        <div className="text-sm text-gray-500">{student.fatherName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{studentLeaves.length}</div>
                            <div className="text-xs text-gray-500">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{completedLeaves}</div>
                            <div className="text-xs text-gray-500">Completed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-yellow-600">{activeLeaves}</div>
                            <div className="text-xs text-gray-500">Active</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">{upcomingLeaves}</div>
                            <div className="text-xs text-gray-500">Upcoming</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleSelectStudent(student)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600">No students found</h3>
              <p className="text-gray-500">Try changing your search criteria</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Leave Activity</h2>
          <div className="space-y-4">
            {leaveHistory.slice(0, 5).map((leave) => (
              <div
                key={leave.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    leave.status === 'completed' ? 'bg-green-500' :
                    leave.status === 'active' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div>
                    <div className="font-medium">{leave.studentName}</div>
                    <div className="text-sm text-gray-600">
                      {leave.purpose} • Class {leave.class} - {leave.section}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatDate(leave.departureDate)}</div>
                  <div className="text-xs text-gray-500">{leave.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDetails && renderStudentDetails()}
      {showLeaveDetails && renderLeaveDetails()}
    </div>
  );
};

export default StudentLeaveHistory;