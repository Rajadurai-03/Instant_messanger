import React, { useRef, useState } from "react";
import { Av, MenuItem, SidebarItem, CropModal } from "../shared/SharedComponents";
import { Ic } from "../../utils/icons";
import { API } from "../../utils/constants";

export default function ChatSidebar({
  myName, myPhoto, setMyPhoto, connected,
  contacts, groups, active, setActive, setTypingInfo,
  allUsers, onAddUser, onCreateGroup, onLogout, showToast,
}) {
  const [photoMenu, setPhotoMenu] = useState(false);
  const [viewMyPhoto, setViewMyPhoto] = useState(false);
  const [cropSrc, setCropSrc]     = useState(null);
  const [showMenu, setShowMenu]   = useState(false);

  const fileRef      = useRef();
  const menuRef      = useRef();
  const photoMenuRef = useRef();

  const iBtn = { background: "none", border: "none", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", padding: 6, borderRadius: 8 };
  const ov   = { position: "fixed", inset: 0, background: "rgba(0,0,0,.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(6px)" };

  // ── Photo handlers ────────────────────────────────────────────────────────
  const handleFileSelect = e => {
    const file = e.target.files[0]; if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = ev => setCropSrc(ev.target.result);
    reader.readAsDataURL(file);
    setPhotoMenu(false);
  };

  const handleCropDone = async b64 => {
    setCropSrc(null);
    setMyPhoto(b64);
    try {
      await fetch(`${API}/api/auth/photo`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: myName, photo: b64 }),
      });
    } catch { showToast("Failed to save photo", "error"); }
  };

  const deleteMyPhoto = async () => {
    setPhotoMenu(false); setMyPhoto(null);
    try {
      await fetch(`${API}/api/auth/photo`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: myName, photo: null }),
      });
    } catch { showToast("Failed to delete photo", "error"); }
  };

  const switchChat = (type, id, name) => {
    setActive({ type, id, name });
    setTypingInfo({});
  };

  return (
    <div className="chat-sidebar" style={{ width: 300, minWidth: 260, background: "#14141F", borderRight: "1px solid #1e1e2e", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", gap: 12 }}>

        {/* My avatar + photo menu */}
        <div ref={photoMenuRef} style={{ position: "relative" }}>
          <div style={{ cursor: "pointer" }} onClick={() => setPhotoMenu(v => !v)}>
            <Av size={40} photo={myPhoto} name={myName} />
          </div>
          {photoMenu && (
            <div style={{ position: "absolute", top: 46, left: 0, background: "#1a1a2a", border: "1px solid #2a2a3e", borderRadius: 10, overflow: "hidden", zIndex: 50, minWidth: 155, boxShadow: "0 8px 30px rgba(0,0,0,.6)" }}>
              <MenuItem icon={Ic.upload} label="Upload Photo" onClick={() => { fileRef.current.click(); setPhotoMenu(false); }} />
              {myPhoto && <MenuItem icon={Ic.eye} label="View Photo" onClick={() => { setViewMyPhoto(true); setPhotoMenu(false); }} />}
              {myPhoto && <MenuItem icon={Ic.trash} label="Delete Photo" color="#ff4d4d" onClick={deleteMyPhoto} />}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{myName}</div>
          <div style={{ fontSize: 11, color: connected ? "#00E5FF" : "#555" }}>{connected ? "● Online" : "○ Offline"}</div>
        </div>

        {/* 3-line menu */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button style={iBtn} onClick={() => setShowMenu(v => !v)}>{Ic.menu}</button>
          {showMenu && (
            <div style={{ position: "absolute", top: 34, right: 0, background: "#1a1a2a", border: "1px solid #2a2a3e", borderRadius: 10, overflow: "hidden", zIndex: 50, minWidth: 160, boxShadow: "0 8px 30px rgba(0,0,0,.6)" }}>
              <MenuItem icon={Ic.group}  label="Create Group"  onClick={() => { onCreateGroup(); setShowMenu(false); }} />
              <MenuItem icon={Ic.camera} label="Profile Photo" onClick={() => { setShowMenu(false); setPhotoMenu(true); }} />
              <MenuItem icon={Ic.logout} label="Logout" color="#ff4d4d" onClick={onLogout} />
            </div>
          )}
        </div>
      </div>

      {/* Chat list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {groups.map(g => (
          <SidebarItem key={g.id} photo={null} name={g.name} isGroup sub={g.members.split(",").join(", ")}
            active={active?.id === g.id}
            onClick={() => switchChat("group", g.id, g.name)} />
        ))}
        {contacts.map(c => (
          <SidebarItem key={c.name} photo={c.photo} name={c.name} sub=""
            active={active?.type === "dm" && active.id === c.name}
            onClick={() => switchChat("dm", c.name, c.name)} />
        ))}
        {contacts.length === 0 && groups.length === 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#444", fontSize: 13 }}>No chats yet.<br />Use + to start one.</div>
        )}
      </div>

      {/* New chat button */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #1e1e2e" }}>
        <button onClick={onAddUser}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 10, color: "#00E5FF", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
          {Ic.plus} New Chat
        </button>
      </div>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileSelect} />

      {/* Crop modal */}
      {cropSrc && <CropModal src={cropSrc} onDone={handleCropDone} onCancel={() => setCropSrc(null)} />}

      {/* View my photo */}
      {viewMyPhoto && myPhoto && (
        <div style={ov} onClick={() => setViewMyPhoto(false)}>
          <div style={{ position: "relative", maxWidth: 320 }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewMyPhoto(false)} style={{ position: "absolute", top: -14, right: -14, width: 30, height: 30, borderRadius: "50%", background: "#14141F", border: "1px solid #2a2a3e", color: "#aaa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.close}</button>
            <img src={myPhoto} alt="" style={{ width: "100%", borderRadius: "50%", display: "block", boxShadow: "0 0 0 4px #00E5FF44" }} />
          </div>
        </div>
      )}
    </div>
  );
}
