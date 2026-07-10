import React, { useState } from 'react';
import './Store.css';

const DvsStore = () => {
  // Apps data
  const apps = [
    {
      id: 1,
      name: 'DevStorm Compiler',
      category: 'Development',
      icon: 'fas fa-code',
      color: '#0066ff',
      rating: 4.9,
      downloads: '10K+',
      size: '15 MB',
      version: '2.0.0',
      description: 'Multi-language compiler supporting Python, C, C++, JavaScript, HTML, CSS and more with live preview.',
      features: [
        '8+ Programming Languages',
        'Real-time Code Execution',
        'File Management',
        'ZIP Export',
        'Syntax Highlighting'
      ],
      screenshots: [
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w-400&h=300&fit=crop'
      ],
      price: 'Free',
      isInstalled: true,
      lastUpdated: '2 days ago'
    },
    {
      id: 2,
      name: 'DevStorm AI Assistant',
      category: 'AI',
      icon: 'fas fa-robot',
      color: '#00cc88',
      rating: 4.8,
      downloads: '5K+',
      size: '25 MB',
      version: '1.5.0',
      description: 'AI-powered code assistant with intelligent suggestions, bug detection, and automated refactoring.',
      features: [
        'Code Completion',
        'Bug Detection',
        'Code Refactoring',
        'Documentation',
        'Multi-language Support'
      ],
      screenshots: [
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1676299081939-2d38a8d8c2a1?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1677442135136-760c332d5b5c?w=400&h=300&fit=crop'
      ],
      price: 'Premium',
      isInstalled: false,
      lastUpdated: '1 week ago'
    },
    {
      id: 3,
      name: 'DevStorm Cloud Sync',
      category: 'Productivity',
      icon: 'fas fa-cloud',
      color: '#8a2be2',
      rating: 4.7,
      downloads: '8K+',
      size: '10 MB',
      version: '1.2.0',
      description: 'Sync your projects across devices with secure cloud storage and version control.',
      features: [
        'Cross-device Sync',
        'Version History',
        'Secure Storage',
        'Team Collaboration',
        'Auto Backup'
      ],
      screenshots: [
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=400&h=300&fit=crop'
      ],
      price: 'Free',
      isInstalled: false,
      lastUpdated: '3 days ago'
    },
    {
      id: 4,
      name: 'DevStorm Debugger',
      category: 'Development',
      icon: 'fas fa-bug',
      color: '#ff3366',
      rating: 4.6,
      downloads: '7K+',
      size: '20 MB',
      version: '1.8.0',
      description: 'Advanced debugging tool with real-time error tracking, breakpoints, and performance analysis.',
      features: [
        'Real-time Debugging',
        'Performance Analysis',
        'Error Tracking',
        'Breakpoints',
        'Stack Traces'
      ],
      screenshots: [
        'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=400&h=300&fit=crop'
      ],
      price: 'Free',
      isInstalled: true,
      lastUpdated: '5 days ago'
    },
    {
      id: 5,
      name: 'DevStorm API Builder',
      category: 'Development',
      icon: 'fas fa-server',
      color: '#ff9966',
      rating: 4.9,
      downloads: '3K+',
      size: '30 MB',
      version: '2.1.0',
      description: 'Build, test, and deploy APIs with visual interface and automated documentation.',
      features: [
        'API Design',
        'Testing Tools',
        'Auto Documentation',
        'Mock Server',
        'Deployment'
      ],
      screenshots: [
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=400&h=300&fit=crop'
      ],
      price: 'Premium',
      isInstalled: false,
      lastUpdated: '1 week ago'
    },
    {
      id: 6,
      name: 'DevStorm Database GUI',
      category: 'Database',
      icon: 'fas fa-database',
      color: '#00aaff',
      rating: 4.7,
      downloads: '6K+',
      size: '35 MB',
      version: '1.4.0',
      description: 'Visual database management tool with query builder, schema designer, and data visualization.',
      features: [
        'Multiple Databases',
        'Query Builder',
        'Schema Designer',
        'Data Visualization',
        'Import/Export'
      ],
      screenshots: [
        'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=400&h=300&fit=crop'
      ],
      price: 'Free',
      isInstalled: false,
      lastUpdated: '2 weeks ago'
    },
    {
      id: 7,
      name: 'DevStorm Git Client',
      category: 'Development',
      icon: 'fab fa-git-alt',
      color: '#f1502f',
      rating: 4.8,
      downloads: '9K+',
      size: '18 MB',
      version: '1.9.0',
      description: 'Beautiful Git client with visual branching, merging, and repository management.',
      features: [
        'Visual Branching',
        'Merge Tools',
        'Repository Management',
        'Git Flow',
        'Conflict Resolution'
      ],
      screenshots: [
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=400&h=300&fit=crop'
      ],
      price: 'Free',
      isInstalled: true,
      lastUpdated: '4 days ago'
    },
    {
      id: 8,
      name: 'DevStorm Team',
      category: 'Collaboration',
      icon: 'fas fa-users',
      color: '#8a2be2',
      rating: 4.9,
      downloads: '12K+',
      size: '40 MB',
      version: '2.3.0',
      description: 'Collaborate with your team in real-time with code review, chat, and project management.',
      features: [
        'Real-time Collaboration',
        'Code Review',
        'Project Management',
        'Team Chat',
        'Video Calls'
      ],
      screenshots: [
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=400&h=300&fit=crop'
      ],
      price: 'Premium',
      isInstalled: false,
      lastUpdated: '3 days ago'
    }
  ];

  // Categories
  const categories = ['All', 'Development', 'AI', 'Productivity', 'Database', 'Collaboration'];
  
  // State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [sortBy, setSortBy] = useState('rating');
  const [installedApps, setInstalledApps] = useState([1, 4, 7]);

  // Filter apps based on category and search
  const filteredApps = apps.filter(app => {
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort apps
  const sortedApps = [...filteredApps].sort((a, b) => {
    switch(sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'downloads':
        return parseInt(b.downloads) - parseInt(a.downloads);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'recent':
        return b.id - a.id;
      default:
        return 0;
    }
  });

  // Handle install/uninstall
  const handleInstallToggle = (appId) => {
    if (installedApps.includes(appId)) {
      setInstalledApps(installedApps.filter(id => id !== appId));
    } else {
      setInstalledApps([...installedApps, appId]);
    }
  };

  // Stats
  const stats = {
    totalApps: apps.length,
    installedApps: installedApps.length,
    freeApps: apps.filter(app => app.price === 'Free').length,
    premiumApps: apps.filter(app => app.price === 'Premium').length
  };

  return (
    <div className="app-store-page">
      {/* Hero Section */}
      <section className="app-store-hero">
        <div className="app-store-hero-content">
          <h1>DevStorm <span className="app-store-gradient-text">App Store</span></h1>
          <p className="app-store-hero-subtitle">
            Discover powerful developer tools, enhance your workflow, and boost productivity.
            Install apps directly to your DevStorm environment.
          </p>
          
          <div className="app-store-search">
            <div className="search-container">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search for apps, tools, or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            <button className="search-filters-btn">
              <i className="fas fa-sliders-h"></i> Filters
            </button>
          </div>
          
          <div className="app-store-hero-stats">
            <div className="app-store-stat">
              <div className="app-store-stat-number">{stats.totalApps}</div>
              <div className="app-store-stat-label">Total Apps</div>
            </div>
            <div className="app-store-stat">
              <div className="app-store-stat-number">{stats.installedApps}</div>
              <div className="app-store-stat-label">Installed</div>
            </div>
            <div className="app-store-stat">
              <div className="app-store-stat-number">{stats.freeApps}</div>
              <div className="app-store-stat-label">Free Apps</div>
            </div>
            <div className="app-store-stat">
              <div className="app-store-stat-number">{stats.premiumApps}</div>
              <div className="app-store-stat-label">Premium</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="app-store-container">
        {/* Categories & Filters */}
        <div className="app-store-controls">
          <div className="categories-section">
            <h3><i className="fas fa-th-large"></i> Categories</h3>
            <div className="categories-list">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                  {category !== 'All' && (
                    <span className="category-count">
                      {apps.filter(app => app.category === category).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="sort-section">
            <h3><i className="fas fa-sort-amount-down"></i> Sort By</h3>
            <div className="sort-options">
              <button 
                className={`sort-option ${sortBy === 'rating' ? 'active' : ''}`}
                onClick={() => setSortBy('rating')}
              >
                <i className="fas fa-star"></i> Rating
              </button>
              <button 
                className={`sort-option ${sortBy === 'downloads' ? 'active' : ''}`}
                onClick={() => setSortBy('downloads')}
              >
                <i className="fas fa-download"></i> Downloads
              </button>
              <button 
                className={`sort-option ${sortBy === 'name' ? 'active' : ''}`}
                onClick={() => setSortBy('name')}
              >
                <i className="fas fa-font"></i> Name
              </button>
              <button 
                className={`sort-option ${sortBy === 'recent' ? 'active' : ''}`}
                onClick={() => setSortBy('recent')}
              >
                <i className="fas fa-clock"></i> Recent
              </button>
            </div>
          </div>
          
          <div className="quick-stats">
            <h3><i className="fas fa-chart-line"></i> Quick Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon">
                  <i className="fas fa-check-circle" style={{ color: '#00cc88' }}></i>
                </div>
                <div className="stat-info">
                  <div className="stat-number">{stats.installedApps}</div>
                  <div className="stat-label">Installed</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <i className="fas fa-clock" style={{ color: '#ff9966' }}></i>
                </div>
                <div className="stat-info">
                  <div className="stat-number">{stats.totalApps - stats.installedApps}</div>
                  <div className="stat-label">Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Apps Grid */}
        <div className="apps-grid-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-th"></i> {selectedCategory} Apps
              <span className="apps-count">({filteredApps.length} apps)</span>
            </h2>
            <div className="view-controls">
              <button className="view-btn active">
                <i className="fas fa-th-large"></i> Grid
              </button>
              <button className="view-btn">
                <i className="fas fa-list"></i> List
              </button>
            </div>
          </div>
          
          <div className="apps-grid">
            {sortedApps.map(app => (
              <div key={app.id} className="app-card">
                <div className="app-card-header">
                  <div className="app-icon" style={{ backgroundColor: `${app.color}20` }}>
                    <i className={app.icon} style={{ color: app.color }}></i>
                  </div>
                  <div className="app-badges">
                    <span className={`app-price-badge ${app.price === 'Premium' ? 'premium' : 'free'}`}>
                      {app.price}
                    </span>
                    {installedApps.includes(app.id) && (
                      <span className="installed-badge">
                        <i className="fas fa-check"></i> Installed
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="app-card-body">
                  <h3 className="app-name">{app.name}</h3>
                  <p className="app-category">{app.category}</p>
                  <p className="app-description">{app.description}</p>
                  
                  <div className="app-features">
                    {app.features.slice(0, 3).map((feature, idx) => (
                      <span key={idx} className="app-feature">
                        <i className="fas fa-check-circle"></i> {feature}
                      </span>
                    ))}
                  </div>
                  
                  <div className="app-stats">
                    <div className="app-stat">
                      <i className="fas fa-star" style={{ color: '#ffcc00' }}></i>
                      <span>{app.rating}</span>
                    </div>
                    <div className="app-stat">
                      <i className="fas fa-download"></i>
                      <span>{app.downloads}</span>
                    </div>
                    <div className="app-stat">
                      <i className="fas fa-hdd"></i>
                      <span>{app.size}</span>
                    </div>
                  </div>
                </div>
                
                <div className="app-card-footer">
                  <button 
                    className="app-details-btn"
                    onClick={() => setSelectedApp(app)}
                  >
                    <i className="fas fa-info-circle"></i> Details
                  </button>
                  <button 
                    className={`install-btn ${installedApps.includes(app.id) ? 'installed' : ''}`}
                    onClick={() => handleInstallToggle(app.id)}
                  >
                    {installedApps.includes(app.id) ? (
                      <>
                        <i className="fas fa-check"></i> Installed
                      </>
                    ) : (
                      <>
                        <i className="fas fa-download"></i> Install
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Installed Apps Section */}
        <div className="installed-apps-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-check-circle" style={{ color: '#00cc88' }}></i> Installed Apps
              <span className="apps-count">({installedApps.length} apps)</span>
            </h2>
            <button className="manage-apps-btn">
              <i className="fas fa-cog"></i> Manage
            </button>
          </div>
          
          {installedApps.length > 0 ? (
            <div className="installed-apps-list">
              {apps
                .filter(app => installedApps.includes(app.id))
                .map(app => (
                  <div key={app.id} className="installed-app-item">
                    <div className="installed-app-info">
                      <div className="installed-app-icon" style={{ backgroundColor: `${app.color}20` }}>
                        <i className={app.icon} style={{ color: app.color }}></i>
                      </div>
                      <div className="installed-app-details">
                        <h4>{app.name}</h4>
                        <p>Version {app.version} • Updated {app.lastUpdated}</p>
                      </div>
                    </div>
                    <div className="installed-app-actions">
                      <button className="app-action-btn">
                        <i className="fas fa-play"></i> Launch
                      </button>
                      <button className="app-action-btn">
                        <i className="fas fa-cog"></i> Settings
                      </button>
                      <button 
                        className="app-action-btn uninstall-btn"
                        onClick={() => handleInstallToggle(app.id)}
                      >
                        <i className="fas fa-trash"></i> Uninstall
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          ) : (
            <div className="no-apps-message">
              <i className="fas fa-box-open"></i>
              <h3>No Apps Installed</h3>
              <p>Install some apps to get started with DevStorm!</p>
            </div>
          )}
        </div>
      </div>

      {/* App Detail Modal */}
      {selectedApp && (
        <div className="app-detail-modal">
          <div className="modal-overlay" onClick={() => setSelectedApp(null)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-app-info">
                <div className="modal-app-icon" style={{ backgroundColor: `${selectedApp.color}20` }}>
                  <i className={selectedApp.icon} style={{ color: selectedApp.color }}></i>
                </div>
                <div>
                  <h2>{selectedApp.name}</h2>
                  <p className="modal-app-category">{selectedApp.category}</p>
                </div>
              </div>
              <button 
                className="modal-close-btn"
                onClick={() => setSelectedApp(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="modal-screenshots">
                {selectedApp.screenshots.map((screenshot, idx) => (
                  <div key={idx} className="screenshot-item">
                    <img src={screenshot} alt={`${selectedApp.name} screenshot ${idx + 1}`} />
                  </div>
                ))}
              </div>
              
              <div className="modal-details">
                <div className="detail-section">
                  <h3><i className="fas fa-info-circle"></i> Description</h3>
                  <p>{selectedApp.description}</p>
                </div>
                
                <div className="detail-section">
                  <h3><i className="fas fa-star"></i> Features</h3>
                  <ul className="features-list">
                    {selectedApp.features.map((feature, idx) => (
                      <li key={idx}>
                        <i className="fas fa-check-circle" style={{ color: '#00cc88' }}></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="detail-section">
                  <h3><i className="fas fa-chart-bar"></i> App Info</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Version</span>
                      <span className="info-value">{selectedApp.version}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Size</span>
                      <span className="info-value">{selectedApp.size}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Downloads</span>
                      <span className="info-value">{selectedApp.downloads}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Rating</span>
                      <span className="info-value">
                        <i className="fas fa-star" style={{ color: '#ffcc00' }}></i>
                        {selectedApp.rating}/5.0
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Last Updated</span>
                      <span className="info-value">{selectedApp.lastUpdated}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Price</span>
                      <span className={`info-value ${selectedApp.price === 'Premium' ? 'premium' : 'free'}`}>
                        {selectedApp.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="modal-secondary-btn"
                onClick={() => setSelectedApp(null)}
              >
                Cancel
              </button>
              <button 
                className={`modal-primary-btn ${installedApps.includes(selectedApp.id) ? 'installed' : ''}`}
                onClick={() => {
                  handleInstallToggle(selectedApp.id);
                  setSelectedApp(null);
                }}
              >
                {installedApps.includes(selectedApp.id) ? (
                  <>
                    <i className="fas fa-check"></i> Installed
                  </>
                ) : selectedApp.price === 'Premium' ? (
                  <>
                    <i className="fas fa-crown"></i> Get Premium
                  </>
                ) : (
                  <>
                    <i className="fas fa-download"></i> Install Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DvsStore;