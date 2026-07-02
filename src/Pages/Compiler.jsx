import React, { useState, useEffect, useRef } from 'react';
import './Compiler.css';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const API_BASE_URL = 'http://localhost:8000';

const apiService = {
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  },

  async getLanguages() {
    try {
      const response = await fetch(`${API_BASE_URL}/languages`);
      if (!response.ok) {
        throw new Error('Failed to fetch languages');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      return { languages: [] };
    }
  },

  async executeCode(code, language = 'python', useSandbox = true, inputs = '') {
    try {
      const endpoint = useSandbox ? '/execute/safe' : '/execute';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code, 
          language,
          inputs 
        })
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Code execution error:', error);
      throw error;
    }
  }
};

const Compiler = () => {
  // Languages data structure - ADDED PHP
  const languages = [
    { id: 'html', name: 'HTML', icon: 'fab fa-html5', color: '#e34c26', extension: '.html' },
    { id: 'css', name: 'CSS', icon: 'fab fa-css3-alt', color: '#264de4', extension: '.css' },
    { id: 'js', name: 'JavaScript', icon: 'fab fa-js', color: '#f0db4f', extension: '.js' },
    { id: 'nodejs', name: 'Node.js', icon: 'fab fa-node-js', color: '#68a063', extension: '.js' },
    { id: 'php', name: 'PHP', icon: 'fab fa-php', color: '#777bb4', extension: '.php' }, // ADDED
    { id: 'json', name: 'JSON', icon: 'fas fa-code', color: '#00aaff', extension: '.json' },
    { id: 'xml', name: 'XML', icon: 'fas fa-file-code', color: '#0066ff', extension: '.xml' },
    { id: 'markdown', name: 'Markdown', icon: 'fab fa-markdown', color: '#8a2be2', extension: '.md' },
    { id: 'typescript', name: 'TypeScript', icon: 'fas fa-code', color: '#007acc', extension: '.ts' },
    { id: 'python', name: 'Python', icon: 'fab fa-python', color: '#3572A5', extension: '.py' },
    { id: 'c', name: 'C', icon: 'fas fa-c', color: '#00599c', extension: '.c' },
    { id: 'cpp', name: 'C++', icon: 'fas fa-cplusplus', color: '#004482', extension: '.cpp' },
    { id: 'java', name: 'Java', icon: 'fab fa-java', color: '#007396', extension: '.java' }
  ];

  // File structure with PHP example
  const initialFiles = [
    { 
      id: 'index.html', 
      name: 'index.html', 
      type: 'html',
      content: `<!DOCTYPE html>
<html>
<head>
    <title>Hello DevStorm</title>
</head>
<body>
    <h1 style="color: #0066ff;">Hello DevStorm! 🌟</h1>
    <div id="output"></div>
</body>
</html>`
    },
    { 
      id: 'styles.css', 
      name: 'styles.css', 
      type: 'css',
      content: `/* Hello DevStorm CSS */
body {
    background: linear-gradient(135deg, #0a0e17, #1a1f2e);
    color: white;
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}

h1 {
    color: #00cc88;
    text-shadow: 0 0 10px rgba(0, 204, 136, 0.5);
}

.output-container {
    background: rgba(255, 255, 255, 0.1);
    padding: 20px;
    border-radius: 10px;
    margin-top: 20px;
}`
    },
    { 
      id: 'script.js', 
      name: 'script.js', 
      type: 'js',
      content: `// Hello DevStorm JavaScript (Browser)
console.log("Hello DevStorm from Browser JavaScript! 🚀");

document.addEventListener('DOMContentLoaded', function() {
    const output = document.getElementById('output');
    if (output) {
        output.innerHTML = '<h2 style="color: #f0db4f;">Browser JavaScript is running!</h2>' +
                          '<p>This JavaScript runs in the browser environment.</p>' +
                          '<button onclick="alert(\'Hello from Browser JS!\')">Click Me</button>';
    }
});

if (typeof window !== 'undefined') {
    console.log("Window object available:", window.location.hostname);
}`
    },
    { 
      id: 'server.js', 
      name: 'server.js', 
      type: 'nodejs',
      content: `// Hello DevStorm Node.js (Server-side)
console.log("🎉 Hello DevStorm from Node.js!");
console.log("=".repeat(40));
console.log("Node.js Version:", process.version);
console.log("Platform:", process.platform);
console.log("Current Directory:", process.cwd());
console.log("=".repeat(40));

const fs = require('fs');
const path = require('path');

try {
    const tempFile = path.join(__dirname, 'temp-hello.txt');
    fs.writeFileSync(tempFile, 'Hello from Node.js! Created at: ' + new Date().toISOString());
    console.log("✓ Created temporary file:", tempFile);
    
    const content = fs.readFileSync(tempFile, 'utf8');
    console.log("✓ File content:", content);
    
    fs.unlinkSync(tempFile);
    console.log("✓ Cleaned up temporary file");
} catch (error) {
    console.error("Error with file operations:", error.message);
}

console.log("\\nHTTP Server Example:");
console.log("const http = require('http');");
console.log("http.createServer((req, res) => {");
console.log("  res.writeHead(200, {'Content-Type': 'text/plain'});");
console.log("  res.end('Hello from DevStorm Node.js Server!');");
console.log("}).listen(3000);");`
    },
    // ADDED PHP FILE
    { 
      id: 'index.php', 
      name: 'index.php', 
      type: 'php',
      content: `<?php
/*
 * Hello DevStorm PHP
 * Supports require, include, autoload, and all PHP features!
 */

echo "🎉 Hello DevStorm from PHP!\\n";
echo str_repeat("=", 40) . "\\n";
echo "PHP Version: " . phpversion() . "\\n";
echo "Platform: " . PHP_OS . "\\n";
echo "Server: " . $_SERVER['SERVER_SOFTWARE'] ?? 'CLI' . "\\n";
echo str_repeat("=", 40) . "\\n\\n";

// PHP-specific features
echo "📦 PHP Features Demo:\\n";
echo str_repeat("-", 30) . "\\n";

// Arrays
$colors = ["red" => "#FF0000", "green" => "#00FF00", "blue" => "#0000FF"];
echo "Associative Array: \\n";
print_r($colors);

// Classes and Objects
class HelloDevStorm {
    private $message;
    
    public function __construct($msg) {
        $this->message = $msg;
    }
    
    public function display() {
        return "📢 " . $this->message;
    }
}

$hello = new HelloDevStorm("Welcome to PHP in DevStorm!");
echo "\\nClass/Object: " . $hello->display() . "\\n";

// Require/include example
echo "\\n🔗 File Operations:\\n";
if (file_exists('config.php')) {
    require 'config.php';
    echo "✓ config.php loaded\\n";
} else {
    // Create a sample config file
    file_put_contents('config.php', '<?php\\ndefine("APP_NAME", "DevStormPHP");\\ndefine("VERSION", "1.0.0");\\ndefine("AUTHOR", "DevStorm Team");\\n?>');
    echo "✓ Created sample config.php\\n";
    require 'config.php';
}

echo "\\n📊 Configuration Loaded:\\n";
echo "App Name: " . APP_NAME . "\\n";
echo "Version: " . VERSION . "\\n";

// Input handling
echo "\\n⌨️ Input Example:\\n";
echo "Enter your name: ";
$name = trim(fgets(STDIN));
if ($name) {
    echo "Hello, $name! Welcome to DevStorm PHP!\\n";
} else {
    echo "No input provided. Running demo mode.\\n";
    echo "Try running with input data in the input section!\\n";
}

// Database simulation (PDO-like)
echo "\\n🗄️ Database Simulation:\\n";
$users = [
    ["id" => 1, "name" => "Alice", "email" => "alice@devstorm.com"],
    ["id" => 2, "name" => "Bob", "email" => "bob@devstorm.com"],
    ["id" => 3, "name" => "Charlie", "email" => "charlie@devstorm.com"]
];

echo "Users in system:\\n";
foreach ($users as $user) {
    echo "  👤 {$user['name']} <{$user['email']}>\\n";
}

// Composer/autoload simulation
echo "\\n📦 Composer/Autoload Simulation:\\n";
spl_autoload_register(function ($class) {
    $file = strtolower($class) . '.php';
    if (file_exists($file)) {
        require $file;
        echo "  ✓ Autoloaded: $class\\n";
    }
});

// Create a sample class file
$sampleClass = '<?php\\nclass SampleClass {\\n    public static function hello() {\\n        return "Hello from autoloaded class!";\\n    }\\n}\\n?>';
file_put_contents('sampleclass.php', $sampleClass);

if (class_exists('SampleClass')) {
    echo "  " . SampleClass::hello() . "\\n";
}

// Clean up
if (file_exists('config.php')) {
    unlink('config.php');
    echo "\\n🧹 Cleaned up temporary files\\n";
}

if (file_exists('sampleclass.php')) {
    unlink('sampleclass.php');
}

echo str_repeat("=", 40) . "\\n";
echo "✨ PHP execution completed successfully!\\n";
echo "Features demonstrated:\\n";
echo "  ✓ Classes & Objects\\n";
echo "  ✓ require/include statements\\n";
echo "  ✓ File operations\\n";
echo "  ✓ Input handling\\n";
echo "  ✓ Autoload simulation\\n";
echo "  ✓ Database simulation\\n";
echo str_repeat("=", 40) . "\\n";

// Final message
echo "\\n🚀 Ready to build amazing PHP applications with DevStorm!\\n";

?>`
    },
    { 
      id: 'main.py', 
      name: 'main.py', 
      type: 'python',
      content: `# Hello DevStorm Python
print("🎉 Hello DevStorm from Python!")
print("=" * 40)
print("Python Version:", __import__('sys').version)
print("Platform:", __import__('platform').platform())
print("Current Directory:", __import__('os').getcwd())
print("=" * 40)

try:
    name = input("Enter your name: ")
    print(f"Hello, {name}! Welcome to DevStorm!")
except EOFError:
    print("\\nNo input provided. Running in non-interactive mode.")
    print("Try running with input data in the input section!")

print("\\nPython Features Demo:")
print("-" * 30)

squares = [x**2 for x in range(1, 6)]
print(f"List comprehension: {squares}")

person = {"name": "DevStorm", "language": "Python", "version": "3.x"}
print(f"Dictionary: {person}")

def greet(name):
    return f"Hello, {name} from Python function!"

print(greet("Developer"))

print("=" * 40)
print("✨ Python execution completed successfully!")`
    },
    { 
      id: 'program.c', 
      name: 'program.c', 
      type: 'c',
      content: `/* Hello DevStorm C */
#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("🎉 Hello DevStorm from C!\\n");
    printf("==============================\\n");
    printf("Compiled with GCC C11 Standard\\n");
    
    int number;
    printf("\\nEnter a number: ");
    if (scanf("%d", &number) == 1) {
        printf("You entered: %d\\n", number);
        printf("Square: %d\\n", number * number);
    } else {
        printf("No valid input provided.\\n");
    }
    
    int numbers[5] = {1, 2, 3, 4, 5};
    printf("\\nArray elements: ");
    for(int i = 0; i < 5; i++) {
        printf("%d ", numbers[i]);
    }
    printf("\\n");
    
    printf("==============================\\n");
    printf("Full C language support!\\n");
    return 0;
}`
    },
    { 
      id: 'program.cpp', 
      name: 'program.cpp', 
      type: 'cpp',
      content: `/* Hello DevStorm C++ */
#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    cout << "🎉 Hello DevStorm from C++!" << endl;
    cout << "================================" << endl;
    cout << "Compiled with G++ C++17 Standard" << endl;
    
    vector<string> messages = {"Hello", "from", "C++", "vector!"};
    cout << "\\nVector contents: ";
    for(const auto& msg : messages) {
        cout << msg << " ";
    }
    cout << endl;
    
    string name;
    cout << "\\nEnter your name: ";
    if (getline(cin, name)) {
        cout << "Hello, " << name << "! Welcome to DevStorm C++!" << endl;
    } else {
        cout << "No input provided." << endl;
    }
    
    auto square = [](int x) { return x * x; };
    cout << "\\nLambda function: square(5) = " << square(5) << endl;
    
    cout << "================================" << endl;
    cout << "Full C++ language support!" << endl;
    return 0;
}`
    },
    { 
      id: 'Main.java', 
      name: 'Main.java', 
      type: 'java',
      content: `/* Hello DevStorm Java */
import java.util.Scanner;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        System.out.println("🎉 Hello DevStorm from Java!");
        System.out.println("===============================");
        System.out.println("Compiled with Java JDK");
        System.out.println("Java Version: " + System.getProperty("java.version"));
        
        ArrayList<String> list = new ArrayList<>();
        list.add("Hello");
        list.add("from");
        list.add("Java");
        list.add("ArrayList!");
        
        System.out.println("\\nArrayList contents: " + String.join(" ", list));
        
        Scanner scanner = new Scanner(System.in);
        System.out.print("\\nEnter a number: ");
        
        try {
            if (scanner.hasNextInt()) {
                int number = scanner.nextInt();
                System.out.println("You entered: " + number);
                System.out.println("Square: " + (number * number));
            } else {
                System.out.println("No valid input provided.");
            }
        } catch (Exception e) {
            System.out.println("Input error: " + e.getMessage());
        } finally {
            scanner.close();
        }
        
        System.out.println("\\nMethod call: " + greet("Developer"));
        
        System.out.println("===============================");
        System.out.println("Full Java language support!");
    }
    
    public static String greet(String name) {
        return "Hello, " + name + " from Java method!";
    }
}`
    }
  ];

  const [files, setFiles] = useState(initialFiles);
  const [activeFile, setActiveFile] = useState('index.html');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [srcDoc, setSrcDoc] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState('off');
  const [fontSize, setFontSize] = useState('medium');
  const [editorFontSize, setEditorFontSize] = useState(16);
  const [splitPosition, setSplitPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [codeOutput, setCodeOutput] = useState('');
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [useSandboxMode, setUseSandboxMode] = useState(true);
  const [userInputs, setUserInputs] = useState('');
  const [showInputSection, setShowInputSection] = useState(false);
  const [compilerInfo, setCompilerInfo] = useState({});
  
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('html');
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  
  const splitRef = useRef(null);
  const dropdownRef = useRef(null);
  const codeOutputRef = useRef(null);
  const inputTextareaRef = useRef(null);
  const newFileNameInputRef = useRef(null);

  const getCurrentFile = () => files.find(file => file.id === activeFile);
  const getCurrentFileType = () => getCurrentFile()?.type || 'html';
  const getCurrentFileName = () => getCurrentFile()?.name || '';

  const getCurrentLanguage = () => {
    const fileType = getCurrentFileType();
    return languages.find(lang => lang.id === fileType);
  };

  const isCompilableLanguage = () => {
    const lang = getCurrentFileType();
    return ['python', 'c', 'cpp', 'java', 'nodejs', 'php'].includes(lang); // ADDED php
  };

  const needsCompilation = () => {
    const lang = getCurrentFileType();
    return ['c', 'cpp', 'java'].includes(lang);
  };

  const isJavaScriptType = () => {
    const lang = getCurrentFileType();
    return ['js', 'nodejs'].includes(lang);
  };

  useEffect(() => {
    checkApiHealth();
    fetchCompilerInfo();
  }, []);

  useEffect(() => {
    const htmlFile = files.find(f => f.type === 'html');
    const cssFile = files.find(f => f.type === 'css');
    const jsFile = files.find(f => f.type === 'js');
    
    const timeout = setTimeout(() => {
      const html = htmlFile?.content || '';
      const css = cssFile?.content || '';
      const js = jsFile?.content || '';
      
      setSrcDoc(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>${css}</style>
        </head>
        <body>${html}</body>
        <script>${js}</script>
        </html>
      `);
    }, 250);

    return () => clearTimeout(timeout);
  }, [files]);

  useEffect(() => {
    const body = document.body;
    body.classList.remove('high-contrast-dark', 'high-contrast-light');
    
    if (highContrastMode === 'dark') {
      body.classList.add('high-contrast-dark');
    } else if (highContrastMode === 'light') {
      body.classList.add('high-contrast-light');
    }
  }, [highContrastMode]);

  useEffect(() => {
    const root = document.documentElement;
    switch(fontSize) {
      case 'small':
        root.style.fontSize = '14px';
        break;
      case 'medium':
        root.style.fontSize = '16px';
        break;
      case 'large':
        root.style.fontSize = '18px';
        break;
      case 'xlarge':
        root.style.fontSize = '20px';
        break;
      default:
        root.style.fontSize = '16px';
    }
  }, [fontSize]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const container = splitRef.current;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const relativeX = e.clientX - containerRect.left;
      const percentage = (relativeX / containerRect.width) * 100;
      
      const newPosition = Math.min(Math.max(percentage, 20), 80);
      setSplitPosition(newPosition);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (codeOutputRef.current) {
      codeOutputRef.current.scrollTop = codeOutputRef.current.scrollHeight;
    }
  }, [codeOutput]);

  useEffect(() => {
    const lang = getCurrentFileType();
    if (['python', 'c', 'cpp', 'java', 'nodejs', 'php'].includes(lang)) { // ADDED php
      setShowInputSection(true);
    } else {
      setShowInputSection(false);
    }
  }, [activeFile]);

  useEffect(() => {
    if (showNewFileModal && newFileNameInputRef.current) {
      setTimeout(() => {
        newFileNameInputRef.current?.focus();
      }, 100);
    }
  }, [showNewFileModal]);

  const checkApiHealth = async () => {
    try {
      setApiStatus('checking');
      const isHealthy = await apiService.checkHealth();
      setApiStatus(isHealthy ? 'healthy' : 'unhealthy');
    } catch (error) {
      setApiStatus('offline');
    }
  };

  const fetchCompilerInfo = async () => {
    try {
      const info = await apiService.getLanguages();
      setCompilerInfo(info);
    } catch (error) {
      console.error('Failed to fetch compiler info:', error);
    }
  };

  const handleEditorFontSizeChange = (value) => {
    const size = parseInt(value);
    if (!isNaN(size) && size >= 10 && size <= 30) {
      setEditorFontSize(size);
    }
  };

  const increaseEditorFontSize = () => {
    if (editorFontSize < 30) {
      setEditorFontSize(editorFontSize + 1);
    }
  };

  const decreaseEditorFontSize = () => {
    if (editorFontSize > 10) {
      setEditorFontSize(editorFontSize - 1);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    
    const currentFile = getCurrentFile();
    const currentLang = getCurrentFileType();
    
    if (['python', 'c', 'cpp', 'java', 'php'].includes(currentLang)) { // ADDED php
      await executeCompilableCode();
    } else if (currentLang === 'nodejs') {
      await executeNodeJS();
    } else if (['html', 'css', 'js'].includes(currentLang)) {
      const iframe = document.getElementById('preview-frame');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.location.reload();
      }
    }
    
    setTimeout(() => setIsRunning(false), 1000);
  };

  const executeCompilableCode = async () => {
    setCodeOutput('');
    
    if (apiStatus !== 'healthy') {
      setCodeOutput(`<span class="error">❌ API Connection Error: Cannot connect to execution server.</span>\n<span class="info">Please ensure the FastAPI server is running on port 8000.</span>`);
      setIsRunning(false);
      return;
    }

    try {
      setIsCodeLoading(true);
      
      const currentFile = getCurrentFile();
      const language = currentFile?.type;
      
      const result = await apiService.executeCode(
        currentFile?.content || '',
        language,
        useSandboxMode, 
        userInputs
      );
      
      let formattedOutput = '';
      
      // Language header with PHP special handling
      const langClass = language === 'php' ? 'php-execution' : language;
      formattedOutput += `<div class="language-header ${langClass}">
        <i class="${getCurrentLanguage()?.icon}" style="color: ${getCurrentLanguage()?.color}"></i>
        <span class="language-name">${getCurrentLanguage()?.name} Output</span>
        <span class="language-tag">${language.toUpperCase()}</span>
        ${language === 'php' ? '<span class="php-feature-badge"><i class="fas fa-file-import"></i> Supports require/include</span>' : ''}
      </div>`;
      
      if (userInputs.trim()) {
        formattedOutput += `<div class="input-info">
          <i class="fas fa-keyboard"></i>
          <span>Input Data: ${userInputs.split('\\n').length} line(s) provided</span>
        </div>`;
      }
      
      if (result.success) {
        formattedOutput += `<div class="execution-success">
          <i class="fas fa-check-circle"></i>
          <div>
            <div class="success-title">Execution Successful!</div>
            <div class="success-details">
              <span>Execution ID: ${result.execution_id}</span>
              <span>•</span>
              <span>Mode: ${result.mode || 'standard'}</span>
              <span>•</span>
              <span>${new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>`;
        
        // PHP specific features info
        if (language === 'php' && result.php_features) {
          formattedOutput += `<div class="php-features-info">
            <i class="fab fa-php"></i>
            <span>PHP Features: Includes processed, safe execution enabled</span>
          </div>`;
        }
        
        if (result.stdout) {
          formattedOutput += `<div class="output-section">
            <div class="section-header">
              <i class="fas fa-terminal"></i>
              <span>Output</span>
            </div>
            <div class="output-content ${language}">
              <pre>${escapeHtml(result.stdout)}</pre>
            </div>
          </div>`;
        }
        
        if (result.stderr) {
          formattedOutput += `<div class="output-section warning">
            <div class="section-header">
              <i class="fas fa-exclamation-triangle"></i>
              <span>Warnings</span>
            </div>
            <div class="output-content warning">
              <pre>${escapeHtml(result.stderr)}</pre>
            </div>
          </div>`;
        }
      } else {
        formattedOutput += `<div class="execution-error">
          <i class="fas fa-times-circle"></i>
          <div>
            <div class="error-title">Execution Failed (Code: ${result.returncode})</div>
            <div class="error-details">
              <span>Execution ID: ${result.execution_id}</span>
              <span>•</span>
              <span>${result.compilation_failed ? 'Compilation Failed' : 'Runtime Error'}</span>
            </div>
          </div>
        </div>`;
        
        if (result.stdout) {
          formattedOutput += `<div class="output-section">
            <div class="section-header">
              <i class="fas fa-terminal"></i>
              <span>Output</span>
            </div>
            <div class="output-content">
              <pre>${escapeHtml(result.stdout)}</pre>
            </div>
          </div>`;
        }
        
        if (result.stderr) {
          formattedOutput += `<div class="output-section error">
            <div class="section-header">
              <i class="fas fa-exclamation-circle"></i>
              <span>Errors</span>
            </div>
            <div class="output-content error">
              <pre>${escapeHtml(result.stderr)}</pre>
            </div>
          </div>`;
        }
      }
      
      setCodeOutput(formattedOutput);
      
    } catch (error) {
      console.error('Code execution error:', error);
      setCodeOutput(`<div class="execution-error">
        <i class="fas fa-times-circle"></i>
        <div>
          <div class="error-title">Execution Error</div>
          <div class="error-details">
            <span>${escapeHtml(error.message)}</span>
          </div>
        </div>
      </div>`);
    } finally {
      setIsCodeLoading(false);
    }
  };

  const executeNodeJS = async () => {
    setCodeOutput('');
    
    if (apiStatus !== 'healthy') {
      setCodeOutput(`<span class="error">❌ API Connection Error: Cannot connect to execution server.</span>\n<span class="info">Please ensure the FastAPI server is running on port 8000.</span>`);
      setIsRunning(false);
      return;
    }

    try {
      setIsCodeLoading(true);
      
      const currentFile = getCurrentFile();
      const language = 'javascript';
      
      const result = await apiService.executeCode(
        currentFile?.content || '',
        language,
        useSandboxMode, 
        userInputs
      );
      
      let formattedOutput = '';
      
      formattedOutput += `<div class="language-header nodejs">
        <i class="fab fa-node-js"></i>
        <span class="language-name">Node.js Output</span>
        <span class="language-tag">NODE</span>
      </div>`;
      
      if (userInputs.trim()) {
        formattedOutput += `<div class="input-info">
          <i class="fas fa-keyboard"></i>
          <span>Input Data: ${userInputs.split('\\n').length} line(s) provided</span>
        </div>`;
      }
      
      if (result.success) {
        formattedOutput += `<div class="execution-success">
          <i class="fas fa-check-circle"></i>
          <div>
            <div class="success-title">Node.js Execution Successful!</div>
            <div class="success-details">
              <span>Execution ID: ${result.execution_id}</span>
              <span>•</span>
              <span>Mode: ${result.mode || 'standard'}</span>
              <span>•</span>
              <span>${new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>`;
        
        if (result.stdout) {
          formattedOutput += `<div class="output-section">
            <div class="section-header">
              <i class="fas fa-terminal"></i>
              <span>Output</span>
            </div>
            <div class="output-content nodejs">
              <pre>${escapeHtml(result.stdout)}</pre>
            </div>
          </div>`;
        }
        
        if (result.stderr) {
          formattedOutput += `<div class="output-section warning">
            <div class="section-header">
              <i class="fas fa-exclamation-triangle"></i>
              <span>Warnings</span>
            </div>
            <div class="output-content warning">
              <pre>${escapeHtml(result.stderr)}</pre>
            </div>
          </div>`;
        }
      } else {
        formattedOutput += `<div class="execution-error">
          <i class="fas fa-times-circle"></i>
          <div>
            <div class="error-title">Node.js Execution Failed</div>
            <div class="error-details">
              <span>Execution ID: ${result.execution_id}</span>
              <span>•</span>
              <span>Error Code: ${result.returncode}</span>
            </div>
          </div>
        </div>`;
        
        if (result.stdout) {
          formattedOutput += `<div class="output-section">
            <div class="section-header">
              <i class="fas fa-terminal"></i>
              <span>Output</span>
            </div>
            <div class="output-content">
              <pre>${escapeHtml(result.stdout)}</pre>
            </div>
          </div>`;
        }
        
        if (result.stderr) {
          formattedOutput += `<div class="output-section error">
            <div class="section-header">
              <i class="fas fa-exclamation-circle"></i>
              <span>Errors</span>
            </div>
            <div class="output-content error">
              <pre>${escapeHtml(result.stderr)}</pre>
            </div>
          </div>`;
        }
      }
      
      setCodeOutput(formattedOutput);
      
    } catch (error) {
      console.error('Node.js execution error:', error);
      setCodeOutput(`<div class="execution-error">
        <i class="fas fa-times-circle"></i>
        <div>
          <div class="error-title">Node.js Execution Error</div>
          <div class="error-details">
            <span>${escapeHtml(error.message)}</span>
          </div>
        </div>
      </div>`);
    } finally {
      setIsCodeLoading(false);
    }
  };

  const clearCurrentFile = () => {
    updateFileContent(activeFile, '');
  };

  const resetCurrentFile = () => {
    const currentFile = getCurrentFile();
    if (!currentFile) return;
    
    const defaultFile = initialFiles.find(f => f.id === currentFile.id);
    if (defaultFile) {
      updateFileContent(activeFile, defaultFile.content);
    }
    
    if (['python', 'c', 'cpp', 'java', 'nodejs', 'php'].includes(currentFile.type)) {
      setUserInputs('');
      setCodeOutput('');
    }
  };

  const resetAllFiles = () => {
    setFiles(initialFiles);
    setActiveFile('index.html');
    setUserInputs('');
    setCodeOutput('');
  };

  const toggleHighContrast = (mode) => {
    setHighContrastMode(mode);
  };

  const increaseFontSize = () => {
    const sizes = ['small', 'medium', 'large', 'xlarge'];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const sizes = ['small', 'medium', 'large', 'xlarge'];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1]);
    }
  };

  const selectLanguage = (langId) => {
    const fileWithLanguage = files.find(f => f.type === langId);
    if (fileWithLanguage) {
      setActiveFile(fileWithLanguage.id);
    }
    setIsDropdownOpen(false);
  };

  const handleSaveCode = async () => {
    try {
      setIsRunning(true);
      
      const zip = new JSZip();
      const projectFolder = zip.folder("devstorm-project");
      
      files.forEach(file => {
        if (file.content.trim()) {
          projectFolder.file(file.name, file.content);
        }
      });
      
      const readmeContent = `# DevStorm Multi-Language Project Export
Exported on: ${new Date().toLocaleString()}
Total Files: ${files.length}

## Files Included:
${files.map(f => `- ${f.name} (${f.type.toUpperCase()})`).join('\n')}

## Instructions:
1. Extract this ZIP file
2. For web files: Open index.html in your browser
3. For compiled languages: Use appropriate compiler
4. For Node.js: Run 'node filename.js'
5. For PHP: Run 'php filename.php' or use web server

## Compilation Commands:
${files.filter(f => ['c', 'cpp', 'java', 'nodejs', 'php'].includes(f.type)).map(f => {
  if (f.type === 'c') {
    return `- ${f.name}: gcc ${f.name} -o ${f.name.replace(/\\.[^/.]+$/, '')} -std=c11`;
  } else if (f.type === 'cpp') {
    return `- ${f.name}: g++ ${f.name} -o ${f.name.replace(/\\.[^/.]+$/, '')} -std=c++17`;
  } else if (f.type === 'java') {
    const className = f.name.replace('.java', '');
    return `- ${f.name}: javac ${f.name} && java ${className}`;
  } else if (f.type === 'nodejs') {
    return `- ${f.name}: node ${f.name}`;
  } else if (f.type === 'php') {
    return `- ${f.name}: php ${f.name}`;
  }
  return '';
}).filter(cmd => cmd).join('\n')}

---
Created with DevStorm Multi-Language Compiler v3.2.0
Now with PHP support including require/include statements!`;
      
      projectFolder.file("README.md", readmeContent);
      
      const manifest = {
        project: "DevStorm Multi-Language Compiler Export",
        version: "3.2.0",
        exportDate: new Date().toISOString(),
        files: files.map(f => ({
          name: f.name,
          type: f.type,
          size: f.content.length,
          language: f.type
        })),
        settings: {
          totalLines: getTotalLines(),
          totalCharacters: getTotalCharacters(),
          totalWords: getTotalWords()
        }
      };
      
      projectFolder.file("manifest.json", JSON.stringify(manifest, null, 2));
      
      const zipBlob = await zip.generateAsync({ 
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6
        }
      });
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const zipFilename = `devstorm-multilang-project-${timestamp}.zip`;
      
      saveAs(zipBlob, zipFilename);
      
      setCodeOutput(`<div class="execution-success">
        <i class="fas fa-file-archive"></i>
        <div>
          <div class="success-title">Project Exported Successfully!</div>
          <div class="success-details">
            <span>Downloaded: ${zipFilename}</span>
            <span>•</span>
            <span>Files: ${files.length}</span>
            <span>•</span>
            <span>Size: ${formatBytes(zipBlob.size)}</span>
          </div>
        </div>
      </div>`);
      
      if (isCompilableLanguage() && codeOutputRef.current) {
        codeOutputRef.current.scrollTop = codeOutputRef.current.scrollHeight;
      }
      
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      setCodeOutput(`<div class="execution-error">
        <i class="fas fa-times-circle"></i>
        <div>
          <div class="error-title">Export Error</div>
          <div class="error-details">
            <span>${escapeHtml(error.message)}</span>
          </div>
        </div>
      </div>`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearCodeOutput = () => {
    setCodeOutput('');
  };

  const clearInputs = () => {
    setUserInputs('');
  };

  const updateFileContent = (fileId, newContent) => {
    setFiles(files.map(file => 
      file.id === fileId ? { ...file, content: newContent } : file
    ));
  };

  const getCodeStats = () => {
    const currentFile = getCurrentFile();
    if (!currentFile) return { lines: 0, characters: 0, words: 0 };
    
    const content = currentFile.content;
    const lines = content.split('\n').length;
    const characters = content.length;
    const words = content.split(/\s+/).filter(word => word.length > 0).length;
    
    return { lines, characters, words };
  };

  const getTotalLines = () => {
    return files.reduce((total, file) => total + file.content.split('\n').length, 0);
  };

  const getTotalCharacters = () => {
    return files.reduce((total, file) => total + file.content.length, 0);
  };

  const getTotalWords = () => {
    return files.reduce((total, file) => {
      return total + file.content.split(/\s+/).filter(word => word.length > 0).length;
    }, 0);
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const createNewFile = () => {
    if (!newFileName.trim()) {
      alert('Please enter a file name');
      return;
    }

    const fileExtension = languages.find(lang => lang.id === newFileType)?.extension || '.txt';
    const fileName = newFileName.endsWith(fileExtension) ? newFileName : `${newFileName}${fileExtension}`;
    const fileId = `${Date.now()}-${fileName}`;
    
    if (files.some(file => file.name === fileName)) {
      alert('A file with this name already exists');
      return;
    }
    
    const newFile = {
      id: fileId,
      name: fileName,
      type: newFileType,
      content: getDefaultContentForType(newFileType)
    };
    
    setFiles([...files, newFile]);
    setActiveFile(fileId);
    setNewFileName('');
    setShowNewFileModal(false);
  };

  const getDefaultContentForType = (type) => {
    switch(type) {
      case 'html':
        return '<!DOCTYPE html>\n<html>\n<head>\n    <title>Hello DevStorm</title>\n</head>\n<body>\n    <h1>Hello DevStorm! 🌟</h1>\n    <div id="output"></div>\n</body>\n</html>';
      case 'css':
        return '/* Hello DevStorm CSS */\nbody {\n    background: #0a0e17;\n    color: white;\n}';
      case 'js':
        return '// Hello DevStorm JavaScript (Browser)\nconsole.log("Hello DevStorm from Browser JavaScript!");\n\ndocument.addEventListener(\'DOMContentLoaded\', function() {\n    const output = document.getElementById(\'output\');\n    if (output) {\n        output.innerHTML = \'<h2 style="color: #f0db4f;">Browser JavaScript is running!</h2>\';\n    }\n});';
      case 'nodejs':
        return '// Hello DevStorm Node.js\nconsole.log("Hello DevStorm from Node.js!");\nconsole.log("Node.js Version:", process.version);\nconsole.log("Platform:", process.platform);';
      case 'php': // ADDED PHP DEFAULT
        return `<?php
// Hello DevStorm PHP
echo "🎉 Hello DevStorm from PHP!\\n";
echo "PHP Version: " . phpversion() . "\\n";
echo "Platform: " . PHP_OS . "\\n\\n";

// PHP features demonstration
$name = "Developer";
echo "Hello, \$name! Welcome to DevStorm PHP.\\n\\n";

// Array example
$colors = ["red", "green", "blue"];
echo "Colors array: " . implode(", ", \$colors) . "\\n\\n";

// Function example
function greet(\$name) {
    return "Hello, \$name from PHP function!";
}

echo greet("DevStorm User") . "\\n\\n";

// Class example
class HelloWorld {
    public \$message = "Hello from PHP class!";
    
    public function display() {
        echo \$this->message . "\\n";
    }
}

\$hello = new HelloWorld();
\$hello->display();

echo "\\n🚀 PHP with require/include support is ready!";
?>`;
      case 'json':
        return '{\n    "message": "Hello DevStorm",\n    "language": "JSON"\n}';
      case 'xml':
        return '<?xml version="1.0" encoding="UTF-8"?>\n<message>\n    <text>Hello DevStorm</text>\n</message>';
      case 'markdown':
        return '# Hello DevStorm\n\nWelcome to DevStorm Multi-Language Compiler!';
      case 'typescript':
        return '// Hello DevStorm TypeScript\nconst message: string = "Hello DevStorm!";\nconsole.log(message);';
      case 'python':
        return '# Hello DevStorm Python\nprint("Hello DevStorm from Python! 🎉")\nprint("Python Version:", __import__(\'sys\').version)';
      case 'c':
        return '/* Hello DevStorm C */\n#include <stdio.h>\n\nint main() {\n    printf("Hello DevStorm from C!\\\\n");\n    return 0;\n}';
      case 'cpp':
        return '/* Hello DevStorm C++ */\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello DevStorm from C++!" << endl;\n    return 0;\n}';
      case 'java':
        const className = newFileName.trim() || 'Main';
        const cleanClassName = className.replace('.java', '');
        return `/* Hello DevStorm Java */
public class ${cleanClassName} {
    public static void main(String[] args) {
        System.out.println("Hello DevStorm from Java!");
    }
}`;
      default:
        return '// Hello DevStorm';
    }
  };

  const deleteFile = (fileId) => {
    if (files.length <= 1) {
      alert('Cannot delete the last file');
      return;
    }
    
    const fileToDelete = files.find(f => f.id === fileId);
    if (!fileToDelete) return;
    
    if (!window.confirm(`Are you sure you want to delete "${fileToDelete.name}"?`)) {
      return;
    }
    
    const newFiles = files.filter(f => f.id !== fileId);
    setFiles(newFiles);
    
    if (activeFile === fileId) {
      setActiveFile(newFiles[0].id);
    }
  };

  const renameFile = (fileId, newName) => {
    if (!newName.trim()) {
      alert('Please enter a valid file name');
      return;
    }
    
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    const fileExtension = languages.find(lang => lang.id === file.type)?.extension || '';
    const fileName = newName.endsWith(fileExtension) ? newName : `${newName}${fileExtension}`;
    
    if (files.some(f => f.name === fileName && f.id !== fileId)) {
      alert('A file with this name already exists');
      return;
    }
    
    setFiles(files.map(f => 
      f.id === fileId ? { ...f, name: fileName } : f
    ));
  };

  const duplicateFile = (fileId) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    const newFileId = `${Date.now()}-${file.name}`;
    const newFileName = `copy_of_${file.name}`;
    
    const newFile = {
      ...file,
      id: newFileId,
      name: newFileName
    };
    
    setFiles([...files, newFile]);
    setActiveFile(newFileId);
  };

  const escapeHtml = (text) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>')
      .replace(/ /g, '&nbsp;');
  };

  const getApiStatusIcon = () => {
    switch(apiStatus) {
      case 'healthy': return 'fa-check-circle';
      case 'unhealthy': return 'fa-exclamation-circle';
      case 'offline': return 'fa-times-circle';
      case 'checking': return 'fa-sync fa-spin';
      default: return 'fa-question-circle';
    }
  };

  const getApiStatusText = () => {
    switch(apiStatus) {
      case 'healthy': return 'API Connected';
      case 'unhealthy': return 'API Issues';
      case 'offline': return 'API Offline';
      case 'checking': return 'Checking API...';
      default: return 'Unknown Status';
    }
  };

  const loadSampleInputs = () => {
    const lang = getCurrentFileType();
    let sampleInputs = '';
    
    if (lang === 'python') {
      sampleInputs = `John
25`;
    } else if (lang === 'c') {
      sampleInputs = `42`;
    } else if (lang === 'cpp') {
      sampleInputs = `DevStorm
3.14`;
    } else if (lang === 'java') {
      sampleInputs = `12345`;
    } else if (lang === 'nodejs') {
      sampleInputs = `Hello Node.js`;
    } else if (lang === 'php') { // ADDED PHP
      sampleInputs = `DevStorm Developer
PHP is awesome!`;
    }
    
    setUserInputs(sampleInputs);
    
    if (inputTextareaRef.current) {
      setTimeout(() => {
        inputTextareaRef.current?.focus();
      }, 100);
    }
  };

  const getCompilerInfo = () => {
    const lang = getCurrentFileType();
    const languageInfo = compilerInfo.languages?.find(l => l.id === lang);
    
    if (languageInfo) {
      return languageInfo;
    }
    
    switch(lang) {
      case 'python':
        return { name: 'Python', version: '3.x', compiler: 'python', requires_compilation: false };
      case 'c':
        return { name: 'C', version: 'C11', compiler: 'gcc', requires_compilation: true };
      case 'cpp':
        return { name: 'C++', version: 'C++17', compiler: 'g++', requires_compilation: true };
      case 'java':
        return { name: 'Java', version: 'Java 8+', compiler: 'javac', requires_compilation: true };
      case 'nodejs':
        return { name: 'Node.js', version: 'Node.js', compiler: 'node', requires_compilation: false };
      case 'php': // ADDED PHP
        return { 
          name: 'PHP', 
          version: 'PHP', 
          compiler: 'php', 
          requires_compilation: false,
          features: ['require', 'include', 'import', 'autoload', 'composer']
        };
      case 'js':
        return { name: 'JavaScript', compiler: 'Browser', requires_compilation: false };
      default:
        return { name: getCurrentLanguage()?.name || 'Unknown', compiler: 'N/A' };
    }
  };

  const renderPreviewContent = () => {
    const currentFile = getCurrentFile();
    const currentLang = getCurrentFileType();
    
    if (!currentFile) return null;
    
    switch(currentLang) {
      case 'html':
      case 'css':
      case 'js':
        return (
          <>
            <div className="compiler-preview-frame">
              <iframe
                id="preview-frame"
                className="compiler-iframe"
                title="preview"
                srcDoc={srcDoc}
                sandbox="allow-scripts allow-same-origin"
                style={{ border: 'none' }}
                aria-label="Code Preview Output"
              />
            </div>
            
            <div className="compiler-preview-controls">
              <div className="compiler-control-group">
                <span className="compiler-control-label">
                  <i className="fas fa-expand-alt"></i> Preview Size:
                </span>
                <div className="compiler-size-controls">
                  <button 
                    className={`compiler-size-btn ${splitPosition === 30 ? 'active' : ''}`}
                    onClick={() => setSplitPosition(30)}
                    aria-label="Large preview, small editor"
                  >
                    Desktop
                  </button>
                  <button 
                    className={`compiler-size-btn ${splitPosition === 50 ? 'active' : ''}`}
                    onClick={() => setSplitPosition(50)}
                    aria-label="Equal split"
                  >
                    Tablet
                  </button>
                  <button 
                    className={`compiler-size-btn ${splitPosition === 70 ? 'active' : ''}`}
                    onClick={() => setSplitPosition(70)}
                    aria-label="Large editor, small preview"
                  >
                    Mobile
                  </button>
                </div>
              </div>
              <div className="compiler-control-group">
                <span className="compiler-control-label">
                  <i className="fas fa-sync-alt"></i> Auto-refresh: ON
                </span>
              </div>
            </div>
          </>
        );
        
      case 'python':
      case 'c':
      case 'cpp':
      case 'java':
      case 'nodejs':
      case 'php': // ADDED PHP
        const compilerInfo = getCompilerInfo();
        const languageName = getCurrentLanguage()?.name || currentLang.toUpperCase();
        
        return (
          <div className="code-output-container">
            <div className="code-output-header">
              <h3>
                <i className={getCurrentLanguage()?.icon} style={{ color: getCurrentLanguage()?.color }}></i>
                {languageName} Output
                <span className="language-badge">{currentLang.toUpperCase()}</span>
                {currentLang === 'php' && (
                  <span className="php-feature-badge">
                    <i className="fas fa-file-import"></i> Supports require/include
                  </span>
                )}
              </h3>
              <div className="code-output-actions">
                <div className="sandbox-toggle">
                  <span className="sandbox-label">Sandbox Mode:</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={useSandboxMode}
                      onChange={(e) => setUseSandboxMode(e.target.checked)}
                      disabled={isCodeLoading}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <button 
                  className="code-action-btn"
                  onClick={clearCodeOutput}
                  disabled={!codeOutput}
                  title="Clear Output"
                >
                  <i className="fas fa-trash"></i> Clear Output
                </button>
                <span className={`code-status ${apiStatus}`}>
                  <i className={`fas ${getApiStatusIcon()}`}></i>
                  {getApiStatusText()}
                </span>
              </div>
            </div>
            
            {apiStatus !== 'healthy' ? (
              <div className="api-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <h4>Execution API Connection Issue</h4>
                <p>Unable to connect to the execution backend. Please ensure:</p>
                <ol>
                  <li>The FastAPI server is running on port 8000</li>
                  <li>Required compilers are installed (PHP, Python, GCC, G++, Java, Node.js)</li>
                  <li>There are no network restrictions</li>
                </ol>
                <button 
                  className="retry-btn"
                  onClick={checkApiHealth}
                >
                  <i className="fas fa-sync-alt"></i> Retry Connection
                </button>
                <p className="fallback-info">
                  <i className="fas fa-info-circle"></i>
                  You can still edit code and save it for later execution.
                </p>
              </div>
            ) : (
              <div className="code-output-content">
                <div 
                  id="code-output"
                  ref={codeOutputRef}
                  className="code-output"
                  dangerouslySetInnerHTML={{ 
                    __html: codeOutput || 
                    `<div class="welcome-message">
                      <div class="welcome-icon">
                        <i class="${getCurrentLanguage()?.icon}" style="color: ${getCurrentLanguage()?.color}"></i>
                      </div>
                      <div class="welcome-content">
                        <h4>Welcome to DevStorm ${languageName} Compiler!</h4>
                        <p>Click "Run Code" to execute your ${languageName} program.</p>
                        <div class="welcome-details">
                          <span><i class="fas fa-cog"></i> Compiler: ${compilerInfo.compiler} ${compilerInfo.version || ''}</span>
                          <span><i class="fas fa-shield-alt"></i> Mode: ${useSandboxMode ? 'Sandboxed' : 'Standard'}</span>
                          ${needsCompilation() ? '<span><i class="fas fa-hammer"></i> Compilation Required</span>' : ''}
                          ${currentLang === 'php' ? '<span><i class="fas fa-file-import"></i> Supports require/include</span>' : ''}
                        </div>
                      </div>
                    </div>`
                  }}
                />
              </div>
            )}
            
            <div className="code-output-footer">
              <span className="code-info">
                <i className="fas fa-server"></i>
                {useSandboxMode 
                  ? 'Sandboxed Execution' 
                  : 'Full Execution Mode'}
              </span>
              <span className="code-compiler">
                <i className="fas fa-cog"></i>
                {compilerInfo.compiler} {compilerInfo.version}
                {compilerInfo.requires_compilation && ' (Compilation Required)'}
              </span>
              <span className="code-time">
                <i className="fas fa-clock"></i>
                {isCodeLoading ? 'Executing...' : 'Ready to execute'}
              </span>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="code-output-container">
            <div className="code-output-header">
              <h3>
                <i className={getCurrentLanguage()?.icon} style={{ color: getCurrentLanguage()?.color }}></i>
                {getCurrentLanguage()?.name} Code Preview
              </h3>
              <span className="output-status">View Only</span>
            </div>
            <div className="code-output-content">
              <pre className="code-output-preview">
                {getCurrentFile()?.content || ''}
              </pre>
            </div>
            <div className="code-output-footer">
              <span className="output-info">
                <i className="fas fa-info-circle"></i>
                {currentLang === 'typescript' 
                  ? 'TypeScript compilation coming soon!' 
                  : `${getCurrentLanguage()?.name} code preview.`}
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`compiler-page ${highContrastMode !== 'off' ? 'high-contrast' : ''}`}>
      <section className="compiler-hero">
        <div className="compiler-hero-content">
          <h1>DevStorm <span className="compiler-gradient-text">Multi-Language Compiler v3.2.0</span></h1>
          <p className="compiler-hero-subtitle">
            Now with PHP support! Write, compile, and execute code in PHP, Python, C, C++, Java, Node.js and 9+ programming languages.
            Supports PHP require/include statements with sandbox security.
          </p>
          
          <div className="compiler-code-snippet">
            <div className="compiler-code-line">
              <span className="compiler-line-number">1</span> 
              <span className="compiler-code-keyword">&lt;?php</span> 
            </div>
            <div className="compiler-code-line">
              <span className="compiler-line-number">2</span> 
              <span className="compiler-code-comment">// PHP now supports require/include!</span>
            </div>
            <div className="compiler-code-line">
              <span className="compiler-line-number">3</span> 
              <span className="compiler-code-text">require</span> 
              <span className="compiler-code-string"> 'config.php'</span>
              <span className="compiler-code-text">;</span>
            </div>
            <div className="compiler-code-line">
              <span className="compiler-line-number">4</span> 
              <span className="compiler-code-text">echo</span> 
              <span className="compiler-code-string"> "Hello DevStorm!"</span>
              <span className="compiler-code-text">;</span>
            </div>
            <div className="compiler-code-line">
              <span className="compiler-line-number">5</span> 
              <span className="compiler-code-keyword">?&gt;</span>
            </div>
          </div>
          
          <div className="compiler-hero-stats">
            <div className="compiler-stat">
              <div className="compiler-stat-number">{languages.length}</div>
              <div className="compiler-stat-label">Languages</div>
            </div>
            <div className="compiler-stat">
              <div className="compiler-stat-number">PHP</div>
              <div className="compiler-stat-label">Added</div>
            </div>
            <div className="compiler-stat">
              <div className="compiler-stat-number">require</div>
              <div className="compiler-stat-label">Support</div>
            </div>
            <div className="compiler-stat">
              <div className="compiler-stat-number">100%</div>
              <div className="compiler-stat-label">Free</div>
            </div>
          </div>
        </div>
      </section>

      <div className="compiler-container">
        <div className="accessibility-controls">
          <div className="accessibility-control-group">
            <span className="accessibility-label">
              <i className="fas fa-universal-access"></i> Accessibility:
            </span>
            <div className="contrast-controls">
              <button 
                className={`contrast-btn ${highContrastMode === 'off' ? 'active' : ''}`}
                onClick={() => toggleHighContrast('off')}
                title="Default Theme"
                aria-label="Switch to default theme"
              >
                <i className="fas fa-palette"></i> Default
              </button>
              <button 
                className={`contrast-btn ${highContrastMode === 'dark' ? 'active' : ''}`}
                onClick={() => toggleHighContrast('dark')}
                title="Dark High Contrast"
                aria-label="Switch to dark high contrast mode"
              >
                <i className="fas fa-moon"></i> Dark HC
              </button>
              <button 
                className={`contrast-btn ${highContrastMode === 'light' ? 'active' : ''}`}
                onClick={() => toggleHighContrast('light')}
                title="Light High Contrast"
                aria-label="Switch to light high contrast mode"
              >
                <i className="fas fa-sun"></i> Light HC
              </button>
            </div>
          </div>
          
          <div className="accessibility-control-group">
            <span className="accessibility-label">
              <i className="fas fa-text-height"></i> Text Size:
            </span>
            <div className="font-controls">
              <button 
                className="font-size-btn"
                onClick={decreaseFontSize}
                disabled={fontSize === 'small'}
                title="Decrease Font Size"
                aria-label="Decrease font size"
              >
                <i className="fas fa-minus"></i>
              </button>
              <span className="font-size-label" aria-live="polite">
                {fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}
              </span>
              <button 
                className="font-size-btn"
                onClick={increaseFontSize}
                disabled={fontSize === 'xlarge'}
                title="Increase Font Size"
                aria-label="Increase font size"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>

          <div className="accessibility-control-group">
            <span className="accessibility-label">
              <i className="fas fa-code"></i> Editor Font:
            </span>
            <div className="editor-font-controls">
              <button 
                className="editor-font-btn"
                onClick={decreaseEditorFontSize}
                disabled={editorFontSize <= 10}
                title="Decrease Editor Font Size"
                aria-label="Decrease editor font size"
              >
                <i className="fas fa-minus"></i>
              </button>
              <div className="editor-font-input-container">
                <input
                  type="number"
                  className="editor-font-input"
                  value={editorFontSize}
                  onChange={(e) => handleEditorFontSizeChange(e.target.value)}
                  min="10"
                  max="30"
                  step="1"
                  aria-label="Editor font size in pixels"
                />
                <span className="editor-font-unit">px</span>
              </div>
              <button 
                className="editor-font-btn"
                onClick={increaseEditorFontSize}
                disabled={editorFontSize >= 30}
                title="Increase Editor Font Size"
                aria-label="Increase editor font size"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>
        </div>

        <div 
          className="compiler-main" 
          ref={splitRef}
          style={{
            display: 'grid',
            gridTemplateColumns: `${splitPosition}% 4px ${100 - splitPosition}%`,
            gap: '0'
          }}
        >
          <div className="compiler-editor-section">
            <div className="file-explorer-toggle">
              <button 
                className="file-explorer-btn"
                onClick={() => setShowFileExplorer(!showFileExplorer)}
                title={showFileExplorer ? "Hide File Explorer" : "Show File Explorer"}
              >
                <i className={`fas fa-${showFileExplorer ? 'folder-open' : 'folder'}`}></i>
                <span>Files ({files.length})</span>
                <i className={`fas fa-chevron-${showFileExplorer ? 'up' : 'down'}`}></i>
              </button>
            </div>

            {showFileExplorer && (
              <div className="file-explorer">
                <div className="file-explorer-header">
                  <h3>
                    <i className="fas fa-folder"></i> Hello Examples
                  </h3>
                  <button 
                    className="new-file-btn"
                    onClick={() => setShowNewFileModal(true)}
                    title="Create New File"
                  >
                    <i className="fas fa-plus"></i> New File
                  </button>
                </div>
                
                <div className="file-list">
                  {files.map(file => {
                    const language = languages.find(lang => lang.id === file.type);
                    const isActive = activeFile === file.id;
                    const isCompilable = ['python', 'c', 'cpp', 'java', 'nodejs', 'php'].includes(file.type);
                    const isWeb = ['html', 'css', 'js'].includes(file.type);
                    
                    return (
                      <div 
                        key={file.id} 
                        className={`file-item ${isActive ? 'active' : ''} ${isCompilable ? 'compilable' : ''} ${isWeb ? 'web-file' : ''}`}
                        onClick={() => setActiveFile(file.id)}
                      >
                        <div className="file-item-content">
                          <i 
                            className={language?.icon || 'fas fa-file'} 
                            style={{ color: language?.color || '#ffffff' }}
                          ></i>
                          <span className="file-name">{file.name}</span>
                          <span className="file-type">{language?.name || file.type}</span>
                          {isCompilable && (
                            <span className="file-compilable">
                              <i className="fas fa-play"></i>
                            </span>
                          )}
                          {file.type === 'js' && (
                            <span className="file-web-badge">
                              <i className="fas fa-globe"></i>
                            </span>
                          )}
                          {file.type === 'nodejs' && (
                            <span className="file-server-badge">
                              <i className="fas fa-server"></i>
                            </span>
                          )}
                          {file.type === 'php' && ( // ADDED PHP BADGE
                            <span className="file-php-badge">
                              <i className="fab fa-php"></i>
                            </span>
                          )}
                        </div>
                        
                        <div className="file-actions">
                          <button 
                            className="file-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateFile(file.id);
                            }}
                            title="Duplicate File"
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                          <button 
                            className="file-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newName = prompt('Enter new file name:', file.name.replace(/\.[^/.]+$/, ''));
                              if (newName) renameFile(file.id, newName);
                            }}
                            title="Rename File"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="file-action-btn file-action-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFile(file.id);
                            }}
                            title="Delete File"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="file-explorer-footer">
                  <button 
                    className="file-explorer-action-btn"
                    onClick={resetAllFiles}
                    title="Reset All Files to Default"
                  >
                    <i className="fas fa-redo"></i> Reset All
                  </button>
                </div>
              </div>
            )}

            <div className="compiler-section-header">
              <h2>
                <i className="fas fa-code"></i> Code Editor
                {getCurrentFile() && (
                  <span className="current-file-name">
                    <i className={getCurrentLanguage()?.icon} style={{ color: getCurrentLanguage()?.color }}></i>
                    {getCurrentFileName()}
                    {isCompilableLanguage() && (
                      <span className="compilable-badge">
                        <i className="fas fa-play"></i> Executable
                      </span>
                    )}
                    {getCurrentFileType() === 'js' && (
                      <span className="web-badge">
                        <i className="fas fa-globe"></i> Browser
                      </span>
                    )}
                    {getCurrentFileType() === 'nodejs' && (
                      <span className="server-badge">
                        <i className="fas fa-server"></i> Node.js
                      </span>
                    )}
                    {getCurrentFileType() === 'php' && ( // ADDED PHP BADGE
                      <span className="php-badge">
                        <i className="fab fa-php"></i> PHP
                      </span>
                    )}
                  </span>
                )}
              </h2>
              <div className="language-selector-container" ref={dropdownRef}>
                <button 
                  className="language-selector-btn"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-label="Select programming language"
                  aria-expanded={isDropdownOpen}
                >
                  <div className="selected-language">
                    <i className={getCurrentLanguage()?.icon} style={{ color: getCurrentLanguage()?.color }}></i>
                    <span>{getCurrentLanguage()?.name}</span>
                  </div>
                  <i className={`fas fa-chevron-${isDropdownOpen ? 'up' : 'down'}`}></i>
                </button>
                
                {isDropdownOpen && (
                  <div className="language-dropdown">
                    {languages.map(lang => (
                      <button
                        key={lang.id}
                        className={`language-option ${getCurrentFileType() === lang.id ? 'active' : ''}`}
                        onClick={() => selectLanguage(lang.id)}
                        aria-label={`Select ${lang.name}`}
                      >
                        <i className={lang.icon} style={{ color: lang.color }}></i>
                        <span>{lang.name}</span>
                        {['js', 'nodejs'].includes(lang.id) && (
                          <span className="js-type-badge">
                            {lang.id === 'js' ? 'Browser' : 'Node.js'}
                          </span>
                        )}
                        {lang.id === 'php' && ( // ADDED PHP BADGE
                          <span className="php-type-badge">
                            <i className="fas fa-file-import"></i> require/include
                          </span>
                        )}
                        {getCurrentFileType() === lang.id && (
                          <i className="fas fa-check"></i>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {showInputSection && (
              <div className="input-section">
                <div className="input-section-header">
                  <h3>
                    <i className="fas fa-keyboard"></i> Input Data for {getCurrentLanguage()?.name}
                  </h3>
                  <div className="input-section-actions">
                    <button 
                      className="input-action-btn"
                      onClick={loadSampleInputs}
                      title="Load Sample Inputs"
                    >
                      <i className="fas fa-download"></i> Load Samples
                    </button>
                    <button 
                      className="input-action-btn"
                      onClick={clearInputs}
                      disabled={!userInputs}
                      title="Clear Inputs"
                    >
                      <i className="fas fa-trash"></i> Clear
                    </button>
                  </div>
                </div>
                <div className="input-section-content">
                  <textarea
                    ref={inputTextareaRef}
                    className="input-textarea"
                    value={userInputs}
                    onChange={(e) => setUserInputs(e.target.value)}
                    placeholder={`Enter input data for ${getCurrentLanguage()?.name}...
Example input lines:`}
                    spellCheck="false"
                    rows="3"
                  />
                  <div className="input-help">
                    <i className="fas fa-info-circle"></i>
                    <span>
                      Each line will be used as input for your program. Try the sample inputs!
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="compiler-action-buttons-container">
              <div className="action-buttons-group">
                <button 
                  className="compiler-action-btn compiler-action-save" 
                  onClick={handleSaveCode}
                  disabled={!getCurrentFile() || files.length === 0}
                  title="Export All Files as ZIP"
                >
                  <i className="fas fa-file-archive"></i> Export ZIP
                </button>
                <button 
                  className="compiler-action-btn compiler-action-clear" 
                  onClick={clearCurrentFile}
                  disabled={!getCurrentFile()}
                  title="Clear Current File"
                >
                  <i className="fas fa-trash"></i> Clear
                </button>
                <button 
                  className="compiler-action-btn compiler-action-reset" 
                  onClick={resetCurrentFile}
                  disabled={!getCurrentFile()}
                  title="Reset Current File to Default"
                >
                  <i className="fas fa-redo"></i> Reset
                </button>
              </div>
              <button 
                className={`compiler-action-btn compiler-action-run ${isRunning ? 'running' : ''}`} 
                onClick={runCode}
                disabled={isRunning || (isCompilableLanguage() && isCodeLoading) || !getCurrentFile()}
                title={isCompilableLanguage() ? `Run ${getCurrentLanguage()?.name} Code` : "Preview Code"}
              >
                <i className={isCompilableLanguage() ? "fas fa-play" : "fas fa-eye"}></i> 
                {isRunning 
                  ? 'Running...' 
                  : isCompilableLanguage() 
                    ? (isCodeLoading ? 'Loading...' : needsCompilation() ? 'Compile & Run' : 'Run Code')
                    : 'Preview'}
              </button>
            </div>

            <div className="export-info-card">
              <i className="fas fa-info-circle"></i>
              <div className="export-info-content">
                <span className="export-info-title">New: PHP Support Added!</span>
                <span className="export-info-desc">
                  PHP now supports require/include statements with sandbox security!
                </span>
              </div>
            </div>

            <div className="compiler-code-editor">
              <textarea
                className={`compiler-textarea ${getCurrentFileType()}-editor`}
                value={getCurrentFile()?.content || ''}
                onChange={(e) => updateFileContent(activeFile, e.target.value)}
                spellCheck="false"
                placeholder={getCurrentFile() ? `Edit your ${getCurrentLanguage()?.name} code here...` : 'Select a file to start editing'}
                aria-label={`${getCurrentLanguage()?.name} Code Editor`}
                style={{ fontSize: `${editorFontSize}px` }}
                disabled={!getCurrentFile()}
              />
            </div>

            <div className="compiler-editor-info">
              <div className="compiler-info-card">
                <i className="fas fa-lightbulb"></i>
                <span>Simple examples to get started!</span>
              </div>
              <div className="compiler-info-card">
                <i className="fas fa-bolt"></i>
                <span>Real-time syntax highlighting</span>
              </div>
              <div className="compiler-info-card">
                <i className="fas fa-file-code"></i>
                <span>{getCodeStats().lines} lines, {getCodeStats().words} words</span>
              </div>
              {isCompilableLanguage() && (
                <div className="compiler-info-card">
                  <i className="fas fa-keyboard"></i>
                  <span>Input support available</span>
                </div>
              )}
              {getCurrentFileType() === 'php' && ( // ADDED PHP INFO
                <div className="compiler-info-card php-feature">
                  <i className="fab fa-php"></i>
                  <span>Supports require/include</span>
                </div>
              )}
            </div>
          </div>

          <div 
            className="compiler-split-bar"
            onMouseDown={() => setIsResizing(true)}
          >
            <div className="split-handle">
              <i className="fas fa-grip-lines-vertical"></i>
            </div>
          </div>

          <div className="compiler-preview-section">
            <div className="compiler-section-header">
              <h2>
                <i className="fas fa-eye"></i> 
                {isCompilableLanguage() 
                  ? `${getCurrentLanguage()?.name} Output` 
                  : ['html', 'css', 'js'].includes(getCurrentFileType()) 
                    ? 'Live Preview' 
                    : 'Code Preview'}
              </h2>
              <p className="compiler-section-subtitle">
                {isCompilableLanguage() 
                  ? `See your ${getCurrentLanguage()?.name} program output here!` 
                  : ['html', 'css', 'js'].includes(getCurrentFileType()) 
                    ? 'See your web code results instantly' 
                    : 'Code preview and output display'}
              </p>
            </div>

            <div className="compiler-preview-container">
              {renderPreviewContent()}
            </div>

            <div className="compiler-stats">
              <div className="compiler-stat-card">
                <div className="compiler-stat-icon">
                  <i className={getCurrentLanguage()?.icon} style={{ color: getCurrentLanguage()?.color }}></i>
                </div>
                <div className="compiler-stat-info">
                  <div className="compiler-stat-number">
                    {getCodeStats().lines}
                  </div>
                  <div className="compiler-stat-label">Total Lines</div>
                </div>
              </div>
              <div className="compiler-stat-card">
                <div className="compiler-stat-icon">
                  <i className="fas fa-font"></i>
                </div>
                <div className="compiler-stat-info">
                  <div className="compiler-stat-number">
                    {getCodeStats().words}
                  </div>
                  <div className="compiler-stat-label">Words</div>
                </div>
              </div>
              <div className="compiler-stat-card">
                <div className="compiler-stat-icon">
                  <i className="fas fa-keyboard"></i>
                </div>
                <div className="compiler-stat-info">
                  <div className="compiler-stat-number">
                    {getCodeStats().characters}
                  </div>
                  <div className="compiler-stat-label">Characters</div>
                </div>
              </div>
              <div className="compiler-stat-card">
                <div className="compiler-stat-icon">
                  <i className="fas fa-folder"></i>
                </div>
                <div className="compiler-stat-info">
                  <div className="compiler-stat-number">
                    {files.length}
                  </div>
                  <div className="compiler-stat-label">Files</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showNewFileModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <i className="fas fa-plus"></i> Create New File
              </h3>
              <button 
                className="modal-close-btn"
                onClick={() => setShowNewFileModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="fileName">
                  <i className="fas fa-file"></i> File Name
                </label>
                <input
                  ref={newFileNameInputRef}
                  type="text"
                  id="fileName"
                  className="form-input"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="Enter file name (e.g., hello.php)"
                />
                <div className="form-help">
                  A simple "Hello DevStorm" example will be created automatically
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="fileType">
                  <i className="fas fa-code"></i> File Type
                </label>
                <div className="file-type-grid">
                  {languages.map(lang => (
                    <button
                      key={lang.id}
                      className={`file-type-option ${newFileType === lang.id ? 'active' : ''} ${['python', 'c', 'cpp', 'java', 'nodejs', 'php'].includes(lang.id) ? 'executable' : ''}`}
                      onClick={() => setNewFileType(lang.id)}
                    >
                      <i className={lang.icon} style={{ color: lang.color }}></i>
                      <span>{lang.name}</span>
                      <span className="file-extension">{lang.extension}</span>
                      {['python', 'c', 'cpp', 'java'].includes(lang.id) && (
                        <span className="executable-badge">
                          <i className="fas fa-play"></i>
                        </span>
                      )}
                      {lang.id === 'nodejs' && (
                        <span className="nodejs-badge">
                          <i className="fas fa-server"></i>
                        </span>
                      )}
                      {lang.id === 'php' && ( // ADDED PHP BADGE
                        <span className="php-badge">
                          <i className="fab fa-php"></i>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="modal-btn modal-btn-secondary"
                onClick={() => setShowNewFileModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-btn modal-btn-primary"
                onClick={createNewFile}
                disabled={!newFileName.trim()}
              >
                <i className="fas fa-plus"></i> Create File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compiler;