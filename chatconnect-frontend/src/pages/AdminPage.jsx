import React, { useState, useEffect, useRef, useCallback } from "react";

const HOST = window.location.hostname;
const API = `http://${HOST}:8080`;

// ── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  bell: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  settings: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  logout: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  camera: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  key: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  phone: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  upload: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  eye: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  deleteIcon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
};

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page: { minHeight: "100vh", background: "#0F0F14", color: "#fff", fontFamily: "'Segoe UI', sans-serif", display: "flex", flexDirection: "column" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", height: "70px", background: "#14141F", borderBottom: "1px solid #1e1e2e", position: "sticky", top: 0, zIndex: 100, boxSizing: "border-box" },
  adminName: { display: "flex", alignItems: "center", gap: "13px" },
  avatarWrap: { position: "relative", cursor: "pointer", userSelect: "none" },
  avatar: { width: "50px", height: "50px", borderRadius: "50%", background: "linear-gradient(135deg,#00E5FF,#0077ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "700", color: "#000", overflow: "hidden", border: "2px solid #00E5FF", transition: "border-color 0.2s" },
  cameraOverlay: { position: "absolute", bottom: 0, right: 0, background: "#00E5FF", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", border: "2px solid #14141F", pointerEvents: "none" },
  nameText: { fontSize: "16px", fontWeight: "700", color: "#fff", letterSpacing: "0.5px" },
  roleText: { fontSize: "11px", color: "#00E5FF", letterSpacing: "1px", textTransform: "uppercase" },
  topRight: { display: "flex", alignItems: "center", gap: "8px" },
  iconBtn: { background: "none", border: "none", color: "#aaa", cursor: "pointer", padding: "8px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  badge: { position: "absolute", top: "4px", right: "4px", background: "#ff4d4d", color: "#fff", borderRadius: "50%", width: "17px", height: "17px", fontSize: "10px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #0F0F14" },
  logoutBtn: { display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,77,77,0.12)", border: "1px solid rgba(255,77,77,0.3)", color: "#ff4d4d", borderRadius: "10px", padding: "7px 14px", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  photoMenu: { position: "absolute", top: "58px", left: 0, background: "#1a1a2a", border: "1px solid #2a2a3e", borderRadius: "12px", overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.7)", zIndex: 300, minWidth: "165px" },
  photoMenuItem: { display: "flex", alignItems: "center", gap: "10px", padding: "11px 16px", cursor: "pointer", fontSize: "13px", fontWeight: "500", whiteSpace: "nowrap" },
  dropdown: { position: "absolute", top: "110%", right: 0, background: "#14141F", border: "1px solid #1e1e2e", borderRadius: "14px", minWidth: "320px", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", zIndex: 200, overflow: "hidden" },
  dropHead: { padding: "16px 20px", borderBottom: "1px solid #1e1e2e", fontSize: "12px", fontWeight: "700", color: "#00E5FF", letterSpacing: "1.5px", textTransform: "uppercase" },
  notifItem: { padding: "14px 20px", borderBottom: "1px solid #1a1a28", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" },
  approveBtn: { background: "linear-gradient(135deg,#00E5FF,#00a8cc)", border: "none", color: "#000", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" },
  settingsItem: { padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", transition: "background 0.15s", borderBottom: "1px solid #1a1a28" },
  settingsIcon: { width: "34px", height: "34px", borderRadius: "10px", background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#00E5FF" },
  content: { flex: 1, padding: "32px 36px", maxWidth: "1100px", width: "100%", margin: "0 auto", boxSizing: "border-box" },
  sectionTitle: { fontSize: "13px", fontWeight: "700", color: "#00E5FF", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "20px" },
  card: { background: "#14141F", border: "1px solid #1e1e2e", borderRadius: "16px", overflow: "hidden" },
  tableHead: { display: "grid", gridTemplateColumns: "48px 1fr 140px 120px 140px", padding: "12px 20px", borderBottom: "1px solid #1e1e2e", color: "#555", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", overflowX: "auto" },
  tableRow: { display: "grid", gridTemplateColumns: "48px 1fr 140px 120px 140px", padding: "12px 16px", borderBottom: "1px solid #1a1a28", alignItems: "center", transition: "background 0.15s" },
  userAvatar: { width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#1e1e3a,#2a2a4a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#00E5FF", border: "1px solid #2a2a4a", overflow: "hidden" },
  deleteBtn: { background: "rgba(255,77,77,0.1)", border: "1px solid rgba(255,77,77,0.25)", color: "#ff4d4d", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px", width: "fit-content" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(6px)" },
  modal: { background: "#14141F", border: "1px solid #222232", borderRadius: "20px", width: "100%", maxWidth: "400px", overflow: "hidden" },
  modalHead: { padding: "20px 24px 16px", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { fontSize: "16px", fontWeight: "700", color: "#fff" },
  modalBody: { padding: "20px 24px 24px" },
  label: { display: "block", color: "#aaa", fontSize: "11px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px", marginTop: "16px" },
  input: { width: "100%", background: "#1A1A26", border: "1px solid #2C2C3E", color: "#fff", borderRadius: "8px", padding: "11px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  saveBtn: {marginTop: "20px",marginLeft:"Auto",marginRight:"Auto", background: "linear-gradient(135deg,#00E5FF,#00a8cc)", border: "none", color: "#000", borderRadius: "8px", padding: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "block" },
  emptyRow: { padding: "40px 20px", textAlign: "center", color: "#444", fontSize: "14px" },
};

// ── Crop Modal (pure canvas, no library) ──────────────────────────────────────
const CANVAS_W = 480;
const CANVAS_H = 340;

function CropModal({ imageSrc, onCrop, onCancel }) {
  const canvasRef = useRef(null);
  const imgRef    = useRef(null);
  const [crop, setCrop]       = useState({ x: 100, y: 70, size: 200 });
  const [dragging, setDragging] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [ready, setReady]     = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img || !ready) return;
    const ctx = canvas.getContext("2d");
    const scale = Math.min(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight);
    const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    const ox = (CANVAS_W - dw) / 2, oy = (CANVAS_H - dh) / 2;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    // Draw image
    ctx.drawImage(img, ox, oy, dw, dh);
    // Dark overlay
    ctx.fillStyle = "rgba(0,0,0,0.58)";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    // Reveal circle
    const { x, y, size } = crop;
    const cx = x + size / 2, cy = y + size / 2, r = size / 2;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(img, ox, oy, dw, dh);
    ctx.restore();
    // Circle border
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#00E5FF"; ctx.lineWidth = 2.5; ctx.stroke();
    // Resize handle
    ctx.beginPath(); ctx.arc(x + size, y + size, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#00E5FF"; ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
  }, [crop, ready]);

  useEffect(() => { draw(); }, [draw]);

  const clamp = (c) => {
    const size = Math.max(60, Math.min(c.size, Math.min(CANVAS_W, CANVAS_H) - 10));
    return { size, x: Math.max(0, Math.min(c.x, CANVAS_W - size)), y: Math.max(0, Math.min(c.y, CANVAS_H - size)) };
  };

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = CANVAS_W / rect.width, sy = CANVAS_H / rect.height;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy2 = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - rect.left) * sx, y: (cy2 - rect.top) * sy };
  };

  const onDown = (e) => {
    e.preventDefault();
    const pos = getPos(e);
    const { x, y, size } = crop;
    if (Math.hypot(pos.x - (x + size), pos.y - (y + size)) < 16) {
      setDragging("resize"); setDragStart({ ...pos, origCrop: { ...crop } });
    } else if (pos.x > x && pos.x < x + size && pos.y > y && pos.y < y + size) {
      setDragging("move"); setDragStart({ ...pos, origCrop: { ...crop } });
    }
  };
  const onMove = (e) => {
    if (!dragging || !dragStart) return; e.preventDefault();
    const pos = getPos(e);
    const dx = pos.x - dragStart.x, dy = pos.y - dragStart.y;
    if (dragging === "move") setCrop(clamp({ ...dragStart.origCrop, x: dragStart.origCrop.x + dx, y: dragStart.origCrop.y + dy }));
    else { const ns = Math.max(60, dragStart.origCrop.size + Math.max(dx, dy)); setCrop(clamp({ ...dragStart.origCrop, size: ns })); }
  };
  const onUp = () => { setDragging(null); setDragStart(null); };

  const handleCrop = () => {
    const img = imgRef.current;
    const scale = Math.min(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight);
    const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    const ox = (CANVAS_W - dw) / 2, oy = (CANVAS_H - dh) / 2;
    const { x, y, size } = crop;
    const out = document.createElement("canvas");
    out.width = size; out.height = size;
    const ctx = out.getContext("2d");
    ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(img, ox - x, oy - y, dw, dh);
    onCrop(out.toDataURL("image/png"));
  };

  return (
    <div style={S.modalOverlay}>
      <div style={{ ...S.modal, maxWidth: "530px" }}>
        <div style={S.modalHead}>
          <span style={S.modalTitle}>Crop Photo</span>
          <button style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }} onClick={onCancel}>{Icon.close}</button>
        </div>
        <div style={{ padding: "16px 24px 24px" }}>
          <p style={{ color: "#666", fontSize: "12px", marginBottom: "12px", marginTop: 0 }}>Drag circle to move &nbsp;·&nbsp; drag blue handle to resize</p>
          <canvas
            ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
            style={{ width: "100%", borderRadius: "10px", display: "block", background: "#111", cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
            onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
            onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
          />
          <img ref={imgRef} src={imageSrc} alt="" style={{ display: "none" }}
            onLoad={() => {
              const img = imgRef.current;
              const scale = Math.min(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight);
              const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
              const ox = (CANVAS_W - dw) / 2, oy = (CANVAS_H - dh) / 2;
              const size = Math.min(dw, dh) * 0.65;
              setCrop({ x: ox + (dw - size) / 2, y: oy + (dh - size) / 2, size });
              setReady(true);
            }}
          />
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button onClick={onCancel} style={{ flex: 1, padding: "11px", background: "transparent", border: "1px solid #2a2a3e", color: "#aaa", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>Cancel</button>
            <button onClick={handleCrop} style={{ flex: 2, padding: "11px", background: "linear-gradient(135deg,#00E5FF,#00a8cc)", border: "none", color: "#000", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "700" }}>Use This Photo</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── View Photo Modal ──────────────────────────────────────────────────────────
function ViewPhotoModal({ photoUrl, onClose }) {
  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={{ position: "relative", maxWidth: "380px", width: "90%" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: "-14px", right: "-14px", width: "32px", height: "32px", borderRadius: "50%", background: "#14141F", border: "1px solid #2a2a3e", color: "#aaa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>{Icon.close}</button>
        <img src={photoUrl} alt="Admin profile" style={{ width: "100%", borderRadius: "50%", display: "block", boxShadow: "0 0 0 4px #00E5FF44, 0 20px 60px rgba(0,0,0,0.8)" }} />
      </div>
    </div>
  );
}


// ─── Confirm Dialog (in-page, replaces window.confirm) ───────────────────────
function ConfirmDialog({ msg, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#14141F", border: "1px solid #2a2a3e", borderRadius: 14, padding: "28px 32px", maxWidth: 340, width: "90%", textAlign: "center" }}>
        <div style={{ fontSize: 14, color: "#ccc", marginBottom: 24, lineHeight: 1.6 }}>{msg}</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onCancel} style={{ padding: "9px 24px", background: "transparent", border: "1px solid #2a2a3e", color: "#aaa", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: "9px 24px", background: "#ff4d4d", border: "none", color: "#fff", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminPage({ onLogout }) {
  const [users, setUsers]             = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [photoUrl, setPhotoUrl]       = useState(() => localStorage.getItem("admin_photo") || null);

  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [cropSrc, setCropSrc]         = useState(null);
  const [viewPhoto, setViewPhoto]     = useState(false);

  const [showNotif, setShowNotif]       = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsModal, setSettingsModal] = useState(null);
  const [settingsForm, setSettingsForm]   = useState({ current: "", newVal: "", confirm: "" });
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [confirm, setConfirm]   = useState(null); // { msg, onConfirm }
  const [adminInfo, setAdminInfo] = useState({ name: "Raja", phone: "..." });

  const notifRef    = useRef();
  const settingsRef = useRef();
  const photoMenuRef = useRef();
  const fileRef     = useRef();

  const fetchUsers         = async () => { try { const r = await fetch(`${API}/api/admin/users`); if (r.ok) setUsers(await r.json()); } catch {} };
  const fetchNotifications = async () => { try { const r = await fetch(`${API}/api/admin/reset-requests`); if (r.ok) setNotifications(await r.json()); } catch {} };

  useEffect(() => {
    fetchUsers(); fetchNotifications();
    // Fetch admin profile info
    fetch(`${API}/api/admin/info`).then(r => r.ok ? r.json() : null).then(d => { if (d) setAdminInfo(d); }).catch(() => {});
    const id = setInterval(() => { fetchUsers(); fetchNotifications(); }, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setShowSettings(false);
      if (photoMenuRef.current && !photoMenuRef.current.contains(e.target)) setShowPhotoMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const deleteUser = (phone) => {
    setConfirm({ msg: "Delete this user permanently? This cannot be undone.", onConfirm: async () => {
      setConfirm(null);
      try { await fetch(`${API}/api/admin/users/${phone}`, { method: "DELETE" }); fetchUsers(); } catch {}
    }});
  };
  const approveReset = async (phone) => { try { await fetch(`${API}/api/admin/approve-reset/${phone}`, { method: "POST" }); setNotifications(n => n.filter(x => x.phone !== phone)); } catch { alert("Failed"); } };

  // Photo
  const handleFileSelect = (e) => {
    const file = e.target.files[0]; if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev.target.result);
    reader.readAsDataURL(file);
    setShowPhotoMenu(false);
  };
  const handleCropDone = (base64) => { setPhotoUrl(base64); localStorage.setItem("admin_photo", base64); setCropSrc(null); };
  const handleDeletePhoto = () => { setPhotoUrl(null); localStorage.removeItem("admin_photo"); setShowPhotoMenu(false); };

  // Settings
  const openSettingsModal = (type) => { setSettingsModal(type); setSettingsForm({ current: "", newVal: "", confirm: "" }); setSettingsError(""); setSettingsSuccess(""); setShowSettings(false); };
  const submitSettings = async () => {
    setSettingsError(""); setSettingsSuccess("");
    if (settingsModal === "password") {
      if (!settingsForm.newVal || settingsForm.newVal.length < 8) return setSettingsError("New password must be at least 8 characters");
      if (settingsForm.newVal !== settingsForm.confirm) return setSettingsError("Passwords do not match");
      try {
        const r = await fetch(`${API}/api/admin/change-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: settingsForm.current, newPassword: settingsForm.newVal }) });
        const d = await r.json(); if (!r.ok) return setSettingsError(d.error || "Failed");
        setSettingsSuccess("Password updated!"); setTimeout(() => setSettingsModal(null), 1500);
      } catch { setSettingsError("Cannot reach server"); }
    } else {
      if (!settingsForm.newVal || settingsForm.newVal.length !== 10) return setSettingsError("Phone must be 10 digits");
      try {
        const r = await fetch(`${API}/api/admin/change-phone`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newPhone: settingsForm.newVal }) });
        const d = await r.json(); if (!r.ok) return setSettingsError(d.error || "Failed");
        setSettingsSuccess("Phone updated!"); setTimeout(() => setSettingsModal(null), 1500);
      } catch { setSettingsError("Cannot reach server"); }
    }
  };

  return (
    <div style={S.page}>

      {/* TOP BAR */}
      <div style={S.topbar} className="admin-topbar">
        <div style={S.adminName}>
          {/* Avatar with photo menu */}
          <div ref={photoMenuRef} style={S.avatarWrap}>
            <div style={{ ...S.avatar, borderColor: showPhotoMenu ? "#00bfff" : "#00E5FF" }} onClick={() => setShowPhotoMenu(v => !v)}>
              {photoUrl ? <img src={photoUrl} alt="admin" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "R"}
            </div>
            <div style={S.cameraOverlay}>{Icon.camera}</div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileSelect} />

            {showPhotoMenu && (
              <div style={S.photoMenu}>
                <div style={{ ...S.photoMenuItem, color: "#fff" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#22223a"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  onClick={() => { fileRef.current.click(); setShowPhotoMenu(false); }}>
                  <span style={{ color: "#00E5FF" }}>{Icon.upload}</span> Upload Photo
                </div>
                {photoUrl && (
                  <div style={{ ...S.photoMenuItem, color: "#fff" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#22223a"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    onClick={() => { setViewPhoto(true); setShowPhotoMenu(false); }}>
                    <span style={{ color: "#00E5FF" }}>{Icon.eye}</span> View Photo
                  </div>
                )}
                {photoUrl && (
                  <div style={{ ...S.photoMenuItem, color: "#ff4d4d" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#2a1a1a"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    onClick={handleDeletePhoto}>
                    <span>{Icon.deleteIcon}</span> Delete Photo
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <div style={S.nameText}>Raja</div>
            <div style={S.roleText}>Administrator</div>
          </div>
        </div>

        <div style={S.topRight}>
          {/* Bell */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button style={{ ...S.iconBtn, color: showNotif ? "#00E5FF" : "#aaa" }} onClick={() => { setShowNotif(!showNotif); setShowSettings(false); }}>
              {Icon.bell}
              {notifications.length > 0 && <span style={S.badge}>{notifications.length}</span>}
            </button>
            {showNotif && (
              <div style={S.dropdown}>
                <div style={S.dropHead}>Notifications</div>
                {notifications.length === 0
                  ? <div style={S.emptyRow}>No pending requests</div>
                  : notifications.map(n => (
                    <div key={n.phone} style={S.notifItem}>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#fff", marginBottom: "3px" }}>{n.name}</div>
                        <div style={{ fontSize: "11px", color: "#888" }}>Requested password reset</div>
                      </div>
                      <button style={S.approveBtn} onClick={() => approveReset(n.phone)}>{Icon.check} Approve</button>
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          {/* Settings */}
          <div ref={settingsRef} style={{ position: "relative" }}>
            <button style={{ ...S.iconBtn, color: showSettings ? "#00E5FF" : "#aaa" }} onClick={() => { setShowSettings(!showSettings); setShowNotif(false); }}>
              {Icon.settings}
            </button>
            {showSettings && (
              <div style={{ ...S.dropdown, minWidth: "200px" }}>
                <div style={S.dropHead}>Settings</div>
                <div style={S.settingsItem} onMouseEnter={e => e.currentTarget.style.background = "#1a1a2e"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} onClick={() => openSettingsModal("password")}>
                  <div style={S.settingsIcon}>{Icon.key}</div>
                  <div><div style={{ fontSize: "13px", fontWeight: "600" }}>Change Password</div><div style={{ fontSize: "11px", color: "#666" }}>Update admin password</div></div>
                </div>
                <div style={S.settingsItem} onMouseEnter={e => e.currentTarget.style.background = "#1a1a2e"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} onClick={() => openSettingsModal("phone")}>
                  <div style={S.settingsIcon}>{Icon.phone}</div>
                  <div><div style={{ fontSize: "13px", fontWeight: "600" }}>Change Phone</div><div style={{ fontSize: "11px", color: "#666" }}>Update login number</div></div>
                </div>
                <div style={{ ...S.settingsItem, borderBottom: "none" }} onMouseEnter={e => e.currentTarget.style.background = "#1a1a2e"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} onClick={() => openSettingsModal("info")}>
                  <div style={S.settingsIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div><div style={{ fontSize: "13px", fontWeight: "600" }}>Profile Info</div><div style={{ fontSize: "11px", color: "#666" }}>View name & phone</div></div>
                </div>
              </div>
            )}
          </div>

          <button style={S.logoutBtn} className="admin-logout-btn" onClick={onLogout}>{Icon.logout} <span>Logout</span></button>
        </div>
      </div>

      {/* USERS TABLE */}
      <div style={S.content} className="admin-content">
        <div style={S.sectionTitle}>Registered Users</div>
        <div style={S.card}>
          <div style={S.tableHead} className="admin-table-head"><span></span><span>Name</span><span className="phone-col">Phone</span><span className="status-col">Status</span><span>Action</span></div>
          {users.length === 0
            ? <div style={S.emptyRow}>No registered users yet</div>
            : users.map(u => (
              <div key={u.phone} style={S.tableRow}
                className="admin-table-row"
                onMouseEnter={e => e.currentTarget.style.background = "#18182a"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={S.userAvatar}>{u.photo ? <img src={u.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : u.name.charAt(0).toUpperCase()}</div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>{u.name}</div>
                <div className="phone-col" style={{ fontSize: "13px", color: "#888" }}>{u.phone}</div>
                <div className="status-col"><span style={{ fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "20px", background: "rgba(0,229,255,0.1)", color: "#00E5FF" }}>Active</span></div>
                <div>
                  <button style={S.deleteBtn}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,77,77,0.2)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,77,77,0.1)"}
                    onClick={() => deleteUser(u.phone)}>
                    {Icon.trash} Delete
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* CROP MODAL */}
      {cropSrc && <CropModal imageSrc={cropSrc} onCrop={handleCropDone} onCancel={() => setCropSrc(null)} />}

      {/* VIEW PHOTO */}
      {viewPhoto && photoUrl && <ViewPhotoModal photoUrl={photoUrl} onClose={() => setViewPhoto(false)} />}

      {/* CONFIRM DIALOG */}
      {confirm && <ConfirmDialog msg={confirm.msg} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      {/* SETTINGS MODAL */}
      {settingsModal && (
        <div style={S.modalOverlay} onClick={e => e.target === e.currentTarget && setSettingsModal(null)}>
          <div style={S.modal}>
            <div style={S.modalHead}>
              <span style={S.modalTitle}>{settingsModal === "password" ? "Change Password" : "Change Phone Number"}</span>
              <button style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }} onClick={() => setSettingsModal(null)}>{Icon.close}</button>
            </div>
            <div style={S.modalBody}>
              {settingsModal === "info" ? (
                <div style={{ marginTop: 8 }}>
                  <label style={S.label}>Name</label>
                  <div style={{ background: "#1A1A26", border: "1px solid #2C2C3E", color: "#fff", borderRadius: 8, padding: "11px 14px", fontSize: 14 }}>{adminInfo.name}</div>
                  <label style={S.label}>Phone Number</label>
                  <div style={{ background: "#1A1A26", border: "1px solid #2C2C3E", color: "#fff", borderRadius: 8, padding: "11px 14px", fontSize: 14 }}>{adminInfo.phone}</div>
                  <button style={{ ...S.saveBtn, marginTop: 20 }} onClick={() => setSettingsModal(null)}>Close</button>
                </div>
              ) : settingsModal === "password" ? (
                <>
                  <label style={S.label}>Current Password</label>
                  <input type="password" style={S.input} placeholder="Enter current password" value={settingsForm.current} onChange={e => setSettingsForm(f => ({ ...f, current: e.target.value }))} />
                  <label style={S.label}>New Password</label>
                  <input type="password" style={S.input} placeholder="At least 8 characters" value={settingsForm.newVal} onChange={e => setSettingsForm(f => ({ ...f, newVal: e.target.value }))} />
                  <label style={S.label}>Confirm New Password</label>
                  <input type="password" style={S.input} placeholder="Repeat new password" value={settingsForm.confirm} onChange={e => setSettingsForm(f => ({ ...f, confirm: e.target.value }))} />
                  <button style={S.saveBtn} onClick={submitSettings}>Save Changes</button>
                </>
              ) : (
                <>
                  <label style={S.label}>New Phone Number</label>
                  <input type="number" style={S.input} placeholder="10-digit mobile number" value={settingsForm.newVal} onChange={e => setSettingsForm(f => ({ ...f, newVal: e.target.value }))} />
                  <button style={S.saveBtn} onClick={submitSettings}>Save Changes</button>
                </>
              )}
              {settingsError && <div style={{ marginTop: "14px", padding: "10px 14px", borderRadius: "8px", background: "rgba(255,77,77,0.1)", border: "1px solid rgba(255,77,77,0.3)", color: "#ff4d4d", fontSize: "13px", fontWeight: "600" }}>{settingsError}</div>}
              {settingsSuccess && <div style={{ marginTop: "14px", padding: "10px 14px", borderRadius: "8px", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", color: "#00E5FF", fontSize: "13px", fontWeight: "600" }}>{settingsSuccess}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
