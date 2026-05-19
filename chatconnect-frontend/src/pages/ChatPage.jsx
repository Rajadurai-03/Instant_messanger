import React, { useState, useEffect, useRef, useCallback } from "react";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow  from "../components/chat/ChatWindow";
import { AddUserModal, CreateGroupModal } from "../components/chat/GroupModals";
import { Toast, ConfirmDialog } from "../components/shared/SharedComponents";
import { API } from "../utils/constants";
import { useIsMobile } from "../utils/useIsMobile";

export default function ChatPage({ session, stompClient, connected, onLogout }) {
  const { name: myName } = session;

  // ── Data ───────────────────────────────────────────────────────────────────
  const [allUsers, setAllUsers] = useState([]);  // all DB users except me
  const [contacts, setContacts] = useState(() => { // DM contacts — persisted
    try { return JSON.parse(localStorage.getItem(`contacts_${myName}`) || "[]"); } catch { return []; }
  });
  const [groups, setGroups]     = useState([]);
  const [myPhoto, setMyPhoto]   = useState(null);

  // ── Chat state ─────────────────────────────────────────────────────────────
  const [active, setActive]         = useState(null); // { type:'dm'|'group', id, name }
  const activeRef = useRef(null);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [typingInfo, setTypingInfo] = useState({});
  const typingTimer = useRef(null);

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [showAddUser, setShowAddUser]       = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName]           = useState("");
  const [groupMembers, setGroupMembers]     = useState([]);
  const [toast, setToast]                   = useState(null);
  const [confirm, setConfirm]               = useState(null);

  const isMobile = useIsMobile();
  // On mobile: show sidebar OR chat, not both. showSidebar=true = show sidebar panel.
  const [showSidebar, setShowSidebar] = useState(true);

  const showToast = useCallback((msg, type = "info") => setToast({ msg, type }), []);

  // Keep activeRef current
  useEffect(() => { activeRef.current = active; }, [active]);

  // Persist contacts
  useEffect(() => {
    localStorage.setItem(`contacts_${myName}`, JSON.stringify(contacts));
  }, [contacts, myName]);

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchAllUsers = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/admin/users`);
      if (r.ok) {
        const all = await r.json();
        setAllUsers(all.filter(u => u.name !== myName));
        // Update myPhoto from DB
        const me = all.find(u => u.name === myName);
        if (me?.photo) setMyPhoto(me.photo);
      }
    } catch {}
  }, [myName]);

  const fetchGroups = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/groups/user/${encodeURIComponent(myName)}`);
      if (r.ok) setGroups(await r.json());
    } catch {}
  }, [myName]);

  const fetchContacts = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/messages/contacts/${encodeURIComponent(myName)}`);
      if (r.ok) {
        const msgs = await r.json();
        const seen = new Set();
        msgs.forEach(m => { const o = m.sender === myName ? m.receiver : m.sender; if (o) seen.add(o); });
        setContacts(prev => {
          const merged = [...new Set([...prev, ...seen])];
          return merged;
        });
      }
    } catch {}
  }, [myName]);

  const fetchMessages = useCallback(async (act) => {
    if (!act) return;
    try {
      const url = act.type === "dm"
        ? `${API}/api/messages/conversation?a=${encodeURIComponent(myName)}&b=${encodeURIComponent(act.id)}`
        : `${API}/api/messages/group/${act.id}`;
      const r = await fetch(url);
      if (r.ok) setMessages(await r.json());
    } catch {}
  }, [myName]);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAllUsers();
    fetchGroups();
    fetchContacts();
  }, [fetchAllUsers, fetchGroups, fetchContacts]);

  // ── Refetch on active chat change ──────────────────────────────────────────
  // Mobile: when active chat changes, switch to chat view
  const activeId   = active?.id;
  const activeType = active?.type;
  useEffect(() => {
    setMessages([]);
    if (activeId && activeType) fetchMessages({ id: activeId, type: activeType });
    setTypingInfo({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, activeType]);

  useEffect(() => {
    // Refresh allUsers periodically so photos stay up to date
    const id = setInterval(fetchAllUsers, 10000);
    return () => clearInterval(id);
  }, [fetchAllUsers]);

  // ── WebSocket subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    if (!stompClient || !connected) return;
    const subs = [];

    // Messages
    subs.push(stompClient.subscribe("/topic/messages", frame => {
      const msg = JSON.parse(frame.body);
      const act = activeRef.current;

      const isForActiveChat = act && (
        msg.groupId
          ? act.type === "group" && act.id === msg.groupId
          : act.type === "dm" && (
              (msg.sender === myName && msg.receiver === act.id) ||
              (msg.sender === act.id && msg.receiver === myName)
            )
      );

      if (isForActiveChat) {
        setMessages(prev => {
          // Replace optimistic temp entry
          const tempIdx = prev.findIndex(m =>
            m.id > 1e12 &&
            m.sender === msg.sender &&
            m.content === msg.content &&
            m.time === msg.time
          );
          if (tempIdx >= 0) {
            const next = [...prev]; next[tempIdx] = msg; return next;
          }
          if (msg.id && prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }

      // Update sidebar for DMs
      if (!msg.groupId) {
        const other = msg.sender === myName ? msg.receiver : msg.sender;
        if (other) setContacts(prev => prev.includes(other) ? prev : [other, ...prev]);
      }
    }));

    // Typing
    subs.push(stompClient.subscribe("/topic/typing", frame => {
      const data = JSON.parse(frame.body);
      if (data.sender === myName) return;
      const act = activeRef.current;
      const relevant = act && (
        data.groupId ? act.id === data.groupId
                     : act.type === "dm" && data.sender === act.id
      );
      if (relevant) setTypingInfo(prev => ({ ...prev, [data.sender]: data.typing === "true" }));
    }));

    // Delete
    subs.push(stompClient.subscribe("/topic/deleted", frame => {
      const { id } = JSON.parse(frame.body);
      setMessages(prev => prev.filter(m => m.id !== Number(id)));
    }));

    // Read receipts
    subs.push(stompClient.subscribe("/topic/read", frame => {
      const { from, to } = JSON.parse(frame.body);
      if (to === myName) {
        setMessages(prev => prev.map(m =>
          m.sender === myName && m.receiver === from ? { ...m, read: true } : m
        ));
      }
    }));

    // Group updates
    subs.push(stompClient.subscribe("/topic/groupUpdate", frame => {
      const data = JSON.parse(frame.body);
      if (data.action === "created" || data.action === "renamed") {
        const g = data.group;
        if (g.members.split(",").includes(myName)) {
          setGroups(prev => {
            const idx = prev.findIndex(x => x.id === g.id);
            if (idx >= 0) { const n = [...prev]; n[idx] = g; return n; }
            return [...prev, g];
          });
          if (data.action === "renamed" && activeRef.current?.id === g.id)
            setActive(a => ({ ...a, name: g.name }));
        }
      } else if (data.action === "deleted") {
        setGroups(prev => prev.filter(g => g.id !== data.groupId));
        if (activeRef.current?.id === data.groupId) setActive(null);
      }
    }));

    return () => subs.forEach(s => { try { s.unsubscribe(); } catch {} });
  }, [stompClient, connected, myName]);

  // Mark messages read
  useEffect(() => {
    if (!active || active.type !== "dm") return;
    fetch(`${API}/api/messages/read`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: active.id, to: myName }),
    }).catch(() => {});
  }, [active, myName]);

  // ── Typing ─────────────────────────────────────────────────────────────────
  const sendTyping = useCallback((typing) => {
    if (!stompClient || !connected || !active) return;
    stompClient.publish({
      destination: "/app/typing",
      body: JSON.stringify({ sender: myName, receiver: active.type === "dm" ? active.id : null, groupId: active.type === "group" ? active.id : null, typing: String(typing) }),
      headers: { "content-type": "text/plain" },
    });
  }, [stompClient, connected, active, myName]);

  const handleInput = (val) => {
    setInput(val);
    sendTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => sendTyping(false), 1500);
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMsg = useCallback(() => {
    if (!input.trim() || !active || !stompClient || !connected) return;
    const text = input.trim();
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const msg = {
      sender:   myName,
      receiver: active.type === "dm" ? active.id : null,
      groupId:  active.type === "group" ? active.id : null,
      content:  text,
      time:     now,
    };
    setInput("");
    sendTyping(false);
    // Optimistic
    setMessages(prev => [...prev, { ...msg, id: Date.now(), read: false }]);
    stompClient.publish({
      destination: "/app/sendMessage",
      body: JSON.stringify(msg),
      headers: { "content-type": "text/plain" },
    });
    if (active.type === "dm") setContacts(prev => prev.includes(active.id) ? prev : [active.id, ...prev]);
  }, [input, active, stompClient, connected, myName, sendTyping]);

  // ── Group actions ──────────────────────────────────────────────────────────
  const createGroup = async () => {
    if (!groupName.trim() || groupMembers.length < 1) return;
    try {
      const r = await fetch(`${API}/api/groups`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName, createdBy: myName, members: [myName, ...groupMembers] }),
      });
      if (r.ok) {
        const g = await r.json();
        setGroups(prev => [...prev, g]);
        setActive({ type: "group", id: g.id, name: g.name });
        setShowGroupModal(false); setGroupName(""); setGroupMembers([]);
      }
    } catch { showToast("Failed to create group", "error"); }
  };

  const renameGroup = async (id, newName) => {
    try {
      await fetch(`${API}/api/groups/${id}/name`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
    } catch { showToast("Failed to rename", "error"); }
  };

  const deleteGroup = (groupId, groupName) => {
    setConfirm({ msg: `Delete group "${groupName}"? This cannot be undone.`, onConfirm: async () => {
      setConfirm(null);
      try {
        await fetch(`${API}/api/groups/${groupId}`, { method: "DELETE" });
        setGroups(prev => prev.filter(g => g.id !== groupId));
        if (active?.id === groupId) setActive(null);
      } catch { showToast("Failed to delete group", "error"); }
    }});
  };

  // ── getUserPhoto from allUsers (DB-loaded) ─────────────────────────────────
  const getUserPhoto = useCallback((name) => {
    const u = allUsers.find(x => x.name === name);
    return u?.photo || null;
  }, [allUsers]);

  // ── Build contact objects with photos ──────────────────────────────────────
  const contactObjects = contacts.map(name => ({ name, photo: getUserPhoto(name) }));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", height: "100vh", background: "#0F0F14", fontFamily: "'Segoe UI', sans-serif", overflow: "hidden" }}>

      {(!isMobile || showSidebar) && <ChatSidebar
        myName={myName} myPhoto={myPhoto} setMyPhoto={setMyPhoto}
        connected={connected}
        contacts={contactObjects} groups={groups}
        active={active} setActive={(a) => { setActive(a); if (isMobile) setShowSidebar(false); }}
        setTypingInfo={setTypingInfo}
        allUsers={allUsers}
        onAddUser={() => setShowAddUser(true)}
        onCreateGroup={() => setShowGroupModal(true)}
        onLogout={onLogout}
        showToast={showToast}
      />}

      {(!isMobile || !showSidebar) && <ChatWindow
        myName={myName} active={active}
        onBack={isMobile ? () => setShowSidebar(true) : null}
        messages={messages} setMessages={setMessages}
        input={input} setInput={val => handleInput(val)}
        sendMsg={sendMsg} typingInfo={typingInfo}
        groups={groups} getUserPhoto={getUserPhoto}
        showToast={showToast}
        stompClient={stompClient} connected={connected}
        onRenameGroup={renameGroup}
        onDeleteGroup={deleteGroup}
      />}

      {showAddUser && (
        <AddUserModal
          allUsers={allUsers} getUserPhoto={getUserPhoto}
          onSelect={u => {
            setActive({ type: "dm", id: u.name, name: u.name });
            setContacts(prev => prev.includes(u.name) ? prev : [u.name, ...prev]);
            setShowAddUser(false);
          }}
          onClose={() => setShowAddUser(false)}
        />
      )}

      {showGroupModal && (
        <CreateGroupModal
          allUsers={allUsers} getUserPhoto={getUserPhoto}
          groupName={groupName} setGroupName={setGroupName}
          groupMembers={groupMembers} setGroupMembers={setGroupMembers}
          onCreate={createGroup} onClose={() => setShowGroupModal(false)}
        />
      )}

      {confirm && <ConfirmDialog msg={confirm.msg} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
