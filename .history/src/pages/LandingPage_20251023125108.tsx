import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&h=800&fit=crop',
      title: 'Create Interactive Zone Maps',
      description: 'Design and manage custom zones on interactive maps with precision and ease'
    },
    {
      image: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=1200&h=800&fit=crop',
      title: 'Multiple Map Types',
      description: 'Support for world maps, country maps, city maps and custom regions'
    },
    {
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop',
      title: 'Draw & Customize Zones',
      description: 'Use powerful drawing tools to create polygons, circles, and complex shapes'
    },
    {
      image: 'https://images.unsplash.com/photo-1516383740770-fbcc5ccbece0?w=1200&h=800&fit=crop',
      title: 'Save & Share Your Maps',
      description: 'Store unlimited zones and share your maps with your team'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="landing-navbar">
        <div className="landing-nav-content">
          <div className="landing-logo">
            <h1>MapIt</h1>
          </div>
          <div className="landing-nav-buttons">
            <button 
              className="nav-btn login-btn" 
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button 
              className="nav-btn register-btn" 
              onClick={() => navigate('/register')}
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Slideshow */}
      <div className="hero-section">
        <div className="slideshow-container">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${slide.image})`
              }}
            >
              <div className="slide-content">
                <h2 className="slide-title">{slide.title}</h2>
                <p className="slide-description">{slide.description}</p>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button className="slide-arrow prev" onClick={prevSlide}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          <button className="slide-arrow next" onClick={nextSlide}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>

          {/* Slide Indicators */}
          <div className="slide-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="features-container">
          <h2 className="features-title">Why Choose MapIt?</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <h3>Intuitive Mapping</h3>
              <p>Easy-to-use interface for creating and managing zones on any type of map</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
              <h3>Multiple Map Types</h3>
              <p>Support for world maps, countries, cities, and custom geographical regions</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"/>
                </svg>
              </div>
              <h3>Powerful Tools</h3>
              <p>Draw polygons, circles, and custom shapes with advanced editing features</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                </svg>
              </div>
              <h3>Secure & Reliable</h3>
              <p>Your maps and data are securely stored and always accessible</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Start Your Free Trial Today</h2>
            <p className="cta-description">
              Create your first map for free! No credit card required.
            </p>
            <div className="cta-features">
              <div className="cta-feature">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>One free map with registration</span>
              </div>
              <div className="cta-feature">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Full access to all map types</span>
              </div>
              <div className="cta-feature">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Unlimited zones per map</span>
              </div>
              <div className="cta-feature">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>No credit card required</span>
              </div>
            </div>
            <button 
              className="cta-button"
              onClick={() => navigate('/register')}
            >
              Get Started Free
            </button>
            <p className="cta-login">
              Already have an account? 
              <button 
                className="cta-login-link"
                onClick={() => navigate('/login')}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p>&copy; 2025 MapIt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
