import React, { useEffect, useRef } from 'react';
import './Courses.css';

const coursesData = [
    {
        id: 1,
        icon: 'fab fa-python',
        title: 'Python Mastery',
        description: 'From basics to advanced topics like data science and machine learning with Python.',
        tags: ['Beginner Friendly', 'Data Science', '120+ Lessons'],
        color: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))'
    },
    {
        id: 2,
        icon: 'fab fa-js-square',
        title: 'Full-Stack JavaScript',
        description: 'Learn to build complete web applications with React, Node.js, and MongoDB.',
        tags: ['Web Development', 'Projects', '95+ Lessons'],
        color: 'linear-gradient(135deg, #f0db4f, #323330)'
    },
    {
        id: 3,
        icon: 'fas fa-server',
        title: 'Cloud & DevOps',
        description: 'Master cloud platforms, containers, and CI/CD to deploy and scale applications.',
        tags: ['Advanced', 'AWS & Docker', '80+ Lessons'],
        color: 'linear-gradient(135deg, #ff9900, #232f3e)'
    },
    {
        id: 4,
        icon: 'fas fa-mobile-alt',
        title: 'Mobile Development',
        description: 'Build native and cross-platform mobile apps with React Native and Flutter.',
        tags: ['Mobile Apps', 'React Native', '70+ Lessons'],
        color: 'linear-gradient(135deg, #61dafb, #764abc)'
    }
];

const Courses = () => {
    const courseRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        courseRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
            courseRefs.current.forEach((ref) => {
                if (ref) observer.unobserve(ref);
            });
        };
    }, []);

    return (
        <section className="courses-section" id="courses">
            <div className="container">
                <div className="section-title">
                    <h2>Popular Courses</h2>
                    <p className="section-subtitle">Start your journey with our most popular courses</p>
                </div>
                
                <div className="courses-grid">
                    {coursesData.map((course, index) => (
                        <div 
                            key={course.id}
                            className="course-card"
                            ref={el => courseRefs.current[index] = el}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="course-icon" style={{ background: course.color }}>
                                <i className={course.icon}></i>
                            </div>
                            <div className="course-content">
                                <h3>{course.title}</h3>
                                <p>{course.description}</p>
                                <div className="course-tags">
                                    {course.tags.map((tag, idx) => (
                                        <span key={idx} className="tag">{tag}</span>
                                    ))}
                                </div>
                                <button className="btn btn-outline course-btn">Start Course</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Courses;
