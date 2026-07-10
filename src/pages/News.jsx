import React from 'react';
import { Link } from 'react-router-dom';
import './News.css';

const News = () => {
    const featuredArticle = {
        id: 1,
        title: 'DevStorm Cloud Linux – Coming Soon: Practice Linux Online',
        excerpt: 'We’re preparing to launch DevStorm Cloud Linux (DCL) – a fully functional Linux environment in your browser. Perfect for learning system administration, bash scripting, and server management. Early access available soon!',
        category: 'Announcement',
        date: 'April 1, 2025',
        readTime: '4 min read',
        image: '🐧',
        color: 'news-featured-blue'
    };

    const articles = [
        {
            id: 2,
            title: 'Security Testing Labs – Ethical Hacking Sandbox',
            excerpt: 'Our upcoming Security Testing Labs will provide isolated environments to practice penetration testing, vulnerability assessment, and network security – all without risk to real systems.',
            category: 'Update',
            date: 'March 28, 2025',
            readTime: '6 min read',
            image: '🔐',
            color: 'news-article-purple'
        },
        {
            id: 3,
            title: 'Track Progress – Measure Your Learning Journey',
            excerpt: 'The new Track Progress feature will give you detailed analytics on your course completion, skill mastery, and daily activity – helping you stay motivated and focused.',
            category: 'Feature',
            date: 'March 20, 2025',
            readTime: '5 min read',
            image: '📊',
            color: 'news-article-green'
        },
        {
            id: 4,
            title: 'Certifications – Validate Your Skills',
            excerpt: 'We’re developing a certification program that will allow you to earn recognised credentials after completing specific learning paths. Boost your resume with DevStorm certificates.',
            category: 'Announcement',
            date: 'March 15, 2025',
            readTime: '7 min read',
            image: '📜',
            color: 'news-article-orange'
        },
        {
            id: 5,
            title: 'DevStorm Cloud Storage – Secure Your Projects',
            excerpt: 'Store and manage all your learning projects, code snippets, and course materials with DCS – a secure, integrated cloud storage solution coming soon to DevStorm.',
            category: 'Update',
            date: 'March 10, 2025',
            readTime: '5 min read',
            image: '☁️',
            color: 'news-article-red'
        },
        {
            id: 6,
            title: 'Community Driven – Join the Conversation',
            excerpt: 'Our new community features will include discussion forums, live Q&A sessions, and peer-to-peer mentorship. Connect with fellow learners and share your journey.',
            category: 'Community',
            date: 'March 5, 2025',
            readTime: '4 min read',
            image: '🤝',
            color: 'news-article-blue'
        }
    ];

    const categories = [
        { name: 'All', count: 12 },
        { name: 'Announcements', count: 3 },
        { name: 'Updates', count: 4 },
        { name: 'Features', count: 2 },
        { name: 'Community', count: 2 },
        { name: 'Technology', count: 1 }
    ];

    const popularTags = [
        'Linux', 'Security', 'Certifications', 'Cloud', 'DevOps',
        'Learning', 'Community', 'Projects', 'Career', 'Workshops'
    ];

    const newsletterArticles = [
        {
            title: 'Beta Access to Cloud Linux – Sign Up Now',
            excerpt: 'Be among the first to test DCL and get early access to all upcoming features.',
            date: 'April 2, 2025'
        },
        {
            title: 'Security Labs: What to Expect',
            excerpt: 'A sneak peek into the tools and environments we’re building for ethical hacking practice.',
            date: 'March 30, 2025'
        },
        {
            title: 'Your Feedback Shapes Our Roadmap',
            excerpt: 'We want to hear from you – what features would you like to see next? Take our survey.',
            date: 'March 25, 2025'
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