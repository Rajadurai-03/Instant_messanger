import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import LoginPage from "./pages/LoginPage";
import ChatPage  from "./pages/ChatPage";
import AdminPage from "./pages/AdminPage";
import { API, loadSession, saveSession, clearSession } from "./utils/constants";
import "./App.css";

export default function App() {
  const [session, setSession] = useState(null);
  const [stomp, setStomp]     = useState(null);
  const [connected, setConn]  = useState(false);

  // Restore session on mount
  useEffect(() => {
    const s = loadSession();
    if (s) setSession(s);
  }, []);

  // Start WebSocket when a normal user logs in
  useEffect(() => {
    if (!session || session.isAdmin) return;
    const socket = new SockJS(`${API}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect:    () => setConn(true),
      onDisconnect: () => setConn(false),
    });
    client.activate();
    setStomp(client);
    return () => { client.deactivate(); setStomp(null); setConn(false); };
  }, [session]);

  const handleLoginSuccess = (userData) => {
    saveSession(userData);
    setSession(userData);
  };

  const handleLogout = () => {
    clearSession();
    if (stomp) stomp.deactivate();
    setStomp(null); setConn(false); setSession(null);
  };

  if (!session)        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  if (session.isAdmin) return <AdminPage onLogout={handleLogout} />;
  return <ChatPage session={session} stompClient={stomp} connected={connected} onLogout={handleLogout} />;
}
