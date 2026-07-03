import React, { useState, useEffect, useRef } from 'react';
import './CloudLinux.css';

const CloudLinux = () => {
    const [sshConnections, setSshConnections] = useState([
        {
            id: 1,
            name: 'Primary Development Server',
            host: 'dcl.devstorm.com',
            port: 22,
            username: 'user',
            status: 'active',
            uptime: '7 days, 3 hours',
            memory: '4GB RAM',
            storage: '50GB SSD',
            color: 'dcl-connection-blue'
        },
        {
            id: 2,
            name: 'Web Application Server',
            host: 'web.dcl.devstorm.com',
            port: 2222,
            username: 'developer',
            status: 'active',
            uptime: '3 days, 12 hours',
            memory: '8GB RAM',
            storage: '100GB SSD',
            color: 'dcl-connection-green'
        },
        {
            id: 3,
            name: 'Database Server',
            host: 'db.dcl.devstorm.com',
            port: 2200,
            username: 'admin',
            status: 'maintenance',
            uptime: '15 days, 6 hours',
            memory: '16GB RAM',
            storage: '200GB SSD',
            color: 'dcl-connection-purple'
        },
        {
            id: 4,
            name: 'Testing Environment',
            host: 'test.dcl.devstorm.com',
            port: 22,
            username: 'tester',
            status: 'inactive',
            uptime: '1 day, 8 hours',
            memory: '2GB RAM',
            storage: '30GB SSD',
            color: 'dcl-connection-orange'
        }
    ]);

    const [selectedConnection, setSelectedConnection] = useState(sshConnections[0]);
    const [terminalInput, setTerminalInput] = useState('');
    const [terminalOutput, setTerminalOutput] = useState([
        { type: 'system', text: 'Connecting to DevStorm Cloud Linux (DCL)...' },
        { type: 'system', text: 'Connected to: Primary Development Server' },
        { type: 'system', text: 'Linux dcl.devstorm.com 5.15.0-72-generic #79-Ubuntu SMP' },
        { type: 'system', text: 'Welcome to DevStorm Cloud Linux - Version 2.4.1' },
        { type: 'system', text: 'Type "help" for available commands' },
        { type: 'command', text: 'user@dcl:~$ whoami', user: true },
        { type: 'output', text: 'user' },
        { type: 'command', text: 'user@dcl:~$ pwd', user: true },
        { type: 'output', text: '/home/user' },
        { type: 'command', text: 'user@dcl:~$ ls -la', user: true },
        { type: 'output', text: 'total 32' },
        { type: 'output', text: 'drwxr-xr-x 4 user user 4096 Mar 15 10:30 .' },
        { type: 'output', text: 'drwxr-xr-x 3 root root 4096 Mar 10 09:15 ..' },
        { type: 'output', text: '-rw-r--r-- 1 user user  220 Mar 10 09:15 .bash_logout' },
        { type: 'output', text: '-rw-r--r-- 1 user user 3771 Mar 10 09:15 .bashrc' },
        { type: 'output', text: 'drwxr-xr-x 2 user user 4096 Mar 15 10:30 projects' },
        { type: 'output', text: '-rw-r--r-- 1 user user  807 Mar 10 09:15 .profile' },
        { type: 'output', text: 'drwxr-xr-x 2 user user 4096 Mar 14 14:20 scripts' }
    ]);

    const terminalEndRef = useRef(null);
    const terminalInputRef = useRef(null);

    const commands = {
        help: 'Available commands: ls, cd, pwd, mkdir, touch, rm, cat, echo, clear, whoami, date, uptime, neofetch, python3, node, npm, git',
        ls: 'List directory contents',
        pwd: 'Print working directory',
        whoami: 'Print current user',
        date: 'Display current date and time',
        uptime: 'Show system uptime',
        clear: 'Clear terminal screen',
        neofetch: 'Display system information',
    };

    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [terminalOutput]);

    const handleTerminalSubmit = (e) => {
        e.preventDefault();
        if (!terminalInput.trim()) return;

        const input = terminalInput.trim();
        const newOutput = [...terminalOutput];
        
        // Add command to output
        newOutput.push({ 
            type: 'command', 
            text: `${selectedConnection.username}@${selectedConnection.host}:~$ ${input}`,
            user: true 
        });

        // Process command
        if (input === 'clear') {
            setTerminalOutput([]);
            setTerminalInput('');
            return;
        }

        if (commands[input]) {
            newOutput.push({ type: 'output', text: commands[input] });
        } else if (input === 'neofetch') {
            newOutput.push({ type: 'output', text: '' });
            newOutput.push({ type: 'output', text: '           .-/+oossssoo+/-.               ' });
            newOutput.push({ type: 'output', text: '       `:+ssssssssssssssssss+:`           ' });
            newOutput.push({ type: 'output', text: '     -+ssssssssssssssssssyyssss+-         ' });
            newOutput.push({ type: 'output', text: '   .ossssssssssssssssssdMMMNysssso.       ' });
            newOutput.push({ type: 'output', text: '  /ssssssssssshdmmNNmmyNMMMMhssssss/      ' });
            newOutput.push({ type: 'output', text: ' +ssssssssshmydMMMMMMMNddddyssssssss+     ' });
            newOutput.push({ type: 'output', text: '/sssssssshNMMMyhhyyyyhmNMMMNhssssssss/    ' });
            newOutput.push({ type: 'output', text: '.ssssssssdMMMNhsssssssssshNMMMdssssssss.  ' });
            newOutput.push({ type: 'output', text: ' +sssshhhyNMMNyssssssssssssyNMMMyssssss+  ' });
            newOutput.push({ type: 'output', text: '  ossyNMMMNyMMhsssssssssssssshmmmhssssso  ' });
            newOutput.push({ type: 'output', text: '   -sssssssssssssssssssssssssssso.       ' });
            newOutput.push({ type: 'output', text: '     -+ssssssssssssssssssyyssss+-         ' });
            newOutput.push({ type: 'output', text: '       `:+ssssssssssssssssss+:`           ' });
            newOutput.push({ type: 'output', text: '           .-/+oossssoo+/-.               ' });
            newOutput.push({ type: 'output', text: '' });
            newOutput.push({ type: 'output', text: 'OS: DevStorm Cloud Linux 2.4.1 x86_64' });
            newOutput.push({ type: 'output', text: 'Host: DevStorm DCL Virtual Machine' });
            newOutput.push({ type: 'output', text: 'Kernel: 5.15.0-72-generic' });
            newOutput.push({ type: 'output', text: 'Uptime: 7 days, 3 hours, 15 mins' });
            newOutput.push({ type: 'output', text: 'Packages: 1456 (dpkg)' });
            newOutput.push({ type: 'output', text: 'Shell: bash 5.1.16' });
            newOutput.push({ type: 'output', text: 'CPU: Intel Xeon (4) @ 2.500GHz' });
            newOutput.push({ type: 'output', text: 'Memory: 1428MiB / 4096MiB' });
        } else if (input.startsWith('echo ')) {
            newOutput.push({ type: 'output', text: input.slice(5) });
        } else {
            newOutput.push({ type: 'output', text: `Command not found: ${input}. Type "help" for available commands.` });
        }

        setTerminalOutput(newOutput);
        setTerminalInput('');
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'active': return '#00cc88';
            case 'maintenance': return '#ff9966';
            case 'inactive': return '#ff3366';
            default: return '#6c757d';
        }
    };

    const getSshCommand = (connection) => {
        return `ssh ${connection.username}@${connection.host} -p ${connection.port}`;
    };

    const getSshConfig = (connection) => {
        return `Host ${connection.name.toLowerCase().replace(/\s+/g, '-')}\n  HostName ${connection.host}\n  Port ${connection.port}\n  User ${connection.username}\n  IdentityFile ~/.ssh/id_rsa`;
    };

    return (
        <div className="dcl-page">
            {/* Hero Section */}
            <section className="dcl-hero">
                <div className="dcl-container">
                    <div className="dcl-hero-content">
                        <h1 className="dcl-hero-title">
                            DevStorm <span className="dcl-gradient-text">Cloud Linux</span>
                        </h1>
                        <p className="dcl-hero-subtitle">
                            Access Linux environments directly in your browser. Practice commands, 
                            deploy applications, and learn system administration in real-time.
                        </p>
                        
                        <div className="dcl-hero-stats">
                            <div className="dcl-stat">
                                <div className="dcl-stat-number">4</div>
                                <div className="dcl-stat-label">Linux Instances</div>
                            </div>
                            <div className="dcl-stat-divider"></div>
                            <div className="dcl-stat">
                                <div className="dcl-stat-number">24/7</div>
                                <div className="dcl-stat-label">Uptime</div>
                            </div>
                            <div className="dcl-stat-divider"></div>
                            <div className="dcl-stat">
                                <div className="dcl-stat-number">SSH</div>
                                <div className="dcl-stat-label">Secure Access</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="dcl-container">
                <div className="dcl-layout">
                    {/* Left Column - SSH Connections */}
                    <aside className="dcl-sidebar">
                        <div className="dcl-sidebar-card">
                            <h3 className="dcl-sidebar-title">
                                <i className="fas fa-server"></i> Available Instances
                            </h3>
                            <div className="dcl-connections-list">
                                {sshConnections.map((connection) => (
                                    <div 
                                        key={connection.id} 
                                        className={`dcl-connection-item ${selectedConnection.id === connection.id ? 'active' : ''} ${connection.color}`}
                                        onClick={() => setSelectedConnection(connection)}
                                    >
                                        <div className="dcl-connection-header">
                                            <div className="dcl-connection-status">
                                                <span 
                                                    className="dcl-status-dot" 
                                                    style={{ backgroundColor: getStatusColor(connection.status) }}
                                                ></span>
                                                <span className="dcl-status-text">{connection.status}</span>
                                            </div>
                                            <h4 className="dcl-connection-name">{connection.name}</h4>
                                        </div>
                                        <div className="dcl-connection-details">
                                            <div className="dcl-detail">
                                                <i className="fas fa-desktop"></i>
                                                <span>{connection.host}:{connection.port}</span>
                                            </div>
                                            <div className="dcl-detail">
                                                <i className="fas fa-user"></i>
                                                <span>User: {connection.username}</span>
                                            </div>
                                            <div className="dcl-detail">
                                                <i className="fas fa-memory"></i>
                                                <span>{connection.memory}</span>
                                            </div>
                                            <div className="dcl-detail">
                                                <i className="fas fa-hdd"></i>
                                                <span>{connection.storage}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Commands */}
                        <div className="dcl-sidebar-card">
                            <h3 className="dcl-sidebar-title">
                                <i className="fas fa-terminal"></i> Quick Commands
                            </h3>
                            <div className="dcl-quick-commands">
                                {Object.keys(commands).slice(0, 6).map((cmd) => (
                                    <button 
                                        key={cmd}
                                        className="dcl-quick-command"
                                        onClick={() => setTerminalInput(cmd)}
                                    >
                                        {cmd}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="dcl-main">
                        {/* SSH Connection Details */}
                        <section className="dcl-ssh-section">
                            <div className="dcl-section-header">
                                <h2 className="dcl-section-title">SSH Connection</h2>
                                <div className="dcl-connection-badges">
                                    <span className="dcl-badge dcl-badge-success">
                                        <i className="fas fa-shield-alt"></i> Secure Connection
                                    </span>
                                    <span className="dcl-badge dcl-badge-info">
                                        <i className="fas fa-bolt"></i> Low Latency
                                    </span>
                                </div>
                            </div>

                            <div className="dcl-ssh-details">
                                {/* SSH Command */}
                                <div className="dcl-ssh-command-card">
                                    <div className="dcl-ssh-header">
                                        <h3>
                                            <i className="fas fa-terminal"></i> SSH Command
                                        </h3>
                                        <button 
                                            className="dcl-copy-btn"
                                            onClick={() => copyToClipboard(getSshCommand(selectedConnection))}
                                        >
                                            <i className="far fa-copy"></i> Copy
                                        </button>
                                    </div>
                                    <div className="dcl-ssh-command">
                                        <code>{getSshCommand(selectedConnection)}</code>
                                    </div>
                                    <div className="dcl-ssh-help">
                                        <i className="fas fa-info-circle"></i>
                                        <span>Run this command in your terminal to connect</span>
                                    </div>
                                </div>

                                {/* SSH Config */}
                                <div className="dcl-ssh-config-card">
                                    <div className="dcl-ssh-header">
                                        <h3>
                                            <i className="fas fa-cog"></i> SSH Config
                                        </h3>
                                        <button 
                                            className="dcl-copy-btn"
                                            onClick={() => copyToClipboard(getSshConfig(selectedConnection))}
                                        >
                                            <i className="far fa-copy"></i> Copy
                                        </button>
                                    </div>
                                    <div className="dcl-ssh-config">
                                        <pre>{getSshConfig(selectedConnection)}</pre>
                                    </div>
                                    <div className="dcl-ssh-help">
                                        <i className="fas fa-info-circle"></i>
                                        <span>Add to ~/.ssh/config for easier connection</span>
                                    </div>
                                </div>
                            </div>

                            {/* Connection Instructions */}
                            <div className="dcl-instructions">
                                <h3 className="dcl-instructions-title">
                                    <i className="fas fa-graduation-cap"></i> Connection Instructions
                                </h3>
                                <div className="dcl-instructions-steps">
                                    <div className="dcl-step">
                                        <div className="dcl-step-number">1</div>
                                        <div className="dcl-step-content">
                                            <h4>Generate SSH Key (if you don't have one)</h4>
                                            <code>ssh-keygen -t rsa -b 4096 -C "your_email@example.com"</code>
                                        </div>
                                    </div>
                                    <div className="dcl-step">
                                        <div className="dcl-step-number">2</div>
                                        <div className="dcl-step-content">
                                            <h4>Copy your public key to the server</h4>
                                            <code>ssh-copy-id -p {selectedConnection.port} {selectedConnection.username}@{selectedConnection.host}</code>
                                        </div>
                                    </div>
                                    <div className="dcl-step">
                                        <div className="dcl-step-number">3</div>
                                        <div className="dcl-step-content">
                                            <h4>Connect using SSH</h4>
                                            <code>{getSshCommand(selectedConnection)}</code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Terminal Interface */}
                        <section className="dcl-terminal-section">
                            <div className="dcl-section-header">
                                <h2 className="dcl-section-title">Web Terminal</h2>
                                <div className="dcl-terminal-info">
                                    <span className="dcl-terminal-status">
                                        <i className="fas fa-circle" style={{ color: getStatusColor(selectedConnection.status) }}></i>
                                        Connected to {selectedConnection.name}
                                    </span>
                                </div>
                            </div>

                            <div className="dcl-terminal-container">
                                <div className="dcl-terminal-header">
                                    <div className="dcl-terminal-tabs">
                                        <button className="dcl-terminal-tab active">
                                            <i className="fas fa-terminal"></i> Terminal
                                        </button>
                                        <button className="dcl-terminal-tab">
                                            <i className="fas fa-code"></i> Editor
                                        </button>
                                        <button className="dcl-terminal-tab">
                                            <i className="fas fa-file"></i> Files
                                        </button>
                                    </div>
                                    <div className="dcl-terminal-controls">
                                        <button 
                                            className="dcl-terminal-control"
                                            onClick={() => setTerminalInput('clear')}
                                        >
                                            <i className="fas fa-broom"></i> Clear
                                        </button>
                                        <button className="dcl-terminal-control">
                                            <i className="fas fa-expand"></i> Fullscreen
                                        </button>
                                    </div>
                                </div>

                                <div className="dcl-terminal-output" ref={terminalEndRef}>
                                    {terminalOutput.map((line, index) => (
                                        <div 
                                            key={index} 
                                            className={`dcl-terminal-line dcl-terminal-${line.type}`}
                                        >
                                            {line.user ? (
                                                <>
                                                    <span className="dcl-terminal-prompt">
                                                        {line.text.split('$')[0]}<span className="dcl-terminal-dollar">$</span>
                                                    </span>
                                                    <span className="dcl-terminal-command">
                                                        {line.text.split('$')[1]}
                                                    </span>
                                                </>
                                            ) : (
                                                <span>{line.text}</span>
                                            )}
                                        </div>
                                    ))}
                                    <div ref={terminalEndRef} />
                                </div>

                                <form className="dcl-terminal-input" onSubmit={handleTerminalSubmit}>
                                    <div className="dcl-terminal-prompt-display">
                                        <span className="dcl-terminal-user">{selectedConnection.username}</span>
                                        <span className="dcl-terminal-at">@</span>
                                        <span className="dcl-terminal-host">{selectedConnection.host}</span>
                                        <span className="dcl-terminal-colon">:</span>
                                        <span className="dcl-terminal-path">~</span>
                                        <span className="dcl-terminal-dollar">$</span>
                                    </div>
                                    <input
                                        ref={terminalInputRef}
                                        type="text"
                                        className="dcl-terminal-field"
                                        value={terminalInput}
                                        onChange={(e) => setTerminalInput(e.target.value)}
                                        placeholder="Type a command..."
                                        autoFocus
                                    />
                                    <button type="submit" className="dcl-terminal-submit">
                                        <i className="fas fa-paper-plane"></i>
                                    </button>
                                </form>
                            </div>
                        </section>

                        {/* Features Section */}
                        <section className="dcl-features-section">
                            <h2 className="dcl-section-title">DCL Features</h2>
                            <div className="dcl-features-grid">
                                <div className="dcl-feature">
                                    <div className="dcl-feature-icon">
                                        <i className="fas fa-lock"></i>
                                    </div>
                                    <h3>Secure SSH</h3>
                                    <p>Encrypted SSH connections with key-based authentication</p>
                                </div>
                                <div className="dcl-feature">
                                    <div className="dcl-feature-icon">
                                        <i className="fas fa-rocket"></i>
                                    </div>
                                    <h3>High Performance</h3>
                                    <p>SSD storage and optimized Linux kernels for fast operations</p>
                                </div>
                                <div className="dcl-feature">
                                    <div className="dcl-feature-icon">
                                        <i className="fas fa-code"></i>
                                    </div>
                                    <h3>Pre-installed Tools</h3>
                                    <p>Python, Node.js, Git, Docker, and development tools ready to use</p>
                                </div>
                                <div className="dcl-feature">
                                    <div className="dcl-feature-icon">
                                        <i className="fas fa-sync"></i>
                                    </div>
                                    <h3>Auto Backup</h3>
                                    <p>Automatic daily backups of your home directory</p>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default CloudLinux;