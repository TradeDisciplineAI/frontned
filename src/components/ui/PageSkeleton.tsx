import React from 'react';

export const PageSkeleton: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
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
          padding: 20px;
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          paddingBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="pulse-box" style={{ height: '32px', width: '240px' }} />
          <div className="pulse-box" style={{ height: '14px', width: '320px' }} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="pulse-box" style={{ height: '38px', width: '120px', borderRadius: '10px' }} />
        </div>
      </div>

      {/* Metric Cards Strip Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-card" style={{ height: '86px', justifyContent: 'center' }}>
            <div className="pulse-box" style={{ height: '12px', width: '100px' }} />
            <div className="pulse-box" style={{ height: '24px', width: '140px' }} />
          </div>
        ))}
      </div>

      {/* Command Bar Skeleton */}
      <div className="skeleton-card" style={{ height: '60px', flexDirection: 'row', alignItems: 'center', gap: '16px', padding: '12px 20px' }}>
        <div className="pulse-box" style={{ height: '36px', flex: 1, borderRadius: '8px' }} />
        <div className="pulse-box" style={{ height: '36px', width: '140px', borderRadius: '8px' }} />
        <div className="pulse-box" style={{ height: '36px', width: '140px', borderRadius: '8px' }} />
      </div>

      {/* Main Content Table/Grid Skeleton */}
      <div className="skeleton-card" style={{ minHeight: '340px', gap: '12px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
          <div className="pulse-box" style={{ height: '14px', width: '120px' }} />
          <div className="pulse-box" style={{ height: '14px', width: '80px' }} />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div className="pulse-box" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
              <div className="pulse-box" style={{ height: '16px', width: '110px' }} />
            </div>
            <div className="pulse-box" style={{ height: '16px', width: '80px' }} />
            <div className="pulse-box" style={{ height: '16px', width: '90px' }} />
            <div className="pulse-box" style={{ height: '28px', width: '100px', borderRadius: '6px' }} />
          </div>
        ))}
      </div>
    </div>
  );
};
