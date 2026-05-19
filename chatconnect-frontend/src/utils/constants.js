// Dynamically use the same host the browser connected to.
// Works on localhost AND on any LAN/network IP — no code change needed.
const HOST = window.location.hostname;
export const API = `http://${HOST}:8080`;

const SESSION_KEY = "chatconnect_session";

export const loadSession = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; }
  catch { return null; }
};

export const saveSession = (u) =>
  localStorage.setItem(SESSION_KEY, JSON.stringify(u));

export const clearSession = () =>
  localStorage.removeItem(SESSION_KEY);
