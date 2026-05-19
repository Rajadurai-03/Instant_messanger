import React, { useState, useEffect, useRef, useCallback } from "react";
import { Ic } from "../../utils/icons";

// ── Overlay style ─────────────────────────────────────────────────────────────
export const ov = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.82)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 999, backdropFilter: "blur(6px)",
};

export const iBtn = {
  background: "none", border: "none", color: "#888", cursor: "pointer",
  display: "flex", alignItems: "center", padding: 6, borderRadius: 8,
};

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Av({ size, photo, name, color = "#00E5FF" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: photo ? "transparent" : "#1a1a2e",
      border: `2px solid ${color}`, overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color, flexShrink: 0,
    }}>
      {photo
        ? <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : (name || "?").charAt(0).toUpperCase()
      }
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: type === "error" ? "#2a1010" : "#0a1f1a",
      border: `1px solid ${type === "error" ? "#ff4d4d" : "#00E5FF"}`,
      color: type === "error" ? "#ff4d4d" : "#00E5FF",
      padding: "11px 22px", borderRadius: 10, fontWeight: 600, fontSize: 13,
      zIndex: 9999, boxShadow: "0 8px 30px rgba(0,0,0,.5)", whiteSpace: "nowrap",
    }}>
      {msg}
    </div>
  );
}

// ── ConfirmDialog ─────────────────────────────────────────────────────────────
export function ConfirmDialog({ msg, onConfirm, onCancel }) {
  return (
    <div style={{ ...ov, zIndex: 1001 }}>
      <div style={{
        background: "#14141F", border: "1px solid #2a2a3e", borderRadius: 14,
        padding: "28px 32px", maxWidth: 340, width: "90%", textAlign: "center",
      }}>
        <div style={{ fontSize: 14, color: "#ccc", marginBottom: 24, lineHeight: 1.6 }}>{msg}</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onCancel} style={{ padding: "9px 24px", background: "transparent", border: "1px solid #2a2a3e", color: "#aaa", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: "9px 24px", background: "#ff4d4d", border: "none", color: "#fff", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── CropModal ─────────────────────────────────────────────────────────────────
const CW = 380, CH = 300;
export function CropModal({ src, onDone, onCancel }) {
  const canvasRef = useRef(), imgRef = useRef();
  const [crop, setCrop] = useState({ x: 60, y: 40, size: 180 });
  const [drag, setDrag] = useState(null), [ds, setDs] = useState(null);
  const [ready, setReady] = useState(false);

  const draw = useCallback(() => {
    const c = canvasRef.current, img = imgRef.current;
    if (!c || !img || !ready) return;
    const ctx = c.getContext("2d");
    const sc = Math.min(CW / img.naturalWidth, CH / img.naturalHeight);
    const dw = img.naturalWidth * sc, dh = img.naturalHeight * sc;
    const ox = (CW - dw) / 2, oy = (CH - dh) / 2;
    ctx.clearRect(0, 0, CW, CH);
    ctx.drawImage(img, ox, oy, dw, dh);
    ctx.fillStyle = "rgba(0,0,0,.6)"; ctx.fillRect(0, 0, CW, CH);
    const { x, y, size } = crop;
    const cx2 = x + size / 2, cy2 = y + size / 2, r = size / 2;
    ctx.save(); ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(img, ox, oy, dw, dh); ctx.restore();
    ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#00E5FF"; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(x + size, y + size, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#00E5FF"; ctx.fill();
  }, [crop, ready]);

  useEffect(() => { draw(); }, [draw]);

  const clamp = c => {
    const s = Math.max(50, Math.min(c.size, Math.min(CW, CH) - 10));
    return { size: s, x: Math.max(0, Math.min(c.x, CW - s)), y: Math.max(0, Math.min(c.y, CH - s)) };
  };
  const gp = e => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) * CW / r.width, y: ((e.touches ? e.touches[0].clientY : e.clientY) - r.top) * CH / r.height };
  };
  const onDown = e => {
    e.preventDefault(); const p = gp(e); const { x, y, size } = crop;
    if (Math.hypot(p.x - (x + size), p.y - (y + size)) < 14) { setDrag("r"); setDs({ ...p, c: { ...crop } }); }
    else if (p.x > x && p.x < x + size && p.y > y && p.y < y + size) { setDrag("m"); setDs({ ...p, c: { ...crop } }); }
  };
  const onMove = e => {
    if (!drag || !ds) return; e.preventDefault();
    const p = gp(e), dx = p.x - ds.x, dy = p.y - ds.y;
    if (drag === "m") setCrop(clamp({ ...ds.c, x: ds.c.x + dx, y: ds.c.y + dy }));
    else setCrop(clamp({ ...ds.c, size: Math.max(50, ds.c.size + Math.max(dx, dy)) }));
  };
  const onUp = () => { setDrag(null); setDs(null); };

  const doCrop = () => {
    const img = imgRef.current;
    const sc = Math.min(CW / img.naturalWidth, CH / img.naturalHeight);
    const dw = img.naturalWidth * sc, dh = img.naturalHeight * sc;
    const ox = (CW - dw) / 2, oy = (CH - dh) / 2;
    const { x, y, size } = crop;
    const out = document.createElement("canvas"); out.width = size; out.height = size;
    const ctx = out.getContext("2d");
    ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(img, ox - x, oy - y, dw, dh);
    onDone(out.toDataURL("image/png"));
  };

  return (
    <div style={ov} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={{ background: "#14141F", border: "1px solid #222", borderRadius: 16, maxWidth: 440, width: "95%", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e1e2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, color: "#fff" }}>Crop Photo</span>
          <button onClick={onCancel} style={iBtn}>{Ic.close}</button>
        </div>
        <div style={{ padding: 16 }}>
          <p style={{ color: "#666", fontSize: 12, marginTop: 0, marginBottom: 10 }}>Drag to move · handle to resize</p>
          <canvas ref={canvasRef} width={CW} height={CH}
            style={{ width: "100%", borderRadius: 8, display: "block", background: "#000", cursor: drag ? "grabbing" : "grab", touchAction: "none" }}
            onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
            onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp} />
          <img ref={imgRef} src={src} alt="" style={{ display: "none" }} onLoad={() => {
            const img = imgRef.current;
            const sc = Math.min(CW / img.naturalWidth, CH / img.naturalHeight);
            const dw = img.naturalWidth * sc, dh = img.naturalHeight * sc;
            const ox = (CW - dw) / 2, oy = (CH - dh) / 2;
            const sz = Math.min(dw, dh) * 0.65;
            setCrop({ x: ox + (dw - sz) / 2, y: oy + (dh - sz) / 2, size: sz });
            setReady(true);
          }} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={onCancel} style={{ flex: 1, padding: "10px", background: "transparent", border: "1px solid #2a2a3e", color: "#aaa", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
            <button onClick={doCrop} style={{ flex: 2, padding: "10px", background: "linear-gradient(135deg,#00E5FF,#00a8cc)", border: "none", color: "#000", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Use Photo</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MenuItem ──────────────────────────────────────────────────────────────────
export function MenuItem({ icon, label, color, onClick }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", cursor: "pointer", fontSize: 13, fontWeight: 500, color: color || "#ccc" }}
      onMouseEnter={e => e.currentTarget.style.background = "#22223a"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      onClick={onClick}>
      {icon} {label}
    </div>
  );
}

// ── SidebarItem ───────────────────────────────────────────────────────────────
export function SidebarItem({ photo, name, isGroup, sub, active, onClick }) {
  return (
    <div onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", cursor: "pointer", background: active ? "rgba(0,229,255,.07)" : "transparent", borderLeft: `3px solid ${active ? "#00E5FF" : "transparent"}`, transition: "background .15s" }}
      onMouseEnter={e => !active && (e.currentTarget.style.background = "#1a1a2e")}
      onMouseLeave={e => !active && (e.currentTarget.style.background = "transparent")}>
      {isGroup
        ? <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#1a1a2e", border: `2px solid ${active ? "#00E5FF" : "#2a2a4a"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: active ? "#00E5FF" : "#5a5a7a", flexShrink: 0 }}>
            {name.charAt(0).toUpperCase()}
          </div>
        : <Av size={38} photo={photo} name={name} color={active ? "#00E5FF" : "#2a2a4a"} />
      }
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ fontWeight: 600, color: active ? "#fff" : "#ccc", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
        {sub && <div style={{ fontSize: 11, color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>}
      </div>
    </div>
  );
}
