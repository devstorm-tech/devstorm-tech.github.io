import React from 'react';
import { Link } from 'react-router-dom';
import './News.css';

const News = () => {
    const featuredArticle = {
        id: 1,
        title: 'DevStorm Cloud Linux Now Available',
        excerpt: 'We\'re excited to announce the official launch of DevStorm Cloud Linux (DCL), giving developers instant access to Linux environments in their browser.',
        category: 'Announcement',
        date: 'March 15, 2024',
        readTime: '5 min read',
        image: '📈',
        color: 'news-featured-blue'
    };

    const articles = [
        {
            id: 2,
            title: 'Mastering React Hooks in 2024',
            excerpt: 'Learn how to use the latest React hooks and best practices for building modern web applications.',
            category: 'Tutorial',
            date: 'March 10, 2024',
            readTime: '8 min read',
            image: '⚛️',
            color: 'news-article-purple'
        },
        {
            id: 3,
            title: 'Security Testing Labs: New Features',
            excerpt: 'Our security testing platform now includes advanced penetration testing tools and vulnerable applications.',
            category: 'Update',
            date: 'March 5, 2024',
            readTime: '6 min read',
            image: '🔒',
            color: 'news-article-green'
        },
        {
            id: 4,
            title: 'Interview with Our Lead Developer',
            excerpt: 'We sit down with Hussien Hazem to discuss modern web development trends and career advice.',
            category: 'Interview',
            date: 'February 28, 2024',
            readTime: '7 min read',
            image: '🎤',
            color: 'news-article-orange'
        },
        {
            id: 5,
            title: 'Python 3.12 Performance Improvements',
            excerpt: 'Discover how the latest Python version can speed up your applications by up to 15%.',
            category: 'Technology',
            date: 'February 20, 2024',
            readTime: '10 min read',
            image: '🐍',
            color: 'news-article-red'
        },
        {
            id: 6,
            title: 'Building REST APIs with Laravel',
            excerpt: 'A comprehensive guide to creating scalable and secure REST APIs using Laravel.',
            category: 'Tutorial',
            date: 'February 15, 2024',
            readTime: '12 min read',
            image: '🚀',
            color: 'news-article-blue'
        }
    ];

    const categories = [
        { name: 'All', count: 12 },
        { name: 'Announcements', count: 3 },
        { name: 'Tutorials', count: 5 },
        { name: 'Updates', count: 2 },
        { name: 'Technology', count: 4 },
        { name: 'Community', count: 2 }
    ];

    const popularTags = [
        'React', 'JavaScript', 'Python', 'Laravel', 'Security',
        'DevOps', 'Cloud', 'Web Development', 'AI', 'Career'
    ];

    const newsletterArticles = [
        {
            title: 'Monthly Developer Survey Results',
            excerpt: 'See what technologies developers are most excited about in 2024.',
            date: 'March 1, 2024'
        },
        {
            title: 'New Course: Advanced Node.js',
            excerpt: 'Learn advanced Node.js patterns and performance optimization.',
            date: 'February 25, 2024'
        },
        {
            title: 'Community Spotlight: Student Projects',
            excerpt: 'Amazing projects built by our community members.',
            date: 'February 18, 2024'
        }
    ];

    return (
        <div className="news-page">
            {/* Hero Section */}
            <section className="news-hero">
                <div className="news-container">
                    <div className="news-hero-content">
                        <h1 className="news-hero-title">
                            DevStorm <span className="news-gradient-text">News & Blog</span>
                        </h1>
                        <p className="news-hero-subtitle">
                            Stay updated with the latest tutorials, announcements, and insights from the DevStorm team.
                        </p>
                        
                        <div className="news-hero-search">
                            <div className="news-search-bar">
                                <i className="fas fa-search news-search-icon"></i>
                                <input 
                                    type="text" 
                                    className="news-search-input" 
                                    placeholder="Search articles, tutorials, and news..."
                                />
                                <button className="news-search-btn">Search</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="news-container">
                <div className="news-layout">
                    {/* Main Content */}
                    <main className="news-main">
                        {/* Featured Article */}
                        <section className="news-featured-section">
                            <h2 className="news-section-title">Featured Article</h2>
                            <div className={`news-featured-card ${featuredArticle.color}`}>
                                <div className="news-featured-badge">Featured</div>
                                <div className="news-featured-content">
                                    <div className="news-featured-category">{featuredArticle.category}</div>
                                    <h3 className="news-featured-title">{featuredArticle.title}</h3>
                                    <p className="news-featured-excerpt">{featuredArticle.excerpt}</p>
                                    <div className="news-featured-meta">
                                        <span className="news-meta-date">
                                            <i className="far fa-calendar"></i> {featuredArticle.date}
                                        </span>
                                        <span className="news-meta-time">
                                            <i className="far fa-clock"></i> {featuredArticle.readTime}
                                        </span>
                                    </div>
                                    <button className="news-read-btn">Read Full Article</button>
                                </div>
                                <div className="news-featured-image">
                                    {featuredArticle.image}
                                </div>
                            </div>
                        </section>

                        {/* Latest Articles */}
                        <section className="news-articles-section">
                            <div className="news-section-header">
                                <h2 className="news-section-title">Latest Articles</h2>
                                <div className="news-sort-options">
                                    <select className="news-sort-select">
                                        <option>Latest</option>
                                        <option>Popular</option>
                                        <option>Trending</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="news-articles-grid">
                                {articles.map((article) => (
                                    <div key={article.id} className="news-article-card">
                                        <div className={`news-article-image ${article.color}`}>
                                            {article.image}
                                        </div>
                                        <div className="news-article-content">
                                            <div className="news-article-category">{article.category}</div>
                                            <h3 className="news-article-title">{article.title}</h3>
                                            <p className="news-article-excerpt">{article.excerpt}</p>
                                            <div className="news-article-meta">
                                                <span className="news-meta-date">
                                                    <i className="far fa-calendar"></i> {article.date}
                                                </span>
                                                <span className="news-meta-time">
                                                    <i className="far fa-clock"></i> {article.readTime}
                                                </span>
                                            </div>
                                            <button className="news-read-more-btn">
                                                Read More <i className="fas fa-arrow-right"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Pagination */}
                        <div className="news-pagination">
                            <button className="news-pagination-btn news-pagination-prev">
                                <i className="fas fa-chevron-left"></i> Previous
                            </button>
                            <div className="news-pagination-numbers">
                                <button className="news-page-btn active">1</button>
                                <button className="news-page-btn">2</button>
                                <button className="news-page-btn">3</button>
                                <span className="news-page-dots">...</span>
                                <button className="news-page-btn">5</button>
                            </div>
                            <button className="news-pagination-btn news-pagination-next">
                                Next <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </main>

                    {/* Sidebar */}
                    <aside className="news-sidebar">
                        {/* Categories */}
                        <div className="news-sidebar-card">
                            <h3 className="news-sidebar-title">Categories</h3>
                            <ul className="news-categories-list">
                                {categories.map((category, index) => (
                                    <li key={index} className="news-category-item">
                                        <button className="news-category-btn">
                                            <span className="news-category-name">{category.name}</span>
                                            <span className="news-category-count">{category.count}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Popular Tags */}
                        <div className="news-sidebar-card">
                            <h3 className="news-sidebar-title">Popular Tags</h3>
                            <div className="news-tags">
                                {popularTags.map((tag, index) => (
                                    <button key={index} className="news-tag">{tag}</button>
                                ))}
                            </div>
                        </div>

                        {/* Newsletter */}
                        <div className="news-sidebar-card news-newsletter-card">
                            <h3 className="news-sidebar-title">Stay Updated</h3>
                            <p className="news-newsletter-text">
                                Subscribe to our newsletter and never miss an update.
                            </p>
                            <form className="news-newsletter-form">
                                <input 
                                    type="email" 
                                    className="news-newsletter-input" 
                                    placeholder="Your email address"
                                />
                                <button type="submit" className="news-newsletter-btn">
                                    Subscribe
                                </button>
                            </form>
                        </div>

                        {/* Recent from Newsletter */}
                        <div className="news-sidebar-card">
                            <h3 className="news-sidebar-title">From Newsletter</h3>
                            <div className="news-newsletter-articles">
                                {newsletterArticles.map((article, index) => (
                                    <div key={index} className="news-newsletter-article">
                                        <h4 className="news-newsletter-article-title">{article.title}</h4>
                                        <p className="news-newsletter-article-excerpt">{article.excerpt}</p>
                                        <span className="news-newsletter-article-date">{article.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default News;