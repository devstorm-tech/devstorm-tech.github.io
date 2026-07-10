import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../api/client';
import { createCourse, deleteCourse as deleteCourseRequest, listCourses } from '../api/adminCourses';
import './dashboard.css';

const emptyCourseForm = {
  title: '',
  category: 'Programming',
  description: '',
  price: 0,
  discount_price: '',
  duration: '',
  level: 'Beginner',
  instructor: '',
  lessons: 0,
  students: 0,
  rating: 4.5,
  featured: false,
  topics: '',
};

const emptyUserForm = {
  name: '',
  email: '',
  password: '',
  role: 'student',
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [status, setStatus] = useState('Loading admin data...');
  const [isSaving, setIsSaving] = useState(false);

  const authToken = useMemo(() => localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '', []);

  const apiFetch = async (path, options = {}) => {
    const response = await apiClient.request({
      url: path,
      ...options,
    });
    return response.data;
  };

  const sanitizeCoursePayload = (formValues) => {
    const topicList = String(formValues.topics || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      title: String(formValues.title || '').trim(),
      category: String(formValues.category || '').trim(),
      description: String(formValues.description || '').trim(),
      price: parseFloat(formValues.price ?? 0),
      discount_price: formValues.discount_price === '' || formValues.discount_price === null || formValues.discount_price === undefined
        ? null
        : parseFloat(formValues.discount_price),
      duration: String(formValues.duration || '').trim(),
      level: String(formValues.level || '').trim().toLowerCase(),
      instructor: String(formValues.instructor || '').trim(),
      lessons: parseInt(formValues.lessons ?? 0, 10),
      students: parseInt(formValues.students ?? 0, 10),
      rating: parseFloat(formValues.rating ?? 4.5),
      featured: !!formValues.featured,
      topics: topicList,
    };
  };

  const validateCoursePayload = (payload) => {
    const errors = [];

    if (!payload.title || payload.title.length < 5) {
      errors.push('title: Title must be at least 5 characters');
    }

    if (!payload.description || payload.description.length < 20) {
      errors.push('description: Description must be at least 20 characters');
    }

    if (!['beginner', 'intermediate', 'advanced'].includes(payload.level)) {
      errors.push('level: Level must be one of beginner, intermediate, or advanced');
    }

    if (Number.isNaN(payload.price) || payload.price < 0) {
      errors.push('price: Price must be a non-negative number');
    }

    if (payload.discount_price !== null && (Number.isNaN(payload.discount_price) || payload.discount_price < 0)) {
      errors.push('discount_price: Discount price must be a non-negative number');
    }

    return errors;
  };

  const loadCourses = async () => {
    try {
      const data = await listCourses();
      setCourses(Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
      setStatus('Courses loaded successfully.');
    } catch (error) {
      setStatus(`Could not load courses: ${error.message}`);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await apiFetch('/users');
      setUsers(Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
    } catch (error) {
      setStatus(`Could not load users: ${error.message}`);
    }
  };

  useEffect(() => {
    loadCourses();
    loadUsers();
  }, []);

  const handleCourseInputChange = (field, value) => {
    setCourseForm(prev => ({ ...prev, [field]: value }));
  };

  const handleUserInputChange = (field, value) => {
    setUserForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCourseSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setStatus('Creating course...');

    const sanitizedPayload = sanitizeCoursePayload(courseForm);
    const validationErrors = validateCoursePayload(sanitizedPayload);

    if (validationErrors.length > 0) {
      setIsSaving(false);
      setStatus(validationErrors.join(' • '));
      return;
    }

    try {
      const result = await createCourse(sanitizedPayload);
      setCourses(prev => [result.data || result, ...prev]);
      setCourseForm(emptyCourseForm);
      setStatus('Course created successfully.');
    } catch (error) {
      setStatus(`Course create failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUserSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setStatus('Creating user...');

    try {
      const result = await apiFetch('/users', { method: 'POST', body: JSON.stringify(userForm) });
      setUsers(prev => [result.data || result, ...prev]);
      setUserForm(emptyUserForm);
      setStatus('User created successfully.');
    } catch (error) {
      setStatus(`User create failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCourse = async (id) => {
    try {
      await deleteCourseRequest(id);
      setCourses(prev => prev.filter(course => course._id !== id && course.id !== id));
      setStatus('Course deleted.');
    } catch (error) {
      setStatus(`Course delete failed: ${error.message}`);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="dashboard-header">
          <h1>DevStorm Admin Dashboard</h1>
          <p>Manage users and courses from one place.</p>
        </div>

        <div className="dashboard-tabs">
          <button className={`dashboard-tab ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>Courses Management</button>
          <button className={`dashboard-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users Management</button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'courses' ? (
            <>
              <div className="dashboard-card">
                <h3>Create Course</h3>
                <form onSubmit={handleCourseSubmit}>
                  <div className="dashboard-grid two">
                    <div>
                      <label className="dashboard-label">Title</label>
                      <input className="dashboard-input" value={courseForm.title} onChange={(event) => handleCourseInputChange('title', event.target.value)} required />
                    </div>
                    <div>
                      <label className="dashboard-label">Category</label>
                      <input className="dashboard-input" value={courseForm.category} onChange={(event) => handleCourseInputChange('category', event.target.value)} required />
                    </div>
                    <div>
                      <label className="dashboard-label">Instructor</label>
                      <input className="dashboard-input" value={courseForm.instructor} onChange={(event) => handleCourseInputChange('instructor', event.target.value)} />
                    </div>
                    <div>
                      <label className="dashboard-label">Level</label>
                      <select className="dashboard-select" value={courseForm.level} onChange={(event) => handleCourseInputChange('level', event.target.value)}>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="dashboard-label">Price</label>
                      <input type="number" className="dashboard-input" value={courseForm.price} onChange={(event) => handleCourseInputChange('price', event.target.value)} />
                    </div>
                    <div>
                      <label className="dashboard-label">Discount Price</label>
                      <input type="number" className="dashboard-input" value={courseForm.discount_price} onChange={(event) => handleCourseInputChange('discount_price', event.target.value)} />
                    </div>
                    <div>
                      <label className="dashboard-label">Duration</label>
                      <input className="dashboard-input" value={courseForm.duration} onChange={(event) => handleCourseInputChange('duration', event.target.value)} />
                    </div>
                    <div>
                      <label className="dashboard-label">Lessons</label>
                      <input type="number" className="dashboard-input" value={courseForm.lessons} onChange={(event) => handleCourseInputChange('lessons', event.target.value)} />
                    </div>
                    <div>
                      <label className="dashboard-label">Students</label>
                      <input type="number" className="dashboard-input" value={courseForm.students} onChange={(event) => handleCourseInputChange('students', event.target.value)} />
                    </div>
                    <div>
                      <label className="dashboard-label">Rating</label>
                      <input type="number" step="0.1" className="dashboard-input" value={courseForm.rating} onChange={(event) => handleCourseInputChange('rating', event.target.value)} />
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <label className="dashboard-label">Description</label>
                    <textarea className="dashboard-textarea" value={courseForm.description} onChange={(event) => handleCourseInputChange('description', event.target.value)} required />
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <label className="dashboard-label">Topics (comma separated)</label>
                    <input className="dashboard-input" value={courseForm.topics} onChange={(event) => handleCourseInputChange('topics', event.target.value)} />
                  </div>
                  <div className="dashboard-actions">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" checked={courseForm.featured} onChange={(event) => handleCourseInputChange('featured', event.target.checked)} />
                      Featured
                    </label>
                    <button className="dashboard-btn primary" type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Create Course'}</button>
                  </div>
                </form>
              </div>

              <div className="dashboard-card">
                <h3>Existing Courses</h3>
                {courses.length === 0 ? <div className="dashboard-empty">No courses yet.</div> : (
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Level</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map(course => (
                        <tr key={course._id || course.id}>
                          <td>{course.title}</td>
                          <td>{course.category}</td>
                          <td>{course.level}</td>
                          <td>${Number(course.price || 0).toFixed(2)}</td>
                          <td>
                            <button className="dashboard-btn danger" onClick={() => deleteCourse(course._id || course.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="dashboard-card">
                <h3>Create User</h3>
                <form onSubmit={handleUserSubmit}>
                  <div className="dashboard-grid two">
                    <div>
                      <label className="dashboard-label">Name</label>
                      <input className="dashboard-input" value={userForm.name} onChange={(event) => handleUserInputChange('name', event.target.value)} required />
                    </div>
                    <div>
                      <label className="dashboard-label">Email</label>
                      <input type="email" className="dashboard-input" value={userForm.email} onChange={(event) => handleUserInputChange('email', event.target.value)} required />
                    </div>
                    <div>
                      <label className="dashboard-label">Password</label>
                      <input type="password" className="dashboard-input" value={userForm.password} onChange={(event) => handleUserInputChange('password', event.target.value)} required />
                    </div>
                    <div>
                      <label className="dashboard-label">Role</label>
                      <select className="dashboard-select" value={userForm.role} onChange={(event) => handleUserInputChange('role', event.target.value)}>
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="dashboard-actions">
                    <button className="dashboard-btn primary" type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Create User'}</button>
                  </div>
                </form>
              </div>

              <div className="dashboard-card">
                <h3>Registered Users</h3>
                {users.length === 0 ? <div className="dashboard-empty">No users yet.</div> : (
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user._id || user.id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.role || 'student'}</td>
                          <td>{user.emailVerified ? 'Verified' : 'Pending'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          <div className="dashboard-status">{status}</div>
        </div>
      </div>
    </div>
  );
}