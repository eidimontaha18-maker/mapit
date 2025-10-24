import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&h=800&fit=crop',
      title: 'Create Custom Zone Maps',
      description: 'Draw and manage polygon zones on interactive maps for any location worldwide'
    },
    {
      image: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=1200&h=800&fit=crop',
      title: 'Multiple Map Views',
      description: 'Choose from Road, Satellite, Hybrid, and Terrain map types'
    },
    {
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop',
      title: 'Search Any Location',
      description: 'Navigate to any country or city worldwide and create zones for your areas of interest'
    },
    {
      image: 'https://images.unsplash.com/photo-1516383740770-fbcc5ccbece0?w=1200&h=800&fit=crop',
      title: 'Save & Manage Your Maps',
      description: 'Store your maps in the cloud and access them anytime from your dashboard'
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
              <h3>Polygon Zone Drawing</h3>
              <p>Draw custom polygon zones with precise coordinates on any location</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
              <h3>Multiple Map Views</h3>
              <p>Switch between Road, Satellite, Hybrid, and Terrain map layers</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </div>
              <h3>Global Location Search</h3>
              <p>Search and navigate to any country or city worldwide</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                </svg>
              </div>
              <h3>Save & Organize Maps</h3>
              <p>Create unlimited zones per map and manage all your maps from one dashboard</p>
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
