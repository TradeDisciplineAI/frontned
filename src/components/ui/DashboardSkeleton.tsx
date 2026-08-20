import React from 'react';

export const DashboardSkeleton: React.FC = () => {
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

      {/* Header Skeleton */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="pulse-box" style={{ height: '36px', width: '280px' }} />
          <div className="pulse-box" style={{ height: '16px', width: '360px' }} />
        </div>
        <div
          className="pulse-box"
          style={{ height: '40px', width: '110px', borderRadius: '10px' }}
        />
      </div>

      {/* Main Grid Skeleton */}
      <div className="dashboard-main-grid">
        {/* Left Column Skeleton */}
        <div className="main-left-col">
          {/* Chart Rectangle */}
          <div className="skeleton-card" style={{ height: '400px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="pulse-box" style={{ height: '16px', width: '180px' }} />
              <div className="pulse-box" style={{ height: '14px', width: '90px' }} />
            </div>
            <div className="pulse-box" style={{ flex: 1, width: '100%', borderRadius: '12px' }} />
          </div>

          {/* Holdings Header & Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="pulse-box" style={{ height: '16px', width: '140px' }} />
            <div className="holdings-grid">
              {[1, 2].map((i) => (
                <div key={i} className="skeleton-card" style={{ height: '170px', gap: '14px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div
                        className="pulse-box"
                        style={{ width: '36px', height: '36px', borderRadius: '10px' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div className="pulse-box" style={{ height: '14px', width: '50px' }} />
                        <div className="pulse-box" style={{ height: '10px', width: '70px' }} />
                      </div>
                    </div>
                    <div
                      className="pulse-box"
                      style={{ width: '20px', height: '20px', borderRadius: '6px' }}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      margin: '4px 0',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div className="pulse-box" style={{ height: '24px', width: '80px' }} />
                      <div className="pulse-box" style={{ height: '12px', width: '40px' }} />
                    </div>
                    <div className="pulse-box" style={{ width: '100px', height: '30px' }} />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid rgba(255,255,255,0.03)',
                      paddingTop: '12px',
                    }}
                  >
                    <div className="pulse-box" style={{ height: '10px', width: '90px' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div
                        className="pulse-box"
                        style={{ width: '28px', height: '28px', borderRadius: '8px' }}
                      />
                      <div
                        className="pulse-box"
                        style={{ width: '28px', height: '28px', borderRadius: '8px' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="main-right-col">
          {/* Quick Search */}
          <div className="skeleton-card" style={{ height: '120px', gap: '12px' }}>
            <div className="pulse-box" style={{ height: '14px', width: '120px' }} />
            <div
              className="pulse-box"
              style={{ height: '40px', width: '100%', borderRadius: '10px' }}
            />
            <div className="pulse-box" style={{ height: '12px', width: '160px' }} />
          </div>

          {/* Allocation Circular Chart */}
          <div
            className="skeleton-card"
            style={{ height: '280px', alignItems: 'center', justifyContent: 'center', gap: '16px' }}
          >
            <div
              className="pulse-box"
              style={{ height: '14px', width: '120px', alignSelf: 'flex-start' }}
            />
            <div
              className="pulse-box"
              style={{ width: '140px', height: '140px', borderRadius: '50%' }}
            />
            <div className="pulse-box" style={{ height: '12px', width: '80px' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
