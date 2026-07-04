// api/update-courses.js

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 
  const OWNER = 'ahmedsamehgads'; 
  const REPO = 'devstorm-tech';
  const FILE_PATH = 'courses.json';

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;
  const newCourseData = req.body.courses;

  try {
    // Step A: Fetch current file's metadata to get the latest SHA string
    const getResponse = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`, // Swapped to standard Bearer token format
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Vercel-Serverless-Function' // GitHub API strictly requires a User-Agent header
      }
    });
    
    let fileSha = null;

    // If the file exists, grab its SHA hash
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      fileSha = fileData.sha;
    } else if (getResponse.status !== 404) {
      // If it's a failure other than a 404 (Not Found), throw an explicit error
      throw new Error(`GitHub metadata fetch failed with status ${getResponse.status}`);
    }

    // Step B: Convert clean JSON payload to standard Base64 encoding
    const jsonString = JSON.stringify(newCourseData, null, 2);
    const contentBase64 = Buffer.from(jsonString).toString('base64');

    // Step C: Push the commit safely via GitHub API
    const putBody = {
      message: 'Update courses via devStorm Dashboard',
      content: contentBase64
    };

    // If the file already exists, we MUST provide the SHA to overwrite it
    if (fileSha) {
      putBody.sha = fileSha;
    }

    const putResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Serverless-Function'
      },
      body: JSON.stringify(putBody)
    });

    if (putResponse.ok) {
      return res.status(200).json({ success: true, message: 'GitHub repository updated successfully!' });
    } else {
      const errorData = await putResponse.json();
      return res.status(500).json({ success: false, error: errorData.message || errorData });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}