import React, { useState, useEffect } from 'react';

export default function App() {
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState('Loading course data...');
  const [isSaving, setIsSaving] = useState(false);

  const OWNER = 'ahmedsamehgads'; // Your GitHub Username
  const REPO = 'devstorm-tech';
  const FILE_PATH = 'courses.json';
  const FETCH_URL = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${FILE_PATH}`;

  // Fetch initial data from GitHub raw address instantly on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const response = await fetch(FETCH_URL);
        if (!response.ok) throw new Error('Could not read existing file structure.');
        const data = await response.json();
        setCourses(Array.isArray(data) ? data : []);
        setStatus('Data loaded successfully.');
      } catch (err) {
        setStatus(`Notice: ${err.message}. Ready to create new fields layout.`);
      }
    }
    loadInitialData();
  }, []);

  // Update a single field inside our state array
  const handleInputChange = (index, field, value) => {
    const updated = [...courses];
    updated[index][field] = field === 'lessons' ? (parseInt(value, 10) || 0) : value;
    setCourses(updated);
  };

  // Add a fresh, blank row layout template
  const addNewRow = () => {
    setCourses([...courses, { title: '', duration: '', lessons: 0 }]);
  };

  // Remove targeted row index
  const deleteRow = (index) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  // Send state array to your Vercel serverless function endpoint
  const handleSaveToGithub = async () => {
    // Basic filter to strip out completely unwritten course item rows
    const cleanPayload = courses.filter(c => c.title.trim() !== '');

    if (cleanPayload.length === 0) {
      alert('Please add at least one complete course title before saving.');
      return;
    }

    setIsSaving(true);
    setStatus('Deploying commit modifications via Serverless Endpoint...');

    try {
      const response = await fetch('/api/update-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courses: cleanPayload })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus('Changes successfully committed to GitHub!');
        alert('Success! GitHub repository courses.json updated.');
      } else {
        throw new Error(result.error || 'Serverless endpoint configuration error.');
      }
    } catch (err) {
      setStatus(`Execution error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Inline styling object container mapping dashboard design schema
  const styles = {
    body: { fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#0f172a', color: '#e2e8f0', minHeight: '100vh', padding: '40px 20px' },
    container: { maxWidth: '1000px', margin: '0 auto' },
    header: { color: '#38bdf8', borderBottom: '2px solid #1e293b', paddingBottom: '10px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px', backgroundColor: '#1e293b', borderRadius: '8px', overflow: 'hidden' },
    th: { padding: '12px 15px', textAlign: 'left', backgroundColor: '#0f172a', color: '#38bdf8', borderBottom: '2px solid #334155' },
    td: { padding: '12px 15px', borderBottom: '1px solid #334155' },
    input: { width: '90%', padding: '8px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '4px' },
    actions: { marginTop: '20px', display: 'flex', gap: '10px' },
    btnSave: { padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#10b981', color: 'white' },
    btnAdd: { padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#38bdf8', color: '#0f172a' },
    btnDelete: { padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#ef4444', color: 'white' },
    status: { marginTop: '15px', fontStyle: 'italic', color: '#94a3b8' }
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h1 style={styles.header}>devStorm Core Dashboard</h1>
        <p>Edit course schedules securely. Changes deploy directly to your repository asset tree via serverless operations.</p>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Course Title</th>
              <th style={styles.th}>Duration</th>
              <th style={styles.th}>Lessons Count</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, index) => (
              <tr key={index}>
                <td style={styles.td}>
                  <input 
                    type="text" 
                    style={styles.input} 
                    value={course.title} 
                    placeholder="e.g., Python Advanced"
                    onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                  />
                </td>
                <td style={styles.td}>
                  <input 
                    type="text" 
                    style={styles.input} 
                    value={course.duration} 
                    placeholder="e.g., 6 weeks"
                    onChange={(e) => handleInputChange(index, 'duration', e.target.value)}
                  />
                </td>
                <td style={styles.td}>
                  <input 
                    type="number" 
                    style={styles.input} 
                    value={course.lessons} 
                    placeholder="0"
                    onChange={(e) => handleInputChange(index, 'lessons', e.target.value)}
                  />
                </td>
                <td style={styles.td}>
                  <button style={styles.btnDelete} onClick={() => deleteRow(index)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={styles.actions}>
          <button style={styles.btnAdd} onClick={addNewRow}>+ Add New Course</button>
          <button style={styles.btnSave} onClick={handleSaveToGithub} disabled={isSaving}>
            {isSaving ? 'Saving Changes...' : 'Save Changes to GitHub'}
          </button>
        </div>

        <div style={styles.styles?.status || styles.status}>{status}</div>
      </div>
    </div>
  );
}