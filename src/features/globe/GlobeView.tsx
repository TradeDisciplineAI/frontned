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
  const { activeCountry, flyTo, resumeRotation } = useGlobe(containerRef);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#000',
      }}
      aria-label="Interactive 3D Globe showing live national stock market overlays"
    >
      {/* ── UI Overlay ───────────────────────────────────────────────── */}
      <div
        id="ui-overlay"
        className="home-overlay"
        role="complementary"
        aria-label="Market controls"
      >
        <h1 className="home-overlay-title">National Stock Indices</h1>
        <p className="home-overlay-status">Live WebGL Market Volatility Overlay</p>

        {/* Country legend — now uses <button> for keyboard accessibility */}
        <nav className="country-list" aria-label="Country market selector">
          {NATIONS.map((nation) => (
            <button
              key={nation.name}
              type="button"
              className={`country-item ${activeCountry === nation.name ? 'active' : ''}`}
              onClick={() => flyTo(nation.name, nation.lat, nation.lng)}
              aria-pressed={activeCountry === nation.name}
              aria-label={`Focus globe on ${nation.name}`}
            >
              <div className="country-info">
                <span className="country-flag" aria-hidden="true">
                  {nation.flag}
                </span>
                <span>{nation.name}</span>
              </div>
              <div
                className="country-indicator"
                style={{ color: nation.color, backgroundColor: nation.color }}
                aria-hidden="true"
              />
            </button>
          ))}
        </nav>

        {activeCountry && (
          <button type="button" className="resume-rotate-btn" onClick={resumeRotation}>
            ↺ Resume Rotation
          </button>
        )}

        <button type="button" className="terminal-enter-btn" onClick={onEnterApp}>
          Access Terminal
        </button>
      </div>

      {/* ── Globe Canvas ─────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
        id="globeViz"
        role="img"
        aria-label="3D globe visualization — rotate with mouse, scroll to pan"
      />
    </div>
  );
};
