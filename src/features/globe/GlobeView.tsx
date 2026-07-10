import React, { useRef } from 'react';
import { useGlobe } from './useGlobe';
import { NATIONS } from './nations.constants';
import '@/styles/components/overlay.css';
import '@/styles/components/country-list.css';

interface GlobeViewProps {
  onEnterApp: () => void;
}

/**
 * GlobeView — The Home/Landing page component.
 *
 * This is intentionally kept as a thin layout shell.
 * All globe.gl logic lives in the useGlobe() custom hook.
 */
export const GlobeView: React.FC<GlobeViewProps> = ({ onEnterApp }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useGlobe(containerRef);

  return (
    <div className="landing-page">
      {/* ── Fixed Overlays (Visible across scrolling) ────────────────── */}
      <div className="shooting-star-container">
        {/* White Comets */}
        <div className="shooting-star comet-1"></div>
        <div className="shooting-star comet-2"></div>
        <div className="shooting-star comet-3"></div>
        <div className="shooting-star comet-4"></div>
        <div className="shooting-star comet-5"></div>
        
        {/* Violet Comets */}
        <div className="shooting-star violet-comet comet-violet-1"></div>
        <div className="shooting-star violet-comet comet-violet-2"></div>
        <div className="shooting-star violet-comet comet-violet-3"></div>
      </div>

      <div className="twinkling-stars">
        {/* Normal stars */}
        <div className="star star-1"></div>
        <div className="star star-2"></div>
        <div className="star star-3"></div>
        <div className="star star-4"></div>
        <div className="star star-5"></div>
        <div className="star star-6"></div>
        <div className="star star-7"></div>
        <div className="star star-8"></div>
        <div className="star star-9"></div>
        <div className="star star-10"></div>
        
        {/* Big stars */}
        <div className="big-star big-star-1"></div>
        <div className="big-star big-star-2"></div>
        <div className="big-star big-star-3"></div>
        <div className="big-star big-star-4"></div>
        <div className="big-star big-star-5"></div>
        <div className="big-star big-star-6"></div>

        {/* Mega stars */}
        <div className="mega-star mega-star-1"></div>
        <div className="mega-star mega-star-2"></div>
        <div className="mega-star mega-star-3"></div>
      </div>

      {/* ── Section 1: Hero (100vh) ──────────────────────────────────── */}
      <section className="hero-section">
        {/* Navbar */}
        <header className="globe-navbar">
          <div className="nav-brand">
            <span className="logo-icon">x</span>
            <span className="brand-text">Discipline Co-pilot</span>
          </div>
          
          <div className="nav-search">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search (Ctrl+K)" />
          </div>

          <nav className="nav-links">
            <a href="#" className="active">Products</a>
            <a href="#">Community</a>
            <a href="#">Markets</a>
            <a href="#">Brokers</a>
            <a href="#">More</a>
          </nav>

          <div className="nav-profile">
            <button className="nav-login-btn" onClick={onEnterApp}>Log in</button>
          </div>
        </header>

        {/* Hero Content */}
        <div className="globe-hero">
          <h1>Look First Then Leap</h1>
          
          <div className="billing-toggle">
            <label className="radio-label">
              <input type="radio" name="billing" />
              <span className="radio-custom"></span>
              Monthly
            </label>
            <label className="radio-label">
              <input type="radio" name="billing" defaultChecked />
              <span className="radio-custom"></span>
              Annually
            </label>
            <span className="discount-badge">Save up to 17% 🤑</span>
          </div>
        </div>
      </section>

      {/* ── Section 2: Globe (100vh) ─────────────────────────────────── */}
      <section className="globe-section">
        <div className="globe-glow"></div>
        
        <div className="globe-wrapper">
          <div
            ref={containerRef}
            style={{ width: '100%', height: '100%' }}
            id="globeViz"
            role="img"
            aria-label="3D globe visualization"
          />
        </div>
      </section>
    </div>
  );
};
