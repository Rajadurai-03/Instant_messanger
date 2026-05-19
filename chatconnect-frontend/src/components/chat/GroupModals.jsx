import React from "react";
import { Av, iBtn } from "../shared/SharedComponents";
import { Ic } from "../../utils/icons";

// ── Add User (New Chat) Modal ─────────────────────────────────────────────────
export function AddUserModal({ allUsers, getUserPhoto, onSelect, onClose }) {
  const ov = { position: "fixed", inset: 0, background: "rgba(0,0,0,.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(6px)" };
  return (
    <div style={ov} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#14141F", border: "1px solid #222", borderRadius: 16, width: 340, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e1e2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, color: "#fff" }}>New Chat</span>
          <button style={iBtn} onClick={onClose}>{Ic.close}</button>
        </div>
        <div style={{ padding: 12, maxHeight: 340, overflowY: "auto" }}>
          {allUsers.length === 0
            ? <div style={{ padding: 20, textAlign: "center", color: "#555" }}>No other users yet</div>
            : allUsers.map(u => (
              <div key={u.phone}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderRadius: 10, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#1a1a2e"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                onClick={() => onSelect(u)}>
                <Av size={36} photo={getUserPhoto(u.name)} name={u.name} />
                <div>
                  <div style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: "#666" }}>{u.phone}</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ── Create Group Modal ────────────────────────────────────────────────────────
export function CreateGroupModal({ allUsers, getUserPhoto, groupName, setGroupName, groupMembers, setGroupMembers, onCreate, onClose }) {
  const ov = { position: "fixed", inset: 0, background: "rgba(0,0,0,.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(6px)" };
  const canCreate = groupName.trim() && groupMembers.length >= 1;
  return (
    <div style={ov} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#14141F", border: "1px solid #222", borderRadius: 16, width: 380, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e1e2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, color: "#fff" }}>Create Group</span>
          <button style={iBtn} onClick={onClose}>{Ic.close}</button>
        </div>
        <div style={{ padding: 16 }}>
          <input placeholder="Group name" value={groupName} onChange={e => setGroupName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && canCreate && onCreate()}
            style={{ width: "100%", background: "#1a1a2e", border: "1px solid #2a2a3e", color: "#fff", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 14 }} />
          <p style={{ color: "#888", fontSize: 11, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 1 }}>Select Members</p>
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {allUsers.map(u => {
              const sel = groupMembers.includes(u.name);
              return (
                <div key={u.phone}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 8px", borderRadius: 10, cursor: "pointer", background: sel ? "rgba(0,229,255,.06)" : "transparent" }}
                  onMouseEnter={e => !sel && (e.currentTarget.style.background = "#1a1a2e")}
                  onMouseLeave={e => !sel && (e.currentTarget.style.background = "transparent")}
                  onClick={() => setGroupMembers(prev => sel ? prev.filter(x => x !== u.name) : [...prev, u.name])}>
                  <Av size={32} photo={getUserPhoto(u.name)} name={u.name} />
                  <span style={{ flex: 1, fontWeight: 600, color: "#fff", fontSize: 14 }}>{u.name}</span>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${sel ? "#00E5FF" : "#333"}`, background: sel ? "#00E5FF" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontSize: 11 }}>
                    {sel && Ic.check}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={onCreate} disabled={!canCreate}
            style={{ width: "100%", marginTop: 14, padding: "11px", background: canCreate ? "linear-gradient(135deg,#00E5FF,#00a8cc)" : "#1a1a2e", border: "none", color: canCreate ? "#000" : "#444", borderRadius: 8, cursor: canCreate ? "pointer" : "default", fontWeight: 700, fontSize: 14 }}>
            Create Group ({groupMembers.length + 1} members)
          </button>
        </div>
      </div>
    </div>
  );
}
