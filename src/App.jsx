import React, { useEffect, useMemo, useState } from "react";
import DesktopAlbum from "./DesktopAlbum.jsx";
import MobileAlbum from "./MobileAlbum.jsx";

function getModeFromPath() {
  const p = window.location.pathname;
  if (p.startsWith("/m")) return "mobile";
  if (p.startsWith("/d")) return "desktop";
  return "auto";
}

export default function App() {
  const [mode, setMode] = useState(getModeFromPath());
  const [w, setW] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const realMode = useMemo(() => {
    if (mode === "mobile") return "mobile";
    if (mode === "desktop") return "desktop";
    return w < 900 ? "mobile" : "desktop";
  }, [mode, w]);

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">
          <div className="logo">📁</div>
          <div>
            <div className="title">Work Album</div>
            <div className="sub">一页一张 · 缩放 · 旋转 · 快捷键</div>
          </div>
        </div>

        <div className="modeBtns">
          <button
            className={mode === "auto" ? "btn primary" : "btn"}
            onClick={() => setMode("auto")}
          >
            Auto
          </button>
          <button
            className={mode === "mobile" ? "btn primary" : "btn"}
            onClick={() => setMode("mobile")}
          >
            Mobile
          </button>
          <button
            className={mode === "desktop" ? "btn primary" : "btn"}
            onClick={() => setMode("desktop")}
          >
            Desktop
          </button>
        </div>
      </div>

      {realMode === "mobile" ? <MobileAlbum /> : <DesktopAlbum />}
    </div>
  );
}