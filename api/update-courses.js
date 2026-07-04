// api/update-courses.js

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Loaded securely in Vercel Cloud environment variables
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 
  const OWNER = 'ahmedsamehgads'; // Your GitHub Username
  const REPO = 'devstorm-tech';
  const FILE_PATH = 'courses.json';

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;
  const newCourseData = req.body.courses;

  try {
    // Step A: Fetch current file's metadata to get the latest SHA string
    const getResponse = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!getResponse.ok) {
      throw new Error(`Failed to fetch file metadata: ${getResponse.statusText}`);
    }

    const fileData = await getResponse.json();
    const fileSha = fileData.sha;

    // Step B: Convert clean JSON payload to standard Base64 encoding
    const jsonString = JSON.stringify(newCourseData, null, 2);
    const contentBase64 = Buffer.from(jsonString).toString('base64');

    // Step C: Push the commit safely via GitHub API
    const putResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Update courses via devStorm Dashboard',
        content: contentBase64,
        sha: fileSha
      })
    });

    if (putResponse.ok) {
      return res.status(200).json({ success: true, message: 'GitHub repository updated successfully!' });
    } else {
      const errorData = await putResponse.json();
      return res.status(500).json({ success: false, error: errorData });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}