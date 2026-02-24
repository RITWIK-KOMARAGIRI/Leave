import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaUser, FaGraduationCap, FaPhone, FaEnvelope, FaHome, FaBook, 
  FaUsers, FaCamera, FaCheckCircle, FaSearch, FaEdit, FaTrash, 
  FaEye, FaSort, FaArrowLeft, FaFileAlt, FaUserPlus, FaFilter,
  FaTachometerAlt, FaUserGraduate, FaCalendarAlt, FaUserCircle,
  FaSignOutAlt, FaBullhorn, FaCog, FaBell, FaCaretDown,
  FaSchool, FaIdCard, FaRegCalendar, FaChartBar
} from 'react-icons/fa';

// Import Header and Footer from components
import Header from '../components/Header'; // Adjust path as needed
import Footer from '../components/Footer'; // Adjust path as needed
import BackButton from '../components/BackButton';
const StaffManagement = () => {
  const [activeTab, setActiveTab] = useState('manage');
  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    dob: '',
    qualification: '',
    experience: '',
    gender: 'male',
    phoneNumber: '',
    email: '',
    aadharNumber: '',
    motherName: '',
    currentAddress: '',
    permanentAddress: '',
    subjectSpecialization: '',
    subjectDealing: '',
    assignedClasses: [],
    assignedSections: [],
    teacherType: 'primary',
    employeeId: '',
    emergencyContact: '',
    profilePhoto: null,
    password: ''
  });

  const location = useLocation();
  const [sameAddress, setSameAddress] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Handle search from navigation state
  useEffect(() => {
    if (location.state?.search) {
      setSearchTerm(location.state.search);
      setActiveTab('manage');
    }
  }, [location.state]);

  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({
    specialization: '',
    teacherType: '',
    experience: ''
  });
  const [editingId, setEditingId] = useState(null);


  // Teachers data state
  const [teachers, setTeachers] = useState([]);

  const [filteredTeachers, setFilteredTeachers] = useState([]);

  // Class and section options
  const classOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sectionOptions = ['A', 'B', 'C', 'D', 'E'];
  const subjectOptions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
    'Hindi', 'Social Studies', 'Computer Science', 'Physical Education',
    'Arts', 'Music', 'Economics', 'Business Studies'
  ];
useEffect(() => {
  fetchTeachers();
}, []);

const fetchTeachers = async (query = "") => {
  try {
    const url = query ? `https://api.kodebloom.com/api/staff?search=${encodeURIComponent(query)}` : "https://api.kodebloom.com/api/staff";
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    const data = await res.json();
    setTeachers(data);
  } catch (err) {
    console.error("Failed to fetch teachers", err);
  }
};

  const experienceOptions = ['0-5 years', '5-10 years', '10-15 years', '15+ years'];

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTeachers(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Client-side filtering for other filters (Teacher Type, Experience, etc.)
  useEffect(() => {
    let results = teachers.filter(teacher => {
      const matchesSpecialization = 
        !filters.specialization || teacher.subjectSpecialization === filters.specialization;
      
      const matchesTeacherType =
        !filters.teacherType ||
        teacher.teacherType === filters.teacherType.toLowerCase();

      const matchesExperience =
        !filters.experience ||
        Number(teacher.experience) >= Number(filters.experience.split('-')[0]);

      return matchesSpecialization && matchesTeacherType && matchesExperience;
    });

    if (sortConfig.key) {
      results.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredTeachers(results);
  }, [teachers, filters, sortConfig]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (type, value) => {
    setFormData(prev => {
      const currentArray = prev[type];
      const updatedArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [type]: updatedArray };
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profilePhoto: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSameAddress = () => {
    setSameAddress(!sameAddress);
    if (!sameAddress) {
      setFormData(prev => ({
        ...prev,
        permanentAddress: prev.currentAddress
      }));
    }
  };
  const resetForm = () => {
  setFormData({
    fullName: '',
    fatherName: '',
    dob: '',
    qualification: '',
    experience: '',
    gender: 'male',
    phoneNumber: '',
    email: '',
    aadharNumber: '',
    motherName: '',
    currentAddress: '',
    permanentAddress: '',
    subjectSpecialization: '',
    subjectDealing: '',
    assignedClasses: [],
    assignedSections: [],
    teacherType: 'primary',
    employeeId: '',
    emergencyContact: '',
    profilePhoto: null
  });
  setProfilePreview(null);
  setSameAddress(false);
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const url = editingId
      ? `https://api.kodebloom.com/api/staff/${editingId}`
      : "https://api.kodebloom.com/api/staff";

    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Save failed");
    }

    await fetchTeachers();
    setShowSuccess(true);
    setEditingId(null);

    resetForm();

    setTimeout(() => {
      setShowSuccess(false);
      setActiveTab("manage");
    }, 1500);

  } catch (err) {
    console.error(err);
    alert(err.message || "Failed to save teacher");
  }
};


  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDeleteClick = (teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
  };

 const handleDeleteConfirm = async () => {
  try {
    await fetch(`https://api.kodebloom.com/api/staff/${teacherToDelete._id}`, {
      method: "DELETE",
    });

    setShowDeleteModal(false);
    setTeacherToDelete(null);
    fetchTeachers();
  } catch {
    alert("Delete failed");
  }
};


const handleBulkDelete = async () => {
  try {
    await fetch("https://api.kodebloom.com/api/staff/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedTeachers }),
    });

    setSelectedTeachers([]);
    fetchTeachers();
  } catch {
    alert("Bulk delete failed");
  }
};

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTeachers(filteredTeachers.map(t => t._id));
    } else {
      setSelectedTeachers([]);
    }
  };

  const handleSelectTeacher = (id) => {
    setSelectedTeachers(prev =>
      prev.includes(id)
        ? prev.filter(teacherId => teacherId !== id)
        : [...prev, id]
    );
  };

const handleEdit = (teacher) => {
  setEditingId(teacher._id);
  setFormData({ ...teacher });
  setProfilePreview(teacher.profilePhoto || null);
  setActiveTab("create");
};

  const handleView = (teacher) => {
    alert(`Viewing ${teacher.fullName}\nEmployee ID: ${teacher.employeeId}\nSubject: ${teacher.subjectSpecialization}`);
  };

 const clearForm = () => {
  if (window.confirm("Are you sure you want to clear all fields?")) {
    resetForm();
    setEditingId(null);
  }
};


  // Dashboard Stats Component
  const DashboardStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Teachers</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{teachers.length}</h3>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <FaUsers className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Active staff members</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Primary Teachers</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {teachers.filter(t => t.teacherType === 'primary').length}
            </h3>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <FaUser className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Classes 1-5</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Secondary Teachers</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {teachers.filter(t => t.teacherType === 'secondary').length}
            </h3>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg">
            <FaGraduationCap className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Classes 6-12</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Avg. Experience</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {Math.round(teachers.reduce((acc, t) => acc + parseInt(t.experience), 0) / teachers.length) || 0} years
            </h3>
          </div>
          <div className="bg-yellow-100 p-3 rounded-lg">
            <FaChartBar className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Average teaching experience</p>
      </div>
    </div>
  );

  // Render Create Teacher Form
  const renderCreateTeacher = () => (
    <div className="space-y-6">
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 animate-slide-in">
            <FaCheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Teacher added successfully!</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-6">
            <FaUser className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Profile Photo Upload - Takes 1 column */}
            <div className="lg:col-span-1">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-40 h-40 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100">
                    {profilePreview ? (
                      <img 
                        src={profilePreview} 
                        alt="Profile Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaCamera className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                    <FaCamera className="h-5 w-5" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
                <span className="text-sm text-gray-500">Upload Profile Photo</span>
              </div>
            </div>

            {/* Personal Details - Takes 3 columns */}
            <div className="lg:col-span-3 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father's Name *
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter father's name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mother's Name *
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter mother's name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhar Number *
                  </label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleInputChange}
                    required
                    pattern="[0-9]{12}"
                    maxLength="12"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="12-digit Aadhar number"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact and Address Section - Side by side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-6">
              <FaPhone className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Contact Information</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{10}"
                  maxLength="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="10-digit phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email ID *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="teacher@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact *
                </label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{10}"
                  maxLength="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Emergency contact number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Login Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingId} // Required only for new staff
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder={editingId ? "Leave blank to keep current" : "Set login password"}
                />
              </div>
            </div>
          </div>

          {/* Address Information Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FaHome className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Address Information</h2>
              </div>
              <button
                type="button"
                onClick={handleSameAddress}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  sameAddress 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200'
                }`}
              >
                {sameAddress ? '✓ Same Address Applied' : 'Use Same as Current Address'}
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Address *
                </label>
                <textarea
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter current address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permanent Address *
                </label>
                <textarea
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  disabled={sameAddress}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                    sameAddress 
                      ? 'bg-gray-100 border-gray-200 text-gray-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder={sameAddress ? "Same as current address" : "Enter permanent address"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-6">
            <FaGraduationCap className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Professional Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualification *
              </label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="e.g., M.Sc, B.Ed, Ph.D"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience (Years) *
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Years of experience"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Specialization *
              </label>
              <select
                name="subjectSpecialization"
                value={formData.subjectSpecialization}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Select Specialization</option>
                {subjectOptions.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Dealing *
              </label>
              <select
                name="subjectDealing"
                value={formData.subjectDealing}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Select Subject</option>
                {subjectOptions.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teacher Type *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="teacherType"
                    value="primary"
                    checked={formData.teacherType === 'primary'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Primary Teacher</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="teacherType"
                    value="secondary"
                    checked={formData.teacherType === 'secondary'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Secondary Teacher</span>
                </label>
              </div>
            </div>
          </div>

          {/* Assigned Classes and Sections */}
          <div className="mt-8">
            <div className="flex items-center mb-4">
              <FaUsers className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-800">Assigned Classes & Sections</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Classes *
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {classOptions.map(className => (
                    <label key={className} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.assignedClasses.includes(className)}
                        onChange={() => handleCheckboxChange('assignedClasses', className)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Class {className}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Sections *
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {sectionOptions.map(section => (
                    <label key={section} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.assignedSections.includes(section)}
                        onChange={() => handleCheckboxChange('assignedSections', section)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Section {section}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={clearForm}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Clear All
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {formData.employeeId ? 'Update Teacher' : 'Add Teacher'}
          </button>
        </div>
      </form>
    </div>
  );

  // Render Manage Teachers
  const renderManageTeachers = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Filters - Side by side on large screens */}
          <div>
            <select
              value={filters.specialization}
              onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="">All Subjects</option>
              {subjectOptions.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filters.teacherType}
              onChange={(e) => setFilters(prev => ({ ...prev, teacherType: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="">All Types</option>
              <option value="Primary">Primary</option>
              <option value="Secondary">Secondary</option>
            </select>
          </div>
        </div>

        {/* Additional Filters - Now in separate row */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <select
              value={filters.experience}
              onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="">All Experience</option>
              {experienceOptions.map(exp => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setFilters({ specialization: '', teacherType: '', experience: '' })}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Clear Filters
              </button>
              <span className="text-gray-500 text-sm">
                Showing {filteredTeachers.length} of {teachers.length} teachers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTeachers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
             checked={
  filteredTeachers.length > 0 &&
  filteredTeachers.every(t => selectedTeachers.includes(t._id))
}

              onChange={handleSelectAll}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span className="ml-3 text-blue-800 font-medium">
              {selectedTeachers.length} teacher(s) selected
            </span>
          </div>
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition flex items-center"
          >
            <FaTrash className="h-4 w-4 mr-2" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Teachers Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedTeachers.length === filteredTeachers.length && filteredTeachers.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('employeeId')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Employee ID
                    <FaSort className="ml-1 h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('fullName')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Teacher Name
                    <FaSort className="ml-1 h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('subjectSpecialization')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Subject
                    <FaSort className="ml-1 h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('teacherType')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Type
                    <FaSort className="ml-1 h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTeachers.includes(teacher._id)}
                      onChange={() => handleSelectTeacher(teacher._id)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {teacher.employeeId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {teacher.profilePhoto ? (
                            <img
                              src={teacher.profilePhoto}
                              alt={teacher.fullName}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <FaUser className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{teacher.fullName}</div>
                        <div className="text-sm text-gray-500">
                          {teacher.qualification.split(',')[0]}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{teacher.phoneNumber}</div>
                    <div className="text-sm text-gray-500">{teacher.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{teacher.subjectSpecialization}</div>
                    <div className="text-sm text-gray-500">Dealing: {teacher.subjectDealing}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      teacher.teacherType === 'primary' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                    {teacher.teacherType === 'primary' ? 'Primary' : 'Secondary'}

                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      teacher.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {teacher.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleView(teacher)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <FaEye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="Edit"
                      >
                        <FaEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(teacher)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <FaTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTeachers.length === 0 && (
            <div className="text-center py-12">
              <FaUser className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No teachers found</h3>
              <p className="mt-2 text-gray-500">
                {searchTerm || Object.values(filters).some(f => f) 
                  ? 'Try adjusting your search or filters' 
                  : 'No teachers added yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header from external component */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <BackButton />
          {/* Dashboard Stats - Only show in Manage tab */}
          {activeTab === 'manage' && <DashboardStats />}
          
          {/* Header with Tabs */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
                <p className="text-gray-600 mt-2">
                  {activeTab === 'create' 
                    ? 'Add new teachers to the system' 
                    : 'View and manage existing teacher profiles'}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`px-6 py-3 font-medium rounded-lg transition flex items-center ${
                    activeTab === 'create'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaUserPlus className="h-5 w-5 mr-2" />
                  Create New Teacher
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'create'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaFileAlt className="h-5 w-5 mr-2" />
                  Create Teacher
                </button>
                <button
                  onClick={() => setActiveTab('manage')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'manage'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaUserPlus className="h-5 w-5 mr-2" />
                  Manage Teachers ({teachers.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Content based on active tab */}
          <div className="mt-6">
            {activeTab === 'create' ? renderCreateTeacher() : renderManageTeachers()}
          </div>
        </div>
      </main>

      {/* Footer from external component */}
      <Footer />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && teacherToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <FaTrash className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 text-center">
              Delete Teacher
            </h3>
            <p className="mt-2 text-gray-500 text-center">
              Are you sure you want to delete {teacherToDelete.fullName}? This action cannot be undone.
            </p>
            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
              >
                Delete Teacher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
    <style>{`
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
`}</style>

    </div>
  );
};

export default StaffManagement;