import React, { useEffect, useMemo, useRef, useState } from "react";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export default function Viewer({
    src,
    alt,
    pageText,
    onPrev,
    onNext,
    isMobile,
    shortcutHint,
}) {
    const wrapRef = useRef(null);

    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0); // degrees
    const [tx, setTx] = useState(0);
    const [ty, setTy] = useState(0);

    // 触控状态（双指）
    const pointers = useRef(new Map()); // pointerId -> {x,y}
    const pinchBase = useRef(null); // {dist, scale}

    const transform = useMemo(() => {
        // 限制缩放范围
        const s = clamp(scale, 0.2, 6);
        return `translate(${tx}px, ${ty}px) rotate(${rotate}deg) scale(${s})`;
    }, [scale, rotate, tx, ty]);

    // 切换图片时重置（也可以改成保留）
    useEffect(() => {
        setScale(1);
        setRotate(0);
        setTx(0);
        setTy(0);
    }, [src]);

    function zoomBy(delta) {
        setScale((s) => clamp(s + delta, 0.2, 6));
    }
    function rotateBy(deg) {
        setRotate((r) => (r + deg + 360) % 360);
    }
    function resetView() {
        setScale(1);
        setRotate(0);
        setTx(0);
        setTy(0);
    }
    function fitToScreen() {
        // 简化：fit = 1 并居中（你也可以根据图片尺寸计算更精确 fit）
        setScale(1);
        setTx(0);
        setTy(0);
    }

    // 滚轮缩放（桌面端）
    function onWheel(e) {
        if (isMobile) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        zoomBy(delta);
    }

    // 鼠标拖拽（桌面端）
    const drag = useRef({ down: false, x: 0, y: 0, tx: 0, ty: 0 });
    function onMouseDown(e) {
        if (isMobile) return;
        drag.current = { down: true, x: e.clientX, y: e.clientY, tx, ty };
    }
    function onMouseMove(e) {
        if (isMobile) return;
        if (!drag.current.down) return;
        const dx = e.clientX - drag.current.x;
        const dy = e.clientY - drag.current.y;
        setTx(drag.current.tx + dx);
        setTy(drag.current.ty + dy);
    }
    function onMouseUp() {
        if (isMobile) return;
        drag.current.down = false;
    }

    // 触控：Pointer Events（移动端拖动 + 双指缩放）
    function onPointerDown(e) {
        if (!isMobile) return;
        wrapRef.current?.setPointerCapture?.(e.pointerId);
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pointers.current.size === 2) {
            const arr = Array.from(pointers.current.values());
            const dist = Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y);
            pinchBase.current = { dist, scale };
        }
    }
    function onPointerMove(e) {
        if (!isMobile) return;
        if (!pointers.current.has(e.pointerId)) return;

        const prev = pointers.current.get(e.pointerId);
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

        // 单指：拖动图片
        if (pointers.current.size === 1 && prev) {
            const dx = e.clientX - prev.x;
            const dy = e.clientY - prev.y;
            setTx((v) => v + dx);
            setTy((v) => v + dy);
            return;
        }

        // 双指：缩放
        if (pointers.current.size === 2 && pinchBase.current) {
            const arr = Array.from(pointers.current.values());
            const dist = Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y);
            const ratio = dist / (pinchBase.current.dist || dist);
            const nextScale = clamp(pinchBase.current.scale * ratio, 0.2, 6);
            setScale(nextScale);
        }
    }
    function onPointerUp(e) {
        if (!isMobile) return;
        pointers.current.delete(e.pointerId);
        if (pointers.current.size < 2) pinchBase.current = null;
    }

    return (
        <div className="viewer">
            <div className="viewerHeader">
                <div className="pageText">{pageText}</div>
                <div className="hint">{shortcutHint}</div>
            </div>

            <div
                ref={wrapRef}
                className="stage"
                onWheel={onWheel}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
            >
                <img
                    className="photo"
                    src={src}
                    alt={alt || ""}
                    draggable={false}
                    style={{ transform }}
                />
            </div>

            <div className="controls">
                <button className="btn" onClick={onPrev} title="上一张">
                    ⬅️ Prev
                </button>
                <button className="btn" onClick={() => zoomBy(-0.2)} title="缩小">
                    ➖
                </button>
                <button className="btn" onClick={() => zoomBy(0.2)} title="放大">
                    ➕
                </button>
                <button className="btn" onClick={() => rotateBy(-90)} title="左旋转 90°">
                    ⤺
                </button>
                <button className="btn" onClick={() => rotateBy(90)} title="右旋转 90°">
                    ⤻
                </button>
                <button className="btn" onClick={fitToScreen} title="适应">
                    Fit
                </button>
                <button className="btn" onClick={resetView} title="重置">
                    Reset
                </button>
                <button className="btn" onClick={onNext} title="下一张">
                    Next ➡️
                </button>
            </div>
        </div>
    );
}