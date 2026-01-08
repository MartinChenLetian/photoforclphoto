import React, { useEffect, useMemo, useState } from "react";
import { PHOTOS } from "./data/photos.js";
import Viewer from "./Viewer.jsx";

export default function DesktopAlbum() {
    const [idx, setIdx] = useState(0);

    const cur = PHOTOS[idx];
    const pageText = useMemo(() => {
        return `Desktop · ${idx + 1} / ${PHOTOS.length} · ${cur?.title || ""}`;
    }, [idx, cur]);

    function prev() {
        setIdx((i) => (i - 1 + PHOTOS.length) % PHOTOS.length);
    }
    function next() {
        setIdx((i) => (i + 1) % PHOTOS.length);
    }

    useEffect(() => {
        const key = (e) => {
            // 避免在输入框里影响打字（如果你后面加搜索框会用到）
            const tag = (e.target?.tagName || "").toLowerCase();
            if (tag === "input" || tag === "textarea") return;

            const click = (sel) => {
                const btn = document.querySelector(sel);
                if (btn) btn.click();
            };

            if (e.key === "ArrowLeft") return prev();
            if (e.key === "ArrowRight") return next();
            if (e.key === " " /* space */) {
                e.preventDefault();
                return next();
            }

            if (e.key === "+" || e.key === "=") return click('[title="放大"]');
            if (e.key === "-" || e.key === "_") return click('[title="缩小"]');

            if (e.key === "[") return click('[title="左旋转 90°"]');
            if (e.key === "]") return click('[title="右旋转 90°"]');
            if (e.key.toLowerCase() === "r") return click('[title="右旋转 90°"]');

            if (e.key === "0") return click('[title="重置"]');
            if (e.key.toLowerCase() === "f") return click('[title="适应"]');
        };

        window.addEventListener("keydown", key);
        return () => window.removeEventListener("keydown", key);
    }, []);

    return (
        <div className="modeWrap">
            <div className="sidePanel">
                <div className="panelTitle">快捷键</div>
                <div className="panelItem"><kbd>←</kbd> / <kbd>→</kbd> 上一张/下一张</div>
                <div className="panelItem"><kbd>+</kbd> 放大　<kbd>-</kbd> 缩小</div>
                <div className="panelItem"><kbd>[</kbd> 左转　<kbd>]</kbd> 右转　<kbd>R</kbd> 右转</div>
                <div className="panelItem"><kbd>F</kbd> Fit　<kbd>0</kbd> Reset</div>
                <div className="panelItem"><kbd>Space</kbd> 下一张</div>
                <div className="panelTitle" style={{ marginTop: 14 }}>列表</div>
                <div className="thumbList">
                    {PHOTOS.map((p, i) => (
                        <button
                            key={p.id}
                            className={i === idx ? "thumb active" : "thumb"}
                            onClick={() => setIdx(i)}
                            title={p.title}
                        >
                            <img src={p.url} alt="" />
                            <div className="thumbText">{i + 1}. {p.title}</div>
                        </button>
                    ))}
                </div>
            </div>

            <Viewer
                src={cur.url}
                alt={cur.title}
                pageText={pageText}
                onPrev={prev}
                onNext={next}
                isMobile={false}
                shortcutHint="滚轮缩放，拖拽移动；按快捷键更快"
            />
        </div>
    );
}