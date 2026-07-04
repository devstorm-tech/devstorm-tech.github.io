import React, { useState, useEffect, useRef } from 'react';
import './Compiler.css';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const Compiler = () => {
  // VS Code-like state
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [explorerVisible, setExplorerVisible] = useState(true);
  const [terminalVisible, setTerminalVisible] = useState(true);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [theme, setTheme] = useState('dark'); // 'dark', 'light', 'high-contrast'

  // Resize states
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingTerminal, setIsResizingTerminal] = useState(false);

  // Wandbox specific state
  const [availableCompilers, setAvailableCompilers] = useState([]);
  const [selectedCompiler, setSelectedCompiler] = useState('');
  const [compilerOptions, setCompilerOptions] = useState('');
  const [stdin, setStdin] = useState('');
  const [compilerLoading, setCompilerLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('');

  // Refs
  const terminalRef = useRef(null);
  const mainContainerRef = useRef(null);
  const editorAreaRef = useRef(null);
  const sidebarRef = useRef(null);
  const panelRef = useRef(null);
  const containerRef = useRef(null); // overall container

  // --- Compiler detection logic (unchanged) ---
  const getCompilerForExtension = (extension, availableCompilersList) => {
    if (!availableCompilersList || availableCompilersList.length === 0) return null;

    const extMap = {
      'py': { 
        search: ['cpython', 'python3', 'python'], 
        fallback: 'python',
        exactMatch: false 
      },
      'cpp': { 
        search: ['g++', 'gcc', 'clang++', 'clang'], 
        fallback: 'cpp',
        exactMatch: true,
        prefer: 'g++'
      },
      'c': { 
        search: ['gcc', 'clang'], 
        fallback: 'c',
        exactMatch: true,
        prefer: 'gcc'
      },
      'js': { 
        search: ['nodejs', 'node'], 
        fallback: 'javascript',
        exactMatch: false 
      },
      'java': { 
        search: ['openjdk', 'java'], 
        fallback: 'java',
        exactMatch: false 
      },
      'php': { 
        search: ['php'], 
        fallback: 'php',
        exactMatch: false 
      },
      'go': { 
        search: ['go'], 
        fallback: 'go',
        exactMatch: false 
      },
      'rs': { 
        search: ['rust'], 
        fallback: 'rust',
        exactMatch: false 
      },
      'rb': { 
        search: ['ruby'], 
        fallback: 'ruby',
        exactMatch: false 
      },
      'cs': { 
        search: ['mono', 'csharp'], 
        fallback: 'csharp',
        exactMatch: false 
      }
    };

    const extInfo = extMap[extension];
    if (!extInfo) return null;

    let compiler = null;

    if (extension === 'py') {
      const pythonCompilers = availableCompilersList.filter(c => 
        c.language.toLowerCase().includes('python') ||
        c.name.toLowerCase().includes('cpython') ||
        c.name.toLowerCase().includes('python')
      );
      
      if (pythonCompilers.length > 0) {
        compiler = pythonCompilers.find(c => 
          c.name.includes('cpython-head') || 
          c.name.includes('cpython-3') ||
          c.name.includes('python3')
        );
        if (!compiler) {
          compiler = pythonCompilers[0];
        }
      }
      
      if (!compiler) {
        for (const searchTerm of extInfo.search) {
          compiler = availableCompilersList.find(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          if (compiler) break;
        }
      }
    } else if (extension === 'cpp' && extInfo.prefer) {
      compiler = availableCompilersList.find(c => 
        c.name.toLowerCase().includes('g++') ||
        c.name.toLowerCase().includes('gpp') ||
        c.name.toLowerCase() === 'g++'
      );
      
      if (!compiler) {
        for (const searchTerm of extInfo.search) {
          compiler = availableCompilersList.find(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          if (compiler) break;
        }
      }
    } else if (extension === 'c' && extInfo.prefer) {
      compiler = availableCompilersList.find(c => 
        c.name.toLowerCase().includes('gcc') ||
        c.name.toLowerCase() === 'gcc'
      );
      
      if (!compiler) {
        for (const searchTerm of extInfo.search) {
          compiler = availableCompilersList.find(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          if (compiler) break;
        }
      }
    } else {
      for (const searchTerm of extInfo.search) {
        compiler = availableCompilersList.find(c => 
          c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (compiler) break;
      }
    }

    if (!compiler) {
      compiler = availableCompilersList.find(c => 
        c.language.toLowerCase().includes(extInfo.fallback.toLowerCase())
      );
    }

    return compiler;
  };

  // --- Default files and initialisation (unchanged) ---
  const defaultFiles = [
    {
      id: 'welcome',
      name: 'welcome.py',
      type: 'py',
      language: 'python',
      content: `# Welcome to DevStorm VS Code Style Compiler!
# This is a Python example
# Click "Run" to execute this code

print("Hello from DevStorm! 🚀")
print("=" * 40)
print("Python Version:", __import__('sys').version)

# Try editing this code
name = "Developer"
print(f"Welcome, {name}!")

# Example of input handling
# Click the "Input" tab below to provide input
try:
    user_input = input("Enter your name: ")
    print(f"Hello, {user_input}!")
except EOFError:
    print("\\nNo input provided. Click the Input tab to add input.")

# List comprehension example
squares = [x**2 for x in range(1, 6)]
print(f"Squares: {squares}")

print("\\n✨ Ready to code!")`
    },
    {
      id: 'example-cpp',
      name: 'example.cpp',
      type: 'cpp',
      language: 'cpp',
      content: `// C++ Example
#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    cout << "Hello from C++!" << endl;
    cout << "=" << string(30, '=') << endl;
    
    vector<string> languages = {"C++", "Python", "JavaScript", "Java"};
    
    cout << "Supported languages:" << endl;
    for (const auto& lang : languages) {
        cout << "  - " << lang << endl;
    }
    
    cout << "\\nEnter a number: ";
    int num;
    cin >> num;
    cout << "You entered: " << num << endl;
    cout << "Square: " << num * num << endl;
    
    return 0;
}`
    },
    {
      id: 'example-js',
      name: 'example.js',
      type: 'js',
      language: 'javascript',
      content: `// JavaScript (Node.js) Example
console.log("Hello from JavaScript!");
console.log("=".repeat(40));

const languages = ["JavaScript", "Python", "C++", "Java"];
console.log("Languages:", languages.join(", "));

// Read input from stdin
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your name: ', (name) => {
    console.log(\`Hello, \${name}! Welcome to DevStorm!\`);
    rl.close();
});`
    },
    {
      id: 'example-html',
      name: 'example.html',
      type: 'html',
      language: 'html',
      content: `<!DOCTYPE html>
<html>
<head>
    <title>DevStorm Web Preview</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #0a0e17, #1a1f2e);
            color: white;
        }
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(255,255,255,0.05);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        h1 {
            color: #00cc88;
            font-size: 3em;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #7dd3fc;
            font-size: 1.2em;
        }
        button {
            background: #0066ff;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 1em;
            cursor: pointer;
            transition: transform 0.2s;
        }
        button:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 DevStorm</h1>
        <p class="subtitle">VS Code Style Compiler</p>
        <p>HTML/CSS/JS Preview</p>
        <button onclick="alert('Hello from JavaScript!')">Click Me</button>
        <p id="output"></p>
    </div>
    <script>
        document.getElementById('output').textContent = '✨ JavaScript is running!';
    </script>
</body>
</html>`
    }
  ];

  useEffect(() => {
    setFiles(defaultFiles);
    setActiveFile(defaultFiles[0].id);
    fetchCompilers();
  }, []);

  const fetchCompilers = async () => {
    try {
      const response = await fetch('https://wandbox.org/api/list.json');
      const data = await response.json();
      setAvailableCompilers(data);
      
      if (activeFile) {
        const file = files.find(f => f.id === activeFile);
        if (file) {
          updateCompilerForFile(file);
        }
      }
    } catch (error) {
      console.error('Failed to fetch compilers:', error);
    }
  };

  const updateCompilerForFile = (file) => {
    if (!file || !availableCompilers.length) return;

    const extension = file.name.split('.').pop().toLowerCase();
    const compiler = getCompilerForExtension(extension, availableCompilers);
    
    if (compiler) {
      setSelectedCompiler(compiler.name);
      setCurrentLanguage(file.language || extension);
      console.log(`✅ Detected compiler for ${file.name}: ${compiler.name} (${compiler.language})`);
    } else {
      const fallbackCompiler = availableCompilers.find(c => 
        c.language.toLowerCase().includes(file.language?.toLowerCase() || '') ||
        c.name.toLowerCase().includes(file.language?.toLowerCase() || '')
      );
      if (fallbackCompiler) {
        setSelectedCompiler(fallbackCompiler.name);
        setCurrentLanguage(file.language || extension);
        console.log(`⚠️ Using fallback compiler for ${file.name}: ${fallbackCompiler.name}`);
      }
    }
  };

  useEffect(() => {
    if (activeFile && availableCompilers.length) {
      const file = files.find(f => f.id === activeFile);
      if (file) {
        updateCompilerForFile(file);
      }
    }
  }, [activeFile, availableCompilers]);

  const getCurrentFile = () => {
    return files.find(f => f.id === activeFile);
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  const getLanguageFromExtension = (ext) => {
    const map = {
      'py': 'python',
      'cpp': 'cpp',
      'c': 'c',
      'js': 'javascript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'java': 'java',
      'php': 'php',
      'go': 'go',
      'rs': 'rust',
      'rb': 'ruby',
      'cs': 'csharp'
    };
    return map[ext] || 'text';
  };

  const createNewFile = () => {
    const name = prompt('Enter file name (with extension):', 'newfile.py');
    if (!name) return;

    const ext = getFileExtension(name);
    const language = getLanguageFromExtension(ext);
    
    const newFile = {
      id: Date.now().toString(),
      name: name,
      type: ext,
      language: language,
      content: getDefaultContent(language, name)
    };

    setFiles([...files, newFile]);
    setActiveFile(newFile.id);
    
    setTimeout(() => {
      updateCompilerForFile(newFile);
    }, 100);
  };

  const getDefaultContent = (language, filename) => {
    const templates = {
      'python': `# ${filename}\n# Python example\n\nprint("Hello from Python!")\n\n# Your code here\n`,
      'cpp': `// ${filename}\n// C++ example\n#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}\n`,
      'c': `/* ${filename} */\n// C example\n#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}\n`,
      'javascript': `// ${filename}\n// JavaScript example\nconsole.log("Hello from JavaScript!");\n\n// Your code here\n`,
      'html': `<!DOCTYPE html>\n<html>\n<head>\n    <title>DevStorm</title>\n</head>\n<body>\n    <h1>Hello DevStorm!</h1>\n</body>\n</html>\n`,
      'java': `// ${filename}\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}\n`,
      'php': `<?php\n// ${filename}\necho "Hello from PHP!\\n";\n?>\n`,
      'go': `// ${filename}\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Go!")\n}\n`,
      'rust': `// ${filename}\nfn main() {\n    println!("Hello from Rust!")\n}\n`,
      'ruby': `# ${filename}\nputs "Hello from Ruby!"\n`,
      'csharp': `// ${filename}\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello from C#!");\n    }\n}\n`
    };
    return templates[language] || `// ${filename}\n// Your code here\n`;
  };

  const deleteFile = (fileId) => {
    if (files.length <= 1) {
      alert('Cannot delete the last file');
      return;
    }
    const file = files.find(f => f.id === fileId);
    if (!window.confirm(`Delete "${file.name}"?`)) return;

    const newFiles = files.filter(f => f.id !== fileId);
    setFiles(newFiles);
    if (activeFile === fileId) {
      setActiveFile(newFiles[0].id);
    }
  };

  const renameFile = (fileId) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const newName = prompt('Enter new name:', file.name);
    if (!newName) return;

    const ext = getFileExtension(newName);
    const language = getLanguageFromExtension(ext);

    const updatedFile = { ...file, name: newName, type: ext, language: language };
    setFiles(files.map(f => 
      f.id === fileId ? updatedFile : f
    ));
    
    setTimeout(() => {
      updateCompilerForFile(updatedFile);
    }, 100);
  };

  const updateFileContent = (fileId, content) => {
    setFiles(files.map(f => 
      f.id === fileId ? { ...f, content } : f
    ));
  };

  const executeCode = async () => {
    const file = getCurrentFile();
    if (!file) return;

    const nonCompilable = ['html', 'css', 'json', 'xml', 'markdown', 'txt'];
    if (nonCompilable.includes(file.type)) {
      setOutput(`⚠️ Preview Mode\n\n${file.content}`);
      return;
    }

    if (!selectedCompiler) {
      setOutput(`❌ No compiler found for "${file.name}"\n\nPlease select a compiler manually.`);
      return;
    }

    setCompilerLoading(true);
    setIsRunning(true);
    setOutput(`⏳ Compiling ${file.name} with ${selectedCompiler}...\n`);

    try {
      let compilerToUse = selectedCompiler;
      
      if (file.type === 'py') {
        const pythonCompilers = availableCompilers.filter(c => 
          c.language.toLowerCase().includes('python') ||
          c.name.toLowerCase().includes('cpython') ||
          c.name.toLowerCase().includes('python')
        );
        
        const preferredCompilers = ['cpython-head', 'cpython-3.12', 'cpython-3.11', 'cpython-3.10'];
        let foundCompiler = pythonCompilers.find(c => 
          preferredCompilers.some(pref => c.name.includes(pref))
        );
        
        if (foundCompiler) {
          compilerToUse = foundCompiler.name;
        } else if (pythonCompilers.length > 0) {
          compilerToUse = pythonCompilers[0].name;
        }
      }

      if (file.type === 'js') {
        const nodeCompilers = availableCompilers.filter(c => 
          c.name.includes('nodejs') || 
          c.name.includes('node') ||
          c.language.toLowerCase().includes('node')
        );
        if (nodeCompilers.length > 0) {
          const preferredNode = nodeCompilers.find(c => 
            c.name.includes('nodejs-head') || 
            c.name.includes('nodejs-')
          );
          compilerToUse = preferredNode ? preferredNode.name : nodeCompilers[0].name;
        }
      }

      const payload = {
        compiler: compilerToUse,
        code: file.content,
        stdin: stdin || '',
        'compiler-option-raw': compilerOptions || ''
      };

      console.log('🚀 Sending payload:', payload);

      const response = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('📦 Wandbox response:', result);

      let outputText = '';
      
      outputText += `📦 ${file.name}\n`;
      outputText += `🔧 Compiler: ${compilerToUse}\n`;
      outputText += `📝 Language: ${file.language || file.type}\n`;
      outputText += `${'='.repeat(50)}\n\n`;

      if (result.compiler_error) {
        outputText += `❌ Compilation Error:\n${result.compiler_error}\n`;
      } 
      else if (result.program_error) {
        if (result.program_error.includes('failed to exec pid1')) {
          outputText += `⚠️ Wandbox Execution Error:\n`;
          outputText += `The Wandbox service might be experiencing issues.\n\n`;
          outputText += `💡 Try these solutions:\n`;
          outputText += `1. Try a different compiler version\n`;
          outputText += `2. Check if your code has any infinite loops\n`;
          outputText += `3. Make sure your code doesn't require external files\n`;
          outputText += `4. Try running a simpler version of your code\n\n`;
          outputText += `🔄 Retrying with a different compiler...\n`;
          
          if (file.type === 'py') {
            const pythonCompilers = availableCompilers.filter(c => 
              c.language.toLowerCase().includes('python') &&
              c.name !== compilerToUse
            );
            
            if (pythonCompilers.length > 0) {
              const retryCompiler = pythonCompilers[0].name;
              outputText += `Retrying with ${retryCompiler}...\n\n`;
              
              const retryPayload = {
                compiler: retryCompiler,
                code: file.content,
                stdin: stdin || '',
                'compiler-option-raw': compilerOptions || ''
              };
              
              const retryResponse = await fetch('https://wandbox.org/api/compile.json', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(retryPayload)
              });
              
              const retryResult = await retryResponse.json();
              
              if (retryResult.program_output) {
                outputText += `✅ Retry Successful!\n\n📤 Output:\n${retryResult.program_output}\n`;
              } else if (retryResult.compiler_error) {
                outputText += `❌ Retry Compilation Error:\n${retryResult.compiler_error}\n`;
              } else if (retryResult.program_error) {
                outputText += `❌ Retry Runtime Error:\n${retryResult.program_error}\n`;
              } else {
                outputText += `❌ Retry also failed. Please try again later.\n`;
              }
            } else {
              outputText += `❌ No alternative Python compilers available.\n`;
            }
          }
        } else {
          outputText += `❌ Runtime Error:\n${result.program_error}\n`;
        }
      } 
      else if (result.signal) {
        outputText += `⚠️ Program terminated with signal: ${result.signal}\n`;
        if (result.program_output) {
          outputText += `\n📤 Output:\n${result.program_output}\n`;
        }
      }
      else {
        if (result.program_output !== undefined && result.program_output !== null) {
          if (result.program_output.trim()) {
            outputText += `📤 Output:\n${result.program_output}\n`;
          } else {
            outputText += `✅ Program executed successfully (no output)\n`;
          }
        } else {
          outputText += `✅ Program executed successfully (no output)\n`;
        }
      }

      outputText += `\n${'='.repeat(50)}\n`;
      outputText += `⏱️ Execution completed at ${new Date().toLocaleTimeString()}\n`;
      
      const hasError = result.compiler_error || result.program_error;
      const hasSignal = result.signal && result.signal !== '0';
      
      if (hasError) {
        outputText += `📊 Status: ❌ Failed\n`;
      } else if (hasSignal) {
        outputText += `📊 Status: ⚠️ Terminated (Signal: ${result.signal})\n`;
      } else {
        outputText += `📊 Status: ✅ Success\n`;
      }
      
      if (result.status !== undefined && result.status !== null) {
        outputText += `💡 Exit Code: ${result.status}\n`;
      }

      setOutput(outputText);

    } catch (error) {
      console.error('❌ Execution error:', error);
      setOutput(`❌ Error: ${error.message}\n\nPlease check your internet connection and try again.`);
    } finally {
      setCompilerLoading(false);
      setIsRunning(false);
    }
  };

  const exportProject = async () => {
    try {
      const zip = new JSZip();
      const projectFolder = zip.folder('devstorm-project');

      files.forEach(file => {
        if (file.content.trim()) {
          projectFolder.file(file.name, file.content);
        }
      });

      const readme = `# DevStorm Project\n\n## Files\n${files.map(f => `- ${f.name} (${f.language})`).join('\n')}\n\n## Instructions\nRun each file with the appropriate compiler.`;
      projectFolder.file('README.md', readme);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      saveAs(zipBlob, `devstorm-project-${timestamp}.zip`);

    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export project');
    }
  };

  const getFileIcon = (filename) => {
    const ext = getFileExtension(filename);
    const icons = {
      'py': 'fab fa-python',
      'js': 'fab fa-js',
      'html': 'fab fa-html5',
      'css': 'fab fa-css3-alt',
      'json': 'fas fa-code',
      'cpp': 'fas fa-cplusplus',
      'c': 'fas fa-c',
      'java': 'fab fa-java',
      'php': 'fab fa-php',
      'go': 'fas fa-code',
      'rs': 'fas fa-code',
      'rb': 'fas fa-code',
      'cs': 'fas fa-code'
    };
    return icons[ext] || 'fas fa-file';
  };

  const getFileColor = (filename) => {
    const ext = getFileExtension(filename);
    const colors = {
      'py': '#3572A5',
      'js': '#F7DF1E',
      'html': '#E34F26',
      'css': '#1572B6',
      'json': '#00AACC',
      'cpp': '#004482',
      'c': '#00599C',
      'java': '#007396',
      'php': '#777BB4',
      'go': '#00ADD8',
      'rs': '#DEA584',
      'rb': '#CC342D',
      'cs': '#178600'
    };
    return colors[ext] || '#ffffff';
  };

  const currentFile = getCurrentFile();

  // --- RESIZE HANDLERS (FIXED) ---
  const startResizeSidebar = (e) => {
    e.preventDefault();
    setIsResizingSidebar(true);
    document.addEventListener('mousemove', onResizeSidebar);
    document.addEventListener('mouseup', stopResizeSidebar);
  };

  const onResizeSidebar = (e) => {
    if (!isResizingSidebar) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left;
    const clamped = Math.min(400, Math.max(150, newWidth));
    setSidebarWidth(clamped);
  };

  const stopResizeSidebar = () => {
    setIsResizingSidebar(false);
    document.removeEventListener('mousemove', onResizeSidebar);
    document.removeEventListener('mouseup', stopResizeSidebar);
  };

  const startResizeTerminal = (e) => {
    e.preventDefault();
    setIsResizingTerminal(true);
    document.addEventListener('mousemove', onResizeTerminal);
    document.addEventListener('mouseup', stopResizeTerminal);
  };

  const onResizeTerminal = (e) => {
    if (!isResizingTerminal) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newHeight = containerRect.bottom - e.clientY;
    const minHeight = 80;
    const maxHeight = containerRect.height * 0.7;
    const clamped = Math.min(maxHeight, Math.max(minHeight, newHeight));
    setTerminalHeight(clamped);
  };

  const stopResizeTerminal = () => {
    setIsResizingTerminal(false);
    document.removeEventListener('mousemove', onResizeTerminal);
    document.removeEventListener('mouseup', stopResizeTerminal);
  };

  // Theme cycling
  const cycleTheme = () => {
    const themes = ['dark', 'light', 'high-contrast'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <div className={`compiler-vscode ${theme}`} ref={containerRef}>
      <div className="vscode-container">
        {/* Title Bar */}
        <div className="vscode-titlebar">
          <div className="titlebar-left">
            <span className="vscode-icon">📁</span>
            <span className="titlebar-text">DevStorm Compiler</span>
          </div>
          <div className="titlebar-center">
            <span className="file-path">
              {currentFile ? `📄 ${currentFile.name}` : 'No file open'}
            </span>
          </div>
          <div className="titlebar-right">
            <button className="titlebar-btn" onClick={cycleTheme} title="Toggle theme (Dark/Light/High Contrast)">
              <i className={`fas fa-${theme === 'dark' ? 'moon' : theme === 'light' ? 'sun' : 'eye'}`}></i>
              <span className="badge">{theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'HC'}</span>
            </button>
            <button className="titlebar-btn" onClick={() => setExplorerVisible(!explorerVisible)}>
              <i className="fas fa-sidebar"></i>
            </button>
            <button className="titlebar-btn" onClick={() => setTerminalVisible(!terminalVisible)}>
              <i className="fas fa-terminal"></i>
            </button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="vscode-main" ref={mainContainerRef}>
          {/* Sidebar */}
          {explorerVisible && (
            <div 
              className="vscode-sidebar" 
              ref={sidebarRef}
              style={{ width: sidebarWidth }}
            >
              <div className="sidebar-header">
                <span>EXPLORER</span>
                <button className="sidebar-btn" onClick={createNewFile}>
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              <div className="sidebar-content">
                <div className="explorer-section">
                  <span className="section-title">📁 WORKSPACE</span>
                  {files.map(file => (
                    <div
                      key={file.id}
                      className={`explorer-item ${activeFile === file.id ? 'active' : ''}`}
                      onClick={() => setActiveFile(file.id)}
                    >
                      <div className="explorer-item-content">
                        <i className={getFileIcon(file.name)} style={{ color: getFileColor(file.name) }}></i>
                        <span className="file-name">{file.name}</span>
                        <span className="file-language">{file.language}</span>
                      </div>
                      <div className="explorer-item-actions">
                        <button
                          className="explorer-action-btn"
                          onClick={(e) => { e.stopPropagation(); renameFile(file.id); }}
                          title="Rename"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="explorer-action-btn delete"
                          onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sidebar resize handle */}
          {explorerVisible && (
            <div 
              className={`sidebar-resize-handle ${isResizingSidebar ? 'active' : ''}`}
              onMouseDown={startResizeSidebar}
              title="Drag to resize sidebar"
            />
          )}

          {/* Editor Area */}
          <div className="vscode-editor-area" ref={editorAreaRef}>
            {/* Editor Tabs */}
            <div className="editor-tabs">
              {files.map(file => (
                <div
                  key={file.id}
                  className={`editor-tab ${activeFile === file.id ? 'active' : ''}`}
                  onClick={() => setActiveFile(file.id)}
                >
                  <i className={getFileIcon(file.name)} style={{ color: getFileColor(file.name) }}></i>
                  <span className="tab-label">{file.name}</span>
                  <button
                    className="tab-close"
                    onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>

            {/* Editor Content */}
            <div className="editor-content">
              {currentFile ? (
                <>
                  <div className="editor-controls">
                    <div className="control-group">
                      <label className="control-label">
                        <i className="fas fa-code"></i> Language:
                        <span className="language-badge">{currentFile.language || currentFile.type}</span>
                      </label>
                    </div>
                    <div className="control-group">
                      <label className="control-label">
                        <i className="fas fa-server"></i> Compiler:
                        <select
                          className="compiler-select"
                          value={selectedCompiler}
                          onChange={(e) => setSelectedCompiler(e.target.value)}
                          disabled={!availableCompilers.length}
                        >
                          <option value="">Select compiler...</option>
                          {availableCompilers.map((compiler, index) => (
                            <option key={index} value={compiler.name}>
                              {compiler.name} ({compiler.language})
                            </option>
                          ))}
                        </select>
                        {selectedCompiler && (
                          <span className="compiler-auto-badge">
                            <i className="fas fa-magic"></i> Auto-detected
                          </span>
                        )}
                      </label>
                    </div>
                    <div className="control-group">
                      <label className="control-label">
                        <i className="fas fa-cog"></i> Options:
                        <input
                          type="text"
                          className="compiler-options-input"
                          value={compilerOptions}
                          onChange={(e) => setCompilerOptions(e.target.value)}
                          placeholder="-O2 -std=c++17"
                        />
                      </label>
                    </div>
                    <div className="control-group-actions">
                      <button
                        className="run-btn"
                        onClick={executeCode}
                        disabled={isRunning || !currentFile}
                      >
                        <i className={`fas fa-${isRunning ? 'spinner fa-spin' : 'play'}`}></i>
                        {isRunning ? 'Running...' : 'Run'}
                      </button>
                      <button
                        className="export-btn"
                        onClick={exportProject}
                        title="Export Project as ZIP"
                      >
                        <i className="fas fa-download"></i>
                      </button>
                      <button
                        className="theme-btn"
                        onClick={cycleTheme}
                        title="Toggle High Contrast"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  </div>

                  <textarea
                    className="editor-textarea"
                    value={currentFile.content}
                    onChange={(e) => updateFileContent(activeFile, e.target.value)}
                    spellCheck="false"
                    style={{ fontSize: `${editorFontSize}px` }}
                    placeholder="Start coding..."
                  />
                </>
              ) : (
                <div className="empty-editor">
                  <i className="fas fa-file"></i>
                  <p>No file open</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Terminal Resize Handle */}
        {terminalVisible && (
          <div 
            className={`terminal-resize-handle ${isResizingTerminal ? 'active' : ''}`}
            onMouseDown={startResizeTerminal}
            title="Drag to resize terminal"
          />
        )}

        {/* Panel (Terminal) */}
        {terminalVisible && (
          <div 
            className="vscode-panel" 
            ref={panelRef}
            style={{ height: terminalHeight }}
          >
            <div className="panel-tabs">
              <button className="panel-tab active">
                <i className="fas fa-terminal"></i> TERMINAL
              </button>
              <button className="panel-tab">
                <i className="fas fa-keyboard"></i> INPUT
              </button>
            </div>
            <div className="panel-content">
              <div className="panel-split">
                {/* Input Section */}
                <div className="panel-input">
                  <div className="input-header">
                    <span><i className="fas fa-keyboard"></i> STDIN</span>
                    <div className="input-actions">
                      <button
                        className="input-action-btn"
                        onClick={() => {
                          const samples = {
                            'py': 'John\n25',
                            'cpp': '42',
                            'c': '42',
                            'js': 'DevStorm',
                            'java': '12345',
                            'php': 'PHP Developer'
                          };
                          const file = getCurrentFile();
                          if (file) {
                            setStdin(samples[file.type] || 'Sample input');
                          }
                        }}
                        title="Load sample input"
                      >
                        <i className="fas fa-file-import"></i>
                      </button>
                      <button
                        className="input-action-btn"
                        onClick={() => setStdin('')}
                        title="Clear input"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                  <textarea
                    className="input-textarea"
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    placeholder="Enter input for your program..."
                    rows={3}
                  />
                </div>

                {/* Output Section */}
                <div className="panel-output">
                  <div className="output-header">
                    <span><i className="fas fa-terminal"></i> OUTPUT</span>
                    <div className="output-actions">
                      <button
                        className="output-action-btn"
                        onClick={() => setOutput('')}
                        title="Clear output"
                      >
                        <i className="fas fa-eraser"></i>
                      </button>
                    </div>
                  </div>
                  <div className="output-content" ref={terminalRef}>
                    <pre className="output-text">
                      {output || '▶️ Press Run (▶) to execute your code'}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compiler;