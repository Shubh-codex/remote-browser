"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function BrowserViewer() {
  const socketRef = useRef<Socket | null>(null);
  const [image, setImage] = useState("");
  const [url, setUrl] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
  const socket = io(process.env.NEXT_PUBLIC_API_URL);
  socketRef.current = socket;

  socket.on("connect", () => {
    setIsConnected(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/start`, { method: "POST" });
  });

  socket.on("disconnect", () => setIsConnected(false));

  socket.on("frame", (frame: string) => {
    setImage(`data:image/jpeg;base64,${frame}`);
    setIsLoading(false);
  });

  socket.on("navigate_error", (data: { message: string }) => {
    console.error("Navigate error:", data.message);
    setIsLoading(false);
  });

  return () => {
    socket.disconnect();
  };
}, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      socketRef.current?.emit("keypress", { key: e.key });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = 1280 / rect.width;
    const scaleY = 720 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    socketRef.current?.emit("click", { x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = 1280 / rect.width;
    const scaleY = 720 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    socketRef.current?.emit("mousemove", { x, y });
  };

  const handleWheel = (e: React.WheelEvent<HTMLImageElement>) => {
    socketRef.current?.emit("scroll", { deltaY: e.deltaY });
  };

  const navigate = () => {
    setIsLoading(true);
    socketRef.current?.emit("navigate", { url });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") navigate();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');

        .bv-root {
          font-family: 'Rajdhani', sans-serif;
        }

        .bv-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          padding: 10px 14px;
          background: rgba(0, 255, 170, 0.04);
          border: 1px solid rgba(0, 255, 170, 0.2);
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }

        .bv-toolbar::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #00ffaa, transparent);
          animation: scanline-h 3s linear infinite;
        }

        @keyframes scanline-h {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .bv-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .bv-status-dot.connected {
          background: #00ffaa;
          box-shadow: 0 0 8px #00ffaa, 0 0 20px rgba(0,255,170,0.4);
          animation: pulse-dot 2s ease-in-out infinite;
        }

        .bv-status-dot.disconnected {
          background: #ff4466;
          box-shadow: 0 0 8px #ff4466;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .bv-url-wrapper {
          flex: 1;
          position: relative;
        }

        .bv-url-prefix {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #00ffaa;
          font-family: 'Share Tech Mono', monospace;
          font-size: 13px;
          pointer-events: none;
          opacity: 0.7;
        }

        .bv-url-input {
          width: 100%;
          padding: 9px 12px 9px 36px;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(0, 255, 170, 0.25);
          border-radius: 3px;
          color: #e0ffe8;
          font-family: 'Share Tech Mono', monospace;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .bv-url-input::placeholder {
          color: rgba(0, 255, 170, 0.3);
        }

        .bv-url-input:focus {
          border-color: #00ffaa;
          box-shadow: 0 0 0 1px rgba(0, 255, 170, 0.2), inset 0 0 20px rgba(0, 255, 170, 0.04);
        }

        .bv-go-btn {
          padding: 9px 20px;
          background: transparent;
          border: 1px solid #00ffaa;
          color: #00ffaa;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 2px;
          cursor: pointer;
          border-radius: 3px;
          text-transform: uppercase;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          white-space: nowrap;
        }

        .bv-go-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #00ffaa;
          transform: translateX(-100%);
          transition: transform 0.2s ease;
          z-index: 0;
        }

        .bv-go-btn:hover::before {
          transform: translateX(0);
        }

        .bv-go-btn:hover {
          color: #000;
        }

        .bv-go-btn span {
          position: relative;
          z-index: 1;
        }

        .bv-screen-wrapper {
          position: relative;
          border: 1px solid rgba(0, 255, 170, 0.3);
          border-radius: 4px;
          overflow: hidden;
          background: #000;
        }

        .bv-screen-wrapper::after {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.08) 2px,
            rgba(0, 0, 0, 0.08) 4px
          );
          pointer-events: none;
          z-index: 2;
        }

        .bv-corner {
          position: absolute;
          width: 16px;
          height: 16px;
          z-index: 3;
          pointer-events: none;
        }
        .bv-corner.tl { top: 0; left: 0; border-top: 2px solid #00ffaa; border-left: 2px solid #00ffaa; }
        .bv-corner.tr { top: 0; right: 0; border-top: 2px solid #00ffaa; border-right: 2px solid #00ffaa; }
        .bv-corner.bl { bottom: 0; left: 0; border-bottom: 2px solid #00ffaa; border-left: 2px solid #00ffaa; }
        .bv-corner.br { bottom: 0; right: 0; border-bottom: 2px solid #00ffaa; border-right: 2px solid #00ffaa; }

        .bv-screen-img {
          width: 100%;
          display: block;
          cursor: crosshair;
        }

        .bv-idle-screen {
          aspect-ratio: 16/9;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: radial-gradient(ellipse at center, rgba(0,255,170,0.04) 0%, #000 70%);
        }

        .bv-idle-icon {
          width: 56px;
          height: 56px;
          border: 2px solid rgba(0, 255, 170, 0.4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: rotate-border 4s linear infinite;
        }

        @keyframes rotate-border {
          0% { box-shadow: 0 0 0 0 rgba(0,255,170,0.4); }
          50% { box-shadow: 0 0 20px 4px rgba(0,255,170,0.15); }
          100% { box-shadow: 0 0 0 0 rgba(0,255,170,0.4); }
        }

        .bv-idle-text {
          color: rgba(0, 255, 170, 0.4);
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .bv-loading-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00ffaa, #00ffaa, transparent);
          animation: loading-sweep 1.2s ease-in-out infinite;
          z-index: 4;
          width: 40%;
        }

        @keyframes loading-sweep {
          0% { left: -40%; }
          100% { left: 100%; }
        }
      `}</style>

      <div className="bv-root">
        <div className="bv-toolbar">
          <div className={`bv-status-dot ${isConnected ? "connected" : "disconnected"}`} />
          <div className="bv-url-wrapper">
            <span className="bv-url-prefix">://</span>
            <input
              className="bv-url-input"
              type="text"
              placeholder="enter target url..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
          <button className="bv-go-btn" onClick={navigate}>
            <span>EXEC</span>
          </button>
        </div>

        <div className="bv-screen-wrapper">
          <div className="bv-corner tl" />
          <div className="bv-corner tr" />
          <div className="bv-corner bl" />
          <div className="bv-corner br" />

          {isLoading && <div className="bv-loading-bar" />}

          {image ? (
            <img
              className="bv-screen-img"
              src={image}
              alt="browser"
              onClick={handleClick}
              onMouseMove={handleMouseMove}
              onWheel={handleWheel}
            />
          ) : (
            <div className="bv-idle-screen">
              <div className="bv-idle-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="#00ffaa" strokeWidth="1.5" opacity="0.6" />
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#00ffaa" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                </svg>
              </div>
              <span className="bv-idle-text">awaiting stream</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}