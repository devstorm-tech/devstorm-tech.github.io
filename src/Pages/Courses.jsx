import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Courses.css';

// API base URL
const API_BASE_URL = 'http://localhost:8000/api';

// Utility Functions
const formatPrice = (price) => {
  if (price === null || price === undefined) return '$0.00';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `$${numPrice.toFixed(2)}`;
};

const getCoursePrice = (course) => {
  if (course.discount_price) {
    return {
      final: formatPrice(course.discount_price),
      original: formatPrice(course.price),
      hasDiscount: true
    };
  }
  return {
    final: formatPrice(course.price || 0),
    original: null,
    hasDiscount: false
  };
};

const getCourseLevel = (course) => {
  const level = course.level?.toLowerCase() || 'beginner';
  const levels = {
    beginner: { label: 'Beginner', className: 'courses-level-beginner' },
    intermediate: { label: 'Intermediate', className: 'courses-level-intermediate' },
    advanced: { label: 'Advanced', className: 'courses-level-advanced' }
  };
  return levels[level] || levels.beginner;
};

// Components
const LoadingSpinner = () => (
  <div className="courses-loading">
    <div className="courses-spinner"></div>
    <p>Loading courses...</p>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="courses-error">
    <i className="fas fa-exclamation-triangle courses-error-icon"></i>
    <h3>Unable to Load Courses</h3>
    <p>{error || 'An unexpected error occurred'}</p>
    <button onClick={onRetry} className="courses-retry-btn">
      <i className="fas fa-redo"></i> Try Again
    </button>
  </div>
);

const NoResults = ({ message = "No courses found", subMessage = "Try adjusting your filters or search terms", onReset }) => (
  <div className="courses-no-results">
    <i className="fas fa-search courses-no-results-icon"></i>
    <h3>{message}</h3>
    <p>{subMessage}</p>
    {onReset && (
      <button onClick={onReset} className="courses-reset-btn">
        Reset All Filters
      </button>
    )}
  </div>
);

const CourseCard = ({ course }) => {
  const price = getCoursePrice(course);
  const level = getCourseLevel(course);
  const courseUrl = `/course/${course.id || course.slug}`;
  
  return (
    <div className={`courses-card ${course.color || 'courses-card-blue'}`}>
      <div className="courses-card-header">
        <div className="courses-card-icon">
          <i className={course.icon || 'fas fa-graduation-cap'}></i>
        </div>
        <div className="courses-card-badges">
          <span className={`courses-level-badge ${level.className}`}>
            {level.label}
          </span>
          {course.featured && (
            <span className="courses-featured-badge-small">Featured</span>
          )}
        </div>
      </div>
      
      <div className="courses-card-content">
        <div className="courses-card-category">
          <i className="fas fa-tag"></i>
          <span>{course.category}</span>
        </div>
        
        <h3 className="courses-card-title">{course.title}</h3>
        <p className="courses-card-description">{course.description}</p>
        
        <div className="courses-card-meta">
          <div className="courses-meta-item">
            <i className="far fa-clock"></i>
            <span>{course.duration}</span>
          </div>
          <div className="courses-meta-item">
            <i className="far fa-bookmark"></i>
            <span>{course.lessons || 0} lessons</span>
          </div>
          <div className="courses-meta-item">
            <i className="fas fa-users"></i>
            <span>{(course.students || 0).toLocaleString()}+</span>
          </div>
        </div>
        
        <div className="courses-card-footer">
          <div className="courses-card-instructor">
            <i className="fas fa-user"></i>
            <span>{course.instructor || 'DevStorm Instructor'}</span>
          </div>
          <div className="courses-card-rating">
            <i className="fas fa-star"></i>
            <span>{course.rating || 4.5}</span>
          </div>
        </div>
      </div>
      
      <div className="courses-card-actions">
        <div className="courses-card-price">
          {price.hasDiscount && (
            <span className="courses-price-old">{price.original}</span>
          )}
          <span className="courses-price-new">{price.final}</span>
        </div>
        <Link to={courseUrl} className="courses-card-btn">
          View Course
        </Link>
      </div>
    </div>
  );
};

const FilterPill = ({ label, onRemove }) => (
  <span className="courses-filter-pill">
    {label}
    <button 
      onClick={onRemove} 
      className="courses-filter-remove"
      aria-label={`Remove ${label} filter`}
    >
      ×
    </button>
  </span>
);

const Courses = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialLoadRef = useRef(true);
  const isUpdatingURLRef = useRef(false);
  
  // State
  const [state, setState] = useState({
    allCourses: [], // All courses loaded once
    categories: [],
    loading: true,
    error: null
  });
  
  const [filters, setFilters] = useState({
    category: 'All',
    search: '',
    difficulty: 'all',
    sort: 'popular'
  });
  
  // Filtered courses based on current filters
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  
  // Difficulty levels
  const difficultyLevels = [
    { id: 'all', name: 'All Levels', color: 'courses-level-all' },
    { id: 'beginner', name: 'Beginner', color: 'courses-level-beginner' },
    { id: 'intermediate', name: 'Intermediate', color: 'courses-level-intermediate' },
    { id: 'advanced', name: 'Advanced', color: 'courses-level-advanced' }
  ];
  
  // Load all data once on mount
  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch all courses
      const coursesResponse = await fetch(`${API_BASE_URL}/courses`);
      if (!coursesResponse.ok) {
        throw new Error(`Failed to fetch courses: ${coursesResponse.status}`);
      }
      
      const coursesData = await coursesResponse.json();
      
      if (!coursesData.success) {
        throw new Error(coursesData.message || 'Invalid API response');
      }
      
      const courses = coursesData.data?.courses || [];
      
      // Extract unique categories from courses
      const uniqueCategories = {};
      courses.forEach(course => {
        const categoryName = course.category;
        if (categoryName && categoryName !== 'All') {
          if (!uniqueCategories[categoryName]) {
            uniqueCategories[categoryName] = 0;
          }
          uniqueCategories[categoryName]++;
        }
      });
      
      // Create categories array
      const allCategories = [
        { id: 'all', name: 'All', count: courses.length }
      ];
      
      // Add categories from unique categories
      Object.entries(uniqueCategories).forEach(([name, count]) => {
        allCategories.push({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          count
        });
      });
      
      setState({
        allCourses: courses,
        categories: allCategories,
        loading: false,
        error: null
      });
      
      // Set featured courses
      const featured = courses.filter(course => course.featured === true).slice(0, 3);
      setFeaturedCourses(featured);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
    }
  }, []);
  
  // Initial load on mount
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      loadData();
    }
  }, [loadData]);
  
  // Parse URL parameters on initial load only
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = { ...filters };
    
    ['category', 'search', 'difficulty', 'sort'].forEach(key => {
      const value = params.get(key);
      if (value) {
        if (key === 'category') {
          newFilters[key] = value.charAt(0).toUpperCase() + value.slice(1);
        } else {
          newFilters[key] = value;
        }
      }
    });
    
    // Only update filters if they're different from initial state
    const hasChanges = Object.keys(newFilters).some(key => newFilters[key] !== filters[key]);
    if (hasChanges) {
      setFilters(newFilters);
    }
  }, []); // Empty dependency array - runs only once on mount
  
  // Apply filters whenever filters or allCourses change
  useEffect(() => {
    if (state.allCourses.length === 0) return;
    
    let filtered = [...state.allCourses];
    
    // Category filter - show all if "All" is selected
    if (filters.category !== 'All') {
      filtered = filtered.filter(course => course.category === filters.category);
    }
    
    // Difficulty filter
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(course => 
        (course.level || 'beginner').toLowerCase() === filters.difficulty
      );
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchTerm) ||
        course.description?.toLowerCase().includes(searchTerm) ||
        course.instructor?.toLowerCase().includes(searchTerm) ||
        course.category?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort courses
    filtered.sort((a, b) => {
      switch (filters.sort) {
        case 'newest':
          const dateA = a.published_at || a.created_at || a.id;
          const dateB = b.published_at || b.created_at || b.id;
          return new Date(dateB) - new Date(dateA);
        case 'price_low':
          return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
        case 'price_high':
          return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
        case 'rating':
          return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
        case 'popular':
        default:
          return (b.students || 0) - (a.students || 0);
      }
    });
    
    setFilteredCourses(filtered);
  }, [state.allCourses, filters]);
  
  // Update URL when filters change - immediate update, no debounce
  useEffect(() => {
    if (isUpdatingURLRef.current) return;
    
    const params = new URLSearchParams();
    
    if (filters.category !== 'All') {
      params.append('category', filters.category.toLowerCase());
    }
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    
    if (filters.difficulty !== 'all') {
      params.append('difficulty', filters.difficulty);
    }
    
    if (filters.sort !== 'popular') {
      params.append('sort', filters.sort);
    }
    
    const queryString = params.toString();
    const currentQueryString = location.search.replace('?', '');
    
    if (queryString !== currentQueryString) {
      isUpdatingURLRef.current = true;
      navigate(queryString ? `?${queryString}` : '/courses', { 
        replace: true,
        state: { fromFilterChange: true }
      });
      
      // Reset the flag after navigation
      setTimeout(() => {
        isUpdatingURLRef.current = false;
      }, 100);
    }
  }, [filters, navigate, location.search]);
  
  // Filter handlers - immediate update
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const handleCategoryChange = useCallback((category) => {
    // If clicking the same category, do nothing
    if (filters.category === category) return;
    
    updateFilter('category', category);
  }, [filters.category, updateFilter]);
  
  const handleDifficultyChange = useCallback((difficulty) => {
    updateFilter('difficulty', difficulty);
  }, [updateFilter]);
  
  const handleSortChange = useCallback((e) => {
    updateFilter('sort', e.target.value);
  }, [updateFilter]);
  
  const handleSearch = useCallback((e) => {
    e.preventDefault();
  }, []);
  
  const handleSearchChange = useCallback((value) => {
    updateFilter('search', value);
  }, [updateFilter]);
  
  const clearFilter = useCallback((filterKey, defaultValue) => {
    setFilters(prev => ({ ...prev, [filterKey]: defaultValue }));
  }, []);
  
  const clearAllFilters = useCallback(() => {
    setFilters({
      category: 'All',
      search: '',
      difficulty: 'all',
      sort: 'popular'
    });
  }, []);
  
  // Render active filters
  const renderActiveFilters = () => {
    const activeFilters = [];
    
    if (filters.category !== 'All') {
      activeFilters.push({
        key: 'category',
        label: `Category: ${filters.category}`
      });
    }
    
    if (filters.difficulty !== 'all') {
      const difficulty = difficultyLevels.find(d => d.id === filters.difficulty);
      activeFilters.push({
        key: 'difficulty',
        label: `Level: ${difficulty?.name || filters.difficulty}`
      });
    }
    
    if (filters.search) {
      activeFilters.push({
        key: 'search',
        label: `Search: "${filters.search}"`
      });
    }
    
    if (filters.sort !== 'popular') {
      activeFilters.push({
        key: 'sort',
        label: `Sort: ${filters.sort}`
      });
    }
    
    if (activeFilters.length === 0) return null;
    
    return (
      <div className="courses-active-filters">
        <div className="courses-filters-header">
          <span className="courses-filters-label">Active Filters:</span>
          <button 
            onClick={clearAllFilters} 
            className="courses-clear-all-btn"
          >
            Clear All
          </button>
        </div>
        <div className="courses-filters-list">
          {activeFilters.map(filter => (
            <FilterPill
              key={filter.key}
              label={filter.label}
              onRemove={() => {
                const defaultValue = {
                  category: 'All',
                  difficulty: 'all',
                  search: '',
                  sort: 'popular'
                }[filter.key];
                clearFilter(filter.key, defaultValue);
              }}
            />
          ))}
        </div>
      </div>
    );
  };
  
  // Group courses by category for display
  const groupCoursesByCategory = () => {
    const grouped = {};
    
    filteredCourses.forEach(course => {
      const category = course.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(course);
    });
    
    return grouped;
  };
  
  // Render courses by category
  const renderCoursesByCategory = () => {
    if (filteredCourses.length === 0) {
      return (
        <NoResults 
          message={`No courses found in ${filters.category}`}
          subMessage="Try selecting a different category or clearing filters"
          onReset={clearAllFilters}
        />
      );
    }
    
    if (filters.category === 'All') {
      // Group by category and show all categories
      const groupedCourses = groupCoursesByCategory();
      const categoriesToShow = state.categories
        .filter(cat => cat.name !== 'All' && groupedCourses[cat.name]?.length > 0)
        .sort((a, b) => b.count - a.count);
      
      return categoriesToShow.map(category => {
        const coursesInCategory = groupedCourses[category.name] || [];
        
        return (
          <section key={category.id} className="courses-category-section">
            <div className="courses-category-header">
              <h3 className="courses-category-title">
                {category.name}
                <span className="courses-category-count"> ({coursesInCategory.length})</span>
              </h3>
              <button 
                className="courses-category-view-all"
                onClick={() => handleCategoryChange(category.name)}
              >
                View All →
              </button>
            </div>
            <div className="courses-grid">
              {coursesInCategory.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        );
      });
    } else {
      // Show all courses in selected category
      return (
        <section className="courses-category-section">
          <div className="courses-category-header">
            <h3 className="courses-category-title">
              {filters.category}
              <span className="courses-category-count"> ({filteredCourses.length})</span>
            </h3>
            <button 
              className="courses-category-view-all"
              onClick={clearAllFilters}
            >
              ← Back to All Categories
            </button>
          </div>
          <div className="courses-grid">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      );
    }
  };
  
  // Loading state
  if (state.loading) {
    return (
      <div className="courses-page">
        <div className="courses-container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }
  
  // Error state
  if (state.error) {
    return (
      <div className="courses-page">
        <div className="courses-container">
          <ErrorState error={state.error} onRetry={loadData} />
        </div>
      </div>
    );
  }
  
  return (
    <div className="courses-page">
      {/* Hero Section */}
      <section className="courses-hero">
        <div className="courses-container">
          <div className="courses-hero-content">
            <h1 className="courses-hero-title">
              Explore Our <span className="courses-gradient-text">Courses</span>
            </h1>
            <p className="courses-hero-subtitle">
              Master programming with hands-on courses taught by industry experts. 
              Start your journey today.
            </p>
            
            <form onSubmit={handleSearch} className="courses-hero-search">
              <div className="courses-search-bar">
                <i className="fas fa-search courses-search-icon"></i>
                <input 
                  type="text" 
                  className="courses-search-input" 
                  placeholder="Search courses by title, topic, or instructor..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                <button type="submit" className="courses-search-btn">
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      
      <div className="courses-container">
        {/* Active Filters */}
        {renderActiveFilters()}
        
        {/* Categories Filter */}
        <section className="courses-categories-section">
          <h2 className="courses-section-title">Browse by Category</h2>
          <div className="courses-categories">
            {state.categories.map(category => (
              <button
                key={category.id}
                className={`courses-category-btn ${filters.category === category.name ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.name)}
              >
                <span className="courses-category-name">{category.name}</span>
                <span className="courses-category-count">{category.count}</span>
              </button>
            ))}
          </div>
        </section>
        
        {/* Filters Section */}
        <section className="courses-filters-section">
          <div className="courses-filters-grid">
            {/* Difficulty Filter */}
            <div className="courses-filter-group">
              <h3 className="courses-filter-title">Filter by Difficulty</h3>
              <div className="courses-levels">
                {difficultyLevels.map(level => (
                  <button
                    key={level.id}
                    className={`courses-level-btn ${level.color} ${filters.difficulty === level.id ? 'active' : ''}`}
                    onClick={() => handleDifficultyChange(level.id)}
                  >
                    {level.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Sort Filter */}
            <div className="courses-filter-group">
              <h3 className="courses-filter-title">Sort by</h3>
              <div className="courses-sort">
                <select 
                  className="courses-sort-select"
                  value={filters.sort}
                  onChange={handleSortChange}
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Courses */}
        {featuredCourses.length > 0 && (
          <section className="courses-featured-section">
            <div className="courses-section-header">
              <h2 className="courses-section-title">Featured Courses</h2>
              <span className="courses-featured-badge">Most Popular</span>
            </div>
            <div className="courses-featured-grid">
              {featuredCourses.map(course => {
                const price = getCoursePrice(course);
                return (
                  <div key={course.id} className="courses-featured-card">
                    <div className="courses-featured-badge">Featured</div>
                    <div className="courses-featured-content">
                      <h3 className="courses-featured-title">{course.title}</h3>
                      <p className="courses-featured-description">{course.description}</p>
                      <div className="courses-featured-meta">
                        <span className="courses-featured-category">{course.category}</span>
                        <span className="courses-featured-duration">{course.duration}</span>
                        <span className="courses-featured-rating">
                          <i className="fas fa-star"></i> {course.rating}
                        </span>
                      </div>
                      <div className="courses-featured-price">
                        {price.hasDiscount && (
                          <span className="courses-price-old">{price.original}</span>
                        )}
                        <span className="courses-price-new">{price.final}</span>
                      </div>
                      <Link 
                        to={`/course/${course.id}`} 
                        className="courses-enroll-btn"
                      >
                        Enroll Now
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
        
        {/* Courses Section */}
        <section className="courses-all-section">
          <div className="courses-section-header">
            <h2 className="courses-section-title">
              {filters.category === 'All' ? 'All Courses' : filters.category}
              <span className="courses-results-count">
                ({filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'})
              </span>
            </h2>
          </div>
          
          {renderCoursesByCategory()}
        </section>
        
        {/* CTA Section */}
        <section className="courses-cta-section">
          <div className="courses-cta-card">
            <div className="courses-cta-content">
              <h2 className="courses-cta-title">Ready to Start Learning?</h2>
              <p className="courses-cta-text">
                Join thousands of developers who have transformed their careers with DevStorm.
              </p>
              <div className="courses-cta-buttons">
                <button 
                  className="courses-cta-btn courses-cta-btn-primary"
                  onClick={clearAllFilters}
                >
                  Browse All Courses
                </button>
                <Link to="/signup" className="courses-cta-btn courses-cta-btn-outline">
                  Create Free Account
                </Link>
              </div>
            </div>
            <div className="courses-cta-code">
              <pre>
                {`// Start your learning journey
const developer = new Developer();
DevStorm.transform(developer);`}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Courses