import React, { useRef, useState } from "react";
import { Av, ConfirmDialog, iBtn } from "../shared/SharedComponents";
import { Ic } from "../../utils/icons";

export default function ChatWindow({
  myName, active, messages, setMessages,
  input, setInput, sendMsg, typingInfo,
  groups, getUserPhoto, showToast,
  stompClient, connected,
  onRenameGroup, onDeleteGroup, onBack,
}) {
  const [viewOtherPhoto, setViewOtherPhoto] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [renameId, setRenameId]   = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const endRef = useRef();

  const ov = { position: "fixed", inset: 0, background: "rgba(0,0,0,.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(6px)" };

  const activeGroup   = active?.type === "group" ? groups.find(g => g.id === active.id) : null;
  const receiverPhoto = active?.type === "dm" ? getUserPhoto(active.id) : null;

  const typingLabel = () => {
    const who = Object.keys(typingInfo).filter(k => typingInfo[k]);
    if (!who.length) return null;
    return active?.type === "group" ? `${who.join(", ")} typing...` : "typing...";
  };
  const tl = typingLabel();

  // ── Rename group ───────────────────────────────────────────────────────────
  const submitRename = () => {
    if (renameVal.trim()) { onRenameGroup(renameId, renameVal.trim()); }
    setRenameId(null); setRenameVal("");
  };

  if (!active) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#333", background: "#0F0F14" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: "#444" }}>Select a chat to start messaging</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0F0F14" }}>

      {/* Header */}
      <div style={{ padding: "12px 16px", background: "#14141F", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", gap: 10 }}>
        {/* Back button on mobile */}
        {onBack && (
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#00E5FF", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px 6px 4px 0", flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        )}
        {active.type === "dm"
          ? <div style={{ cursor: receiverPhoto ? "pointer" : "default" }} onClick={() => receiverPhoto && setViewOtherPhoto(receiverPhoto)}>
              <Av size={40} photo={receiverPhoto} name={active.name} />
            </div>
          : <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1a1a2e", border: "2px solid #00E5FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#00E5FF" }}>
              {active.name.charAt(0).toUpperCase()}
            </div>
        }
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>{active.name}</span>
            {active.type === "group" && (
              renameId === active.id ? (
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <input value={renameVal} onChange={e => setRenameVal(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && submitRename()}
                    style={{ background: "#1a1a2e", border: "1px solid #2a2a3e", color: "#fff", borderRadius: 6, padding: "3px 8px", fontSize: 13, outline: "none" }} autoFocus />
                  <button onClick={submitRename} style={{ ...iBtn, color: "#00E5FF" }}>{Ic.check}</button>
                  <button onClick={() => setRenameId(null)} style={iBtn}>{Ic.close}</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 2 }}>
                  <button style={{ ...iBtn, padding: 3 }} title="Rename" onClick={() => { setRenameId(active.id); setRenameVal(active.name); }}>{Ic.edit}</button>
                  {activeGroup?.createdBy === myName && (
                    <button style={{ ...iBtn, padding: 3 }} title="Delete group" onClick={() => onDeleteGroup(active.id, active.name)}>{Ic.trashRed}</button>
                  )}
                </div>
              )
            )}
          </div>
          <div style={{ fontSize: 12, marginTop: 1 }}>
            {tl
              ? <span style={{ color: "#00E5FF", fontStyle: "italic" }}>{active.type === "group" ? tl : `${active.name} is typing...`}</span>
              : active.type === "dm"
                ? <span style={{ color: "#00C853" }}>Online</span>
                : <span style={{ color: "#555" }}>{activeGroup?.members || ""}</span>
            }
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
        {messages.map(msg => {
          const isMine = msg.sender === myName;
          const isTemp = msg.id > 1e12; // optimistic — not yet confirmed from DB
          return (
            <div key={msg.id}
              style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
              {!isMine && active.type === "group" && (
                <div style={{ marginRight: 6, marginTop: "auto" }}>
                  <Av size={26} photo={getUserPhoto(msg.sender)} name={msg.sender} color="#555" />
                </div>
              )}
              <div style={{ maxWidth: "65%", display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                {!isMine && active.type === "group" && (
                  <span style={{ fontSize: 11, color: "#00E5FF", marginBottom: 2, paddingLeft: 2 }}>{msg.sender}</span>
                )}
                <div style={{
                  padding: "8px 12px",
                  borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: isMine ? "linear-gradient(135deg,#00457a,#003366)" : "#1e1e2e",
                  border: `1px solid ${isMine ? "rgba(0,229,255,0.15)" : "#2a2a3e"}`,
                  fontSize: 14, color: "#fff", wordBreak: "break-word",
                  opacity: isTemp ? 0.7 : 1,
                }}>
                  {msg.content}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                  <span style={{ fontSize: 10, color: "#555" }}>{msg.time}</span>
                  {isMine && !isTemp && (msg.read ? Ic.tickR : Ic.tick)}
                  {isMine && isTemp && <span style={{ fontSize: 9, color: "#555" }}>sending...</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <div style={{ padding: "12px 16px", background: "#14141F", borderTop: "1px solid #1e1e2e", display: "flex", alignItems: "center", gap: 10 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMsg())}
          placeholder={`Message ${active.name}...`}
          style={{ flex: 1, background: "#1a1a2e", border: "1px solid #2a2a3e", color: "#fff", borderRadius: 24, padding: "10px 16px", fontSize: 14, outline: "none" }}
        />
        <button onClick={sendMsg} disabled={!input.trim()}
          style={{ width: 42, height: 42, borderRadius: "50%", background: input.trim() ? "linear-gradient(135deg,#00E5FF,#00a8cc)" : "#1a1a2e", border: "none", color: input.trim() ? "#000" : "#444", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
          {Ic.send}
        </button>
      </div>

      {/* View receiver photo */}
      {viewOtherPhoto && (
        <div style={ov} onClick={() => setViewOtherPhoto(null)}>
          <div style={{ position: "relative", maxWidth: 320 }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewOtherPhoto(null)} style={{ position: "absolute", top: -14, right: -14, width: 30, height: 30, borderRadius: "50%", background: "#14141F", border: "1px solid #2a2a3e", color: "#aaa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.close}</button>
            <img src={viewOtherPhoto} alt="" style={{ width: "100%", borderRadius: "50%", display: "block", boxShadow: "0 0 0 4px #00E5FF44" }} />
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      {confirm && <ConfirmDialog msg={confirm.msg} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
    </div>
  );
}
