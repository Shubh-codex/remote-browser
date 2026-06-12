"use client";

import BrowserViewer from "@/Components/BrowserViewer";

export default function Home() {
  const startBrowser = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/start`, { method: "POST" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #050a07;
          color: #c8f5d8;
          min-height: 100vh;
        }

        .page-root {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 40% at 50% 0%, rgba(0, 255, 130, 0.06) 0%, transparent 60%),
            #050a07;
          padding: 32px 40px;
          font-family: 'Rajdhani', sans-serif;
        }

        /* Subtle grid bg */
        .page-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,255,130,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,130,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        .page-content {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
        }

        /* ── Header ── */
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(0, 255, 130, 0.12);
        }

        .page-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .page-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 4px;
          color: rgba(0, 255, 130, 0.5);
          text-transform: uppercase;
        }

        .page-title {
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #e8fff0;
          line-height: 1;
          text-shadow: 0 0 40px rgba(0, 255, 130, 0.3);
        }

        .page-title span {
          color: #00ff88;
        }

        /* ── Start Button ── */
        .start-btn {
          position: relative;
          padding: 12px 28px;
          background: transparent;
          border: 1px solid rgba(0, 255, 130, 0.5);
          color: #00ff88;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 3px;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 3px;
          overflow: hidden;
          transition: color 0.25s;
        }

        .start-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          transform: translateY(100%);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 0;
        }

        .start-btn:hover::before { transform: translateY(0); }
        .start-btn:hover { color: #000; }

        .start-btn span {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .start-btn-dot {
          width: 6px;
          height: 6px;
          background: currentColor;
          border-radius: 50%;
          animation: blink 1.4s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        /* ── Panel ── */
        .browser-panel {
          background: rgba(0, 10, 5, 0.8);
          border: 1px solid rgba(0, 255, 130, 0.15);
          border-radius: 6px;
          padding: 20px;
          backdrop-filter: blur(8px);
          box-shadow:
            0 0 0 1px rgba(0, 255, 130, 0.04),
            0 24px 60px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(0, 255, 130, 0.08);
        }

        .panel-topbar {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(0, 255, 130, 0.08);
        }

        .panel-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .panel-dot:nth-child(1) { background: #ff4d6d; }
        .panel-dot:nth-child(2) { background: #ffc13b; }
        .panel-dot:nth-child(3) { background: #00ff88; }

        .panel-label {
          margin-left: 8px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: rgba(0, 255, 130, 0.35);
          letter-spacing: 2px;
        }
      `}</style>

      <div className="page-root">
        <div className="page-content">
          <header className="page-header">
            <div className="page-header-left">
              <span className="page-label">// system access</span>
              <h1 className="page-title">Remote<span>Browser</span></h1>
            </div>
            <button className="start-btn" onClick={startBrowser}>
              <span>
                <span className="start-btn-dot" />
                Initialize
              </span>
            </button>
          </header>

          <div className="browser-panel">
            <div className="panel-topbar">
              <div className="panel-dot" />
              <div className="panel-dot" />
              <div className="panel-dot" />
              <span className="panel-label">stream.session.active</span>
            </div>
            <BrowserViewer />
          </div>
        </div>
      </div>
    </>
  );
}