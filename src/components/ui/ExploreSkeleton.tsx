import React from 'react';

export const ExploreSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% {
            background-color: rgba(255, 255, 255, 0.03);
          }
          50% {
            background-color: rgba(255, 255, 255, 0.08);
          }
        }
        .pulse-box {
          animation: skeleton-pulse 1.5s infinite ease-in-out;
          border-radius: 8px;
        }
        .skeleton-card {
          background: rgba(10, 16, 32, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
      `}</style>

      {/* Header Bar Skeleton */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          paddingBottom: '16px',
          marginBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="pulse-box" style={{ height: '24px', width: '100px' }} />
          <div className="pulse-box" style={{ height: '14px', width: '80px' }} />
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="pulse-box" style={{ height: '36px', width: '240px', borderRadius: '6px' }} />
          <div className="pulse-box" style={{ height: '36px', width: '90px', borderRadius: '6px' }} />
          <div className="pulse-box" style={{ height: '36px', width: '36px', borderRadius: '6px' }} />
          <div className="pulse-box" style={{ height: '36px', width: '36px', borderRadius: '6px' }} />
          <div className="pulse-box" style={{ height: '36px', width: '100px', borderRadius: '6px' }} />
        </div>
      </div>

      {/* Top Banner Cards Grid Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Alerts Banner Skeleton */}
        <div className="skeleton-card" style={{ height: '170px', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <div className="pulse-box" style={{ height: '18px', width: '180px' }} />
          <div className="pulse-box" style={{ height: '12px', width: '260px' }} />
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <div className="pulse-box" style={{ height: '34px', width: '120px', borderRadius: '6px' }} />
            <div className="pulse-box" style={{ height: '34px', width: '90px', borderRadius: '6px' }} />
          </div>
        </div>

        {/* WebSocket Stream Log Skeleton */}
        <div className="skeleton-card" style={{ height: '170px', alignItems: 'center', justifyContent: 'center' }}>
          <div className="pulse-box" style={{ height: '14px', width: '320px' }} />
        </div>
      </div>

      {/* Tabs Row Skeleton */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
        <div className="pulse-box" style={{ height: '32px', width: '120px', borderRadius: '6px' }} />
        <div className="pulse-box" style={{ height: '32px', width: '120px', borderRadius: '6px' }} />
        <div className="pulse-box" style={{ height: '32px', width: '100px', borderRadius: '6px' }} />
      </div>

      {/* Cards Grid Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton-card" style={{ height: '172px', padding: '16px', gap: '16px' }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="pulse-box" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="pulse-box" style={{ height: '14px', width: '80px' }} />
                  <div className="pulse-box" style={{ height: '10px', width: '60px' }} />
                </div>
              </div>
              <div className="pulse-box" style={{ width: '18px', height: '18px', borderRadius: '4px' }} />
            </div>

            {/* Middle row */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div className="pulse-box" style={{ height: '24px', width: '70px' }} />
              <div className="pulse-box" style={{ height: '16px', width: '50px', borderRadius: '4px' }} />
            </div>

            {/* Bottom buttons row */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="pulse-box" style={{ flex: 1, height: '32px', borderRadius: '6px' }} />
              <div className="pulse-box" style={{ width: '36px', height: '32px', borderRadius: '6px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ExploreSkeleton;
