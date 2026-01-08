import React, { useMemo, useRef, useState } from "react";
import { PHOTOS } from "./data/photos.js";
import Viewer from "./Viewer.jsx";

export default function MobileAlbum() {
    const [idx, setIdx] = useState(0);
    const cur = PHOTOS[idx];

    const pageText = useMemo(() => {
        return `Mobile · ${idx + 1} / ${PHOTOS.length} · ${cur?.title || ""}`;
    }, [idx, cur]);

    function prev() {
        setIdx((i) => (i - 1 + PHOTOS.length) % PHOTOS.length);
    }
    function next() {
        setIdx((i) => (i + 1) % PHOTOS.length);
    }

    // Swipe 翻页（单指滑动）
    const swipe = useRef({ x: 0, y: 0, t: 0, active: false });
    function onTouchStart(e) {
        if (e.touches.length !== 1) return;
        const t = e.touches[0];
        swipe.current = { x: t.clientX, y: t.clientY, t: Date.now(), active: true };
    }
    function onTouchEnd(e) {
        if (!swipe.current.active) return;
        swipe.current.active = false;

        const changed = e.changedTouches?.[0];
        if (!changed) return;

        const dx = changed.clientX - swipe.current.x;
        const dy = changed.clientY - swipe.current.y;
        const dt = Date.now() - swipe.current.t;

        // 横向滑动为主，且足够距离/速度
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60 && dt < 600) {
            if (dx > 0) prev();
            else next();
        }
    }

    return (
        <div className="mobileWrap" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <Viewer
                src={cur.url}
                alt={cur.title}
                pageText={pageText}
                onPrev={prev}
                onNext={next}
                isMobile={true}
                shortcutHint="单指拖动/左右滑动翻页；双指缩放"
            />
            <div className="mobileTips">
                👆 左右滑动翻页 · 🤏 双指缩放 · 🔄 旋转按钮
            </div>
        </div>
    );
}