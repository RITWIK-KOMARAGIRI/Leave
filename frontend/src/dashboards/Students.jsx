import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import BackButton from "../components/BackButton";

import { 
  FaSearch, 
  FaUserGraduate, 
  FaVenusMars, 
  FaPhone, 
  FaMapMarkerAlt,
  FaEye,
  FaPrint,
  FaFileExport,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCalendarAlt,
  FaEnvelope,
  FaBirthdayCake,
  FaHome,
  FaHotel,
  FaIdCard,
  FaBriefcase,
  FaUser
} from "react-icons/fa";

export default function Students() {



  
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.search) {
      setSearchText(location.state.search);
       // Trigger fetch immediately when search comes from navigation
       const params = new URLSearchParams();
       params.append("search", location.state.search);
       fetch(`https://api.kodebloom.com/api/students?${params.toString()}`, {
         headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
       })
       .then(res => res.json())
       .then(data => {
         const normalized = data.map(s => ({
           ...s,
           attendance: typeof s.attendance === "string" ? s.attendance : `${s.attendance}%`,
         }));
         setStudentsData(normalized);
         setFilteredStudents(normalized);
       });
    } else {
        fetchStudents();
    }
  }, [location.state]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
const [studentsData, setStudentsData] = useState([]);

  // ================= FORM STATES =================
  const [formData, setFormData] = useState({
    name: "",
    roll: "",
    class: "",
    section: "",
    gender: "Male",
    phone: "",
    email: "",
    address: "",
    dob: "",
    fatherName: "",
    motherName: "",
    attendance: "95",
    fathermobile: "",
    motheroccupation: "",
    fatheroccupation: "",
    fatheraadhar: "",
    motheraadhar: "",
    roomno: "",
    daysschoolarhostel: "schoolar"
  });

  // ================= 

  // ================= DYNAMIC COLORS =================
  const getClassColor = (className) => {
    const colors = {
      "10": "bg-gradient-to-r from-blue-500 to-blue-600",
      "9": "bg-gradient-to-r from-green-500 to-green-600",
      "8": "bg-gradient-to-r from-purple-500 to-purple-600",
      "7": "bg-gradient-to-r from-orange-500 to-orange-600",
      "6": "bg-gradient-to-r from-pink-500 to-pink-600",
    };
    return colors[className] || "bg-gradient-to-r from-gray-500 to-gray-600";
  };

  const getAttendanceColor = (percentage) => {
    const perc = parseInt(percentage);
    if (perc >= 95) return "text-green-600 bg-green-50";
    if (perc >= 85) return "text-blue-600 bg-blue-50";
    if (perc >= 75) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getStudentTypeColor = (type) => {
    return type === "hostel" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700";
  };

  // ================= HANDLERS =================
const handleSearch = () => {
  fetchStudents();
};


const handleReset = () => {
  setSelectedClass("");
  setSelectedSection("");
  setSearchText("");
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddStudent = async () => {
  try {
    const res = await fetch("https://api.kodebloom.com/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.message || "Add failed");
      return;
    }

    await fetchStudents();
    setIsAddModalOpen(false);
    resetForm();
  } catch (err) {
    alert("Server error while adding student");
  }
};

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      roll: student.roll,
      class: student.class,
      section: student.section,
      gender: student.gender,
      phone: student.phone,
      email: student.email,
      address: student.address,
      dob: student.dob,
      fatherName: student.fatherName,
      motherName: student.motherName,
      attendance: student.attendance.replace("%", ""),
      fathermobile: student.fathermobile || "",
      motheroccupation: student.motheroccupation || "",
      fatheroccupation: student.fatheroccupation || "",
      fatheraadhar: student.fatheraadhar || "",
      motheraadhar: student.motheraadhar || "",
      roomno: student.roomno || "",
      daysschoolarhostel: student.daysschoolarhostel || "schoolar"
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async () => {
  try {
    const res = await fetch(
      `https://api.kodebloom.com/api/students/${editingStudent._id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      alert(err.message || "Update failed");
      return;
    }

    await fetchStudents();
    setIsEditModalOpen(false);
    setEditingStudent(null);
    resetForm();
  } catch {
    alert("Server error while updating");
  }
};


const handleDeleteStudent = async (id) => {
  try {
    await fetch(`https://api.kodebloom.com/api/students/${id}`, {
      method: "DELETE",
    });

    await fetchStudents();
    setDeleteConfirm(null);
  } catch {
    alert("Delete failed");
  }
};


  const resetForm = () => {
    setFormData({
      name: "",
      roll: "",
      class: "",
      section: "",
      gender: "Male",
      phone: "",
      email: "",
      address: "",
      dob: "",
      fatherName: "",
      motherName: "",
      attendance: "95",
      fathermobile: "",
      motheroccupation: "",
      fatheroccupation: "",
      fatheraadhar: "",
      motheraadhar: "",
      roomno: "",
      daysschoolarhostel: "schoolar"
    });
  };
  const fetchStudents = async () => {
  try {
    const params = new URLSearchParams();
    if (searchText) params.append("search", searchText);
    if (selectedClass) params.append("class", selectedClass);
    if (selectedSection) params.append("section", selectedSection);

    const res = await fetch(`https://api.kodebloom.com/api/students?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    const data = await res.json();

    const normalized = data.map(s => ({
      ...s,
      attendance: typeof s.attendance === "string"
        ? s.attendance
        : `${s.attendance}%`,
    }));

    setStudentsData(normalized);
    setFilteredStudents(normalized);
  } catch (err) {
    console.error("Failed to fetch students", err);
  }
};

useEffect(() => {
  const timer = setTimeout(() => {
    fetchStudents();
  }, 500);
  return () => clearTimeout(timer);
}, [searchText, selectedClass, selectedSection]);

  const handleExport = () => {
    const dataToExport = filteredStudents.length > 0 ? filteredStudents : studentsData;
    const csvContent = [
      [
        "Roll No", "Name", "Class", "Section", "Gender", "Phone", "Email", "Address", 
        "Attendance", "Date of Birth", "Father Mobile", "Father Occupation", "Mother Occupation",
        "Father Aadhar", "Mother Aadhar", "Room No", "Student Type"
      ],
      ...dataToExport.map(student => [
        student.roll,
        student.name,
        student.class,
        student.section,
        student.gender,
        student.phone,
        student.email,
        student.address,
        student.attendance,
        student.dob,
        student.fathermobile || "",
        student.fatheroccupation || "",
        student.motheroccupation || "",
        student.fatheraadhar || "",
        student.motheraadhar || "",
        student.roomno || "",
        student.daysschoolarhostel === "hostel" ? "Hostel" : "Day Scholar"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  // Get total students count
  const totalStudents = studentsData.length;

  // Get counts by student type
  const hostelStudents = studentsData.filter(s => s.daysschoolarhostel === "hostel").length;
  const dayScholarStudents = studentsData.filter(s => s.daysschoolarhostel === "schoolar").length;

  // Initial load - show all students
  
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <Header/>
      <BackButton to="/staff/dashboard" />
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaUserGraduate className="text-blue-600" />
              Student Management System
            </h1>
            <p className="text-gray-600 mt-2">Manage student records, attendance, and information</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{totalStudents}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Hostel</p>
                <p className="text-2xl font-bold text-purple-600">{hostelStudents}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Day Scholar</p>
                <p className="text-2xl font-bold text-green-600">{dayScholarStudents}</p>
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-3 rounded-lg transition duration-200 flex items-center gap-2"
            >
              <FaPlus />
              Add New Student
            </button>
          </div>
        </div>
      </div>

      {/* ================= SEARCH FILTER CARD ================= */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FaSearch className="text-blue-600" />
            Search & Filter Students
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Reset Filters
            </button>
            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-200 transition flex items-center gap-2"
            >
              <FaFileExport />
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-lg hover:from-gray-100 hover:to-gray-200 transition flex items-center gap-2"
            >
              <FaPrint />
              Print
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Class Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="">All Classes</option>
              {["10", "9", "8", "7", "6"].map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
          </div>

          {/* Section Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="">All Sections</option>
              {["A", "B", "C", "D"].map(sec => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Student</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, roll or email..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
  if (e.key === "Enter") handleSearch();
}}

                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <FaSearch />
              Search Students
            </button>
          </div>
        </div>
      </div>

      {/* ================= RESULTS ================= */}
      {filteredStudents.length > 0 ? (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedClass ? `Class ${selectedClass}` : 'All Classes'}
                  {selectedSection && ` – Section ${selectedSection}`}
                </h2>
                <p className="text-blue-100 mt-1">
                  {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'} found
                </p>
              </div>
              <div className="text-right">
                <p className="text-blue-100">Sorted by Roll Number</p>
              </div>
            </div>
          </div>

          {/* Table View (Default) */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Roll No</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Student Name</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Class & Section</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Gender</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Contact</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Attendance</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Type</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr 
                      key={student._id}
                      className="border-b border-gray-100 hover:bg-blue-50 transition"
                    >
                      <td className="py-4 px-6">
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {student.roll}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900">{student.name}</td>
                      <td className="py-4 px-6">
                        <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {student.class}-{student.section}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${student.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                          <FaVenusMars />
                          {student.gender}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <FaPhone className="text-gray-400 text-sm" />
                            <span className="text-sm">{student.phone}</span>
                          </div>
                          {student.fathermobile && (
                            <div className="flex items-center gap-2">
                              <FaUser className="text-gray-400 text-sm" />
                              <span className="text-sm">{student.fathermobile}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getAttendanceColor(student.attendance)}`}>
                          {student.attendance}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStudentTypeColor(student.daysschoolarhostel)}`}>
                          {student.daysschoolarhostel === "hostel" ? <FaHotel /> : <FaHome />}
                          {student.daysschoolarhostel === "hostel" ? "Hostel" : "Day Scholar"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg flex items-center gap-1 transition"
                            title="View Details"
                          >
                            <FaEye />
                            <span className="text-sm">View</span>
                          </button>
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="px-3 py-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg flex items-center gap-1 transition"
                            title="Edit"
                          >
                            <FaEdit />
                            <span className="text-sm">Edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(student)}
                            className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-1 transition"
                            title="Delete"
                          >
                            <FaTrash />
                            <span className="text-sm">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
          <FaUserGraduate className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No students found</h3>
          <p className="text-gray-500">Try adjusting your search filters or add new students</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-3 rounded-lg transition duration-200 flex items-center gap-2 mx-auto"
          >
            <FaPlus />
            Add New Student
          </button>
        </div>
      )}

      {/* ================= ADD STUDENT MODAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Add New Student</h2>
                  <p className="text-green-100">Enter student details</p>
                </div>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="bg-white/20 hover:bg-white/30 w-8 h-8 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      name="roll"
                      value={formData.roll}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      placeholder="Enter roll number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class *
                    </label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    >
                      <option value="">Select Class</option>
                      {["10", "9", "8", "7", "6"].map(cls => (
                        <option key={cls} value={cls}>Class {cls}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section *
                    </label>
                    <select
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    >
                      <option value="">Select Section</option>
                      {["A", "B", "C", "D"].map(sec => (
                        <option key={sec} value={sec}>Section {sec}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Type *
                    </label>
                    <select
                      name="daysschoolarhostel"
                      value={formData.daysschoolarhostel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    >
                      <option value="schoolar">Day Scholar</option>
                      <option value="hostel">Hostel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room No (if hostel)
                    </label>
                    <input
                      type="text"
                      name="roomno"
                      value={formData.roomno}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      placeholder="Enter room number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition resize-none"
                      placeholder="Enter complete address"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Parent Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Father's Name
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      placeholder="Enter father's name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mother's Name
                    </label>
                    <input
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      placeholder="Enter mother's name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Father's Mobile
                    </label>
                    <input
                      type="tel"
                      name="fathermobile"
                      value={formData.fathermobile}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      placeholder="Enter father's mobile"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Father's Occupation
                    </label>
                    <input
                      type="text"
                      name="fatheroccupation"
                      value={formData.fatheroccupation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      placeholder="Enter father's occupation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mother's Occupation
                    </label>
                    <input
                      type="text"
                      name="motheroccupation"
                      value={formData.motheroccupation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      placeholder="Enter mother's occupation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Father's Aadhar
                    </label>
                    <input
                      type="text"
                      name="fatheraadhar"
                      value={formData.fatheraadhar}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      placeholder="Enter father's Aadhar number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mother's Aadhar
                    </label>
                    <input
                      type="text"
                      name="motheraadhar"
                      value={formData.motheraadhar}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      placeholder="Enter mother's Aadhar number"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attendance (%)
                    </label>
                    <input
                      type="number"
                      name="attendance"
                      value={formData.attendance}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStudent}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition"
                >
                  Add Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT STUDENT MODAL ================= */}
      {isEditModalOpen && editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Edit Student</h2>
                  <p className="text-yellow-100">Update student details</p>
                </div>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingStudent(null);
                    resetForm();
                  }}
                  className="bg-white/20 hover:bg-white/30 w-8 h-8 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Same form structure as Add Modal, but with yellow theme */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      name="roll"
                      value={formData.roll}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class *
                    </label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                    >
                      {["10", "9", "8", "7", "6"].map(cls => (
                        <option key={cls} value={cls}>Class {cls}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section *
                    </label>
                    <select
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                    >
                      {["A", "B", "C", "D"].map(sec => (
                        <option key={sec} value={sec}>Section {sec}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Type *
                    </label>
                    <select
                      name="daysschoolarhostel"
                      value={formData.daysschoolarhostel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                    >
                      <option value="schoolar">Day Scholar</option>
                      <option value="hostel">Hostel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room No (if hostel)
                    </label>
                    <input
                      type="text"
                      name="roomno"
                      value={formData.roomno}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Parent Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Father's Name
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mother's Name
                    </label>
                    <input
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Father's Mobile
                    </label>
                    <input
                      type="tel"
                      name="fathermobile"
                      value={formData.fathermobile}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Father's Occupation
                    </label>
                    <input
                      type="text"
                      name="fatheroccupation"
                      value={formData.fatheroccupation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mother's Occupation
                    </label>
                    <input
                      type="text"
                      name="motheroccupation"
                      value={formData.motheroccupation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Father's Aadhar
                    </label>
                    <input
                      type="text"
                      name="fatheraadhar"
                      value={formData.fatheraadhar}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mother's Aadhar
                    </label>
                    <input
                      type="text"
                      name="motheraadhar"
                      value={formData.motheraadhar}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attendance (%)
                    </label>
                    <input
                      type="number"
                      name="attendance"
                      value={formData.attendance}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingStudent(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStudent}
                  className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition"
                >
                  Update Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STUDENT DETAILS MODAL ================= */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`${getClassColor(selectedStudent.class)} text-white p-6 rounded-t-2xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                  <p className="text-blue-100">Roll No: {selectedStudent.roll} | Class: {selectedStudent.class}-{selectedStudent.section}</p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="bg-white/20 hover:bg-white/30 w-8 h-8 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaUserGraduate className="text-blue-600" />
                      Basic Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
                        <p className="text-lg font-semibold text-gray-900">{selectedStudent.gender}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Student Type</label>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStudentTypeColor(selectedStudent.daysschoolarhostel)}`}>
                          {selectedStudent.daysschoolarhostel === "hostel" ? <FaHotel /> : <FaHome />}
                          {selectedStudent.daysschoolarhostel === "hostel" ? "Hostel Student" : "Day Scholar"}
                        </span>
                      </div>
                      {selectedStudent.roomno && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Room Number</label>
                          <p className="text-lg font-semibold text-gray-900">{selectedStudent.roomno}</p>
                        </div>
                      )}
                      {selectedStudent.dob && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                          <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FaBirthdayCake className="text-gray-400" />
                            {new Date(selectedStudent.dob).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaPhone className="text-green-600" />
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Student Phone</label>
                        <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <FaPhone className="text-gray-400" />
                          {selectedStudent.phone}
                        </p>
                      </div>
                      {selectedStudent.fathermobile && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Father's Mobile</label>
                          <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FaUser className="text-gray-400" />
                            {selectedStudent.fathermobile}
                          </p>
                        </div>
                      )}
                      {selectedStudent.email && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                          <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FaEnvelope className="text-gray-400" />
                            {selectedStudent.email}
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                        <p className="text-lg font-semibold text-gray-900 flex items-start gap-2">
                          <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                          {selectedStudent.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaUser className="text-purple-600" />
                      Parent Information
                    </h3>
                    <div className="space-y-4">
                      {selectedStudent.fatherName && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Father's Name</label>
                          <p className="text-lg font-semibold text-gray-900">{selectedStudent.fatherName}</p>
                        </div>
                      )}
                      {selectedStudent.motherName && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Mother's Name</label>
                          <p className="text-lg font-semibold text-gray-900">{selectedStudent.motherName}</p>
                        </div>
                      )}
                      {selectedStudent.fatheroccupation && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Father's Occupation</label>
                          <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FaBriefcase className="text-gray-400" />
                            {selectedStudent.fatheroccupation}
                          </p>
                        </div>
                      )}
                      {selectedStudent.motheroccupation && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Mother's Occupation</label>
                          <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FaBriefcase className="text-gray-400" />
                            {selectedStudent.motheroccupation}
                          </p>
                        </div>
                      )}
                      {selectedStudent.fatheraadhar && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Father's Aadhar</label>
                          <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FaIdCard className="text-gray-400" />
                            {selectedStudent.fatheraadhar}
                          </p>
                        </div>
                      )}
                      {selectedStudent.motheraadhar && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Mother's Aadhar</label>
                          <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FaIdCard className="text-gray-400" />
                            {selectedStudent.motheraadhar}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaCalendarAlt className="text-red-600" />
                      Academic Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Attendance</label>
                        <p className={`text-3xl font-bold ${getAttendanceColor(selectedStudent.attendance)} px-6 py-3 rounded-xl inline-block`}>
                          {selectedStudent.attendance}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    handleEditStudent(selectedStudent);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Confirm Delete</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <span className="font-semibold">{deleteConfirm.name}</span> (Roll: {deleteConfirm.roll})? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteStudent(deleteConfirm._id)}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition"
                >
                  Delete Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            background: white !important;
          }
          
          .print-header {
            display: block !important;
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
          }
        }
        
        .print-header {
          display: none;
        }
      `}</style>
      
      {/* Print Header (hidden on screen) */}
      <div className="print-header">
        <h1 className="text-2xl font-bold">Student List Report</h1>
        <p className="text-gray-600">Generated on: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}