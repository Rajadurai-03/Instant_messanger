import React, { useState } from "react";
import { API } from "../utils/constants";
import "../App.css";

export default function LoginPage({ onLoginSuccess }) {
  const [isSignup, setIsSignup]     = useState(false);
  const [isForgot, setIsForgot]     = useState(false);
  const [isReset, setIsReset]       = useState(false);
  const [errorMsg, setErrorMsg]     = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading]       = useState(false);

  const [name, setName]             = useState("");
  const [phone, setPhone]           = useState("");
  const [password, setPassword]     = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPw, setConfirmPw]   = useState("");

  // Tracks phone across forgot→reset flow
  const [resetPhone, setResetPhone] = useState("");

  const clearAll = () => {
    setName(""); setPhone(""); setPassword("");
    setNewPassword(""); setConfirmPw("");
    setErrorMsg(""); setSuccessMsg("");
  };

  // ── Login / Signup ──────────────────────────────────────────────────────────
  const handleAuth = async e => {
    e.preventDefault(); setErrorMsg(""); setSuccessMsg("");
    if (isSignup) {
      if (!name.trim())        return setErrorMsg("Please enter your name");
      if (phone.length !== 10) return setErrorMsg("Phone number must be exactly 10 digits");
      if (password.length < 8) return setErrorMsg("Password must be at least 8 characters");
    }
    setLoading(true);
    try {
      const ep = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const bd = isSignup ? { name, phone, password } : { phone, password };
      const res = await fetch(`${API}${ep}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bd),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || "Something went wrong."); }
      else { onLoginSuccess({ name: data.name, phone: data.phone, isAdmin: data.isAdmin || false }); }
    } catch { setErrorMsg("Cannot reach server. Make sure the backend is running."); }
    finally { setLoading(false); }
  };

  // ── Forgot Password ─────────────────────────────────────────────────────────
  const handleForgot = async e => {
    e.preventDefault(); setErrorMsg(""); setSuccessMsg("");
    if (phone.length !== 10) return setErrorMsg("Enter a valid 10-digit phone number");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) return setErrorMsg(data.error || "Failed.");
      setResetPhone(phone);
      setSuccessMsg("Request sent! Waiting for admin approval...");
      // Poll every 3s for admin approval
      const iv = setInterval(async () => {
        try {
          const r = await fetch(`${API}/api/auth/check-approval/${phone}`);
          if (r.ok) {
            const d = await r.json();
            if (d.approved) {
              clearInterval(iv);
              setIsForgot(false);
              setIsReset(true);
              setSuccessMsg(""); setErrorMsg("");
              setPhone(""); setPassword("");
            }
          }
        } catch {}
      }, 3000);
      setTimeout(() => clearInterval(iv), 600000);
    } catch { setErrorMsg("Cannot reach server."); }
    finally { setLoading(false); }
  };

  // ── Reset Password ──────────────────────────────────────────────────────────
  const handleReset = async e => {
    e.preventDefault(); setErrorMsg("");
    if (!newPassword || newPassword.length < 8) return setErrorMsg("Password must be at least 8 characters");
    if (newPassword !== confirmPw) return setErrorMsg("Passwords do not match");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: resetPhone, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return setErrorMsg(data.error || "Reset failed.");
      setIsReset(false);
      clearAll();
      setSuccessMsg("Password reset! Please log in.");
    } catch { setErrorMsg("Cannot reach server."); }
    finally { setLoading(false); }
  };

  const subtitle = isForgot ? "Reset your password"
    : isReset  ? "Set new password"
    : isSignup ? "Create your account"
    : "Good to have you back";

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-header">
          <h1 className="logo-text">ZYNC</h1>
          <p className="subtitle-text">{subtitle}</p>
        </div>

        {/* ── Forgot form ── */}
        {isForgot && (
          <form className="form-container" onSubmit={handleForgot}>
            <div className="input-wrapper">
              <label>Mobile Number</label>
              <input type="number" placeholder="Enter your registered number"
                value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <button type="submit" disabled={loading}
                style={{ background: "linear-gradient(135deg,#00E5FF,#00A6CC)", color: "#000", border: "none", borderRadius: 8, padding: "10px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Sending..." : "Request Reset"}
              </button>
            </div>
            {errorMsg && <div className="error-message">{errorMsg}</div>}
            {successMsg && <InfoBox msg={successMsg} />}
            <div className="toggle-container">
              <p className="toggle-text">
                <span className="toggle-highlight" onClick={() => { setIsForgot(false); clearAll(); }}>← Back to Login</span>
              </p>
            </div>
          </form>
        )}

        {/* ── Reset form ── */}
        {isReset && (
          <form className="form-container" onSubmit={handleReset}>
            <div className="input-wrapper">
              <label>New Password</label>
              <input type="password" placeholder="At least 8 characters"
                value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div className="input-wrapper">
              <label>Confirm Password</label>
              <input type="password" placeholder="Repeat new password"
                value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
            </div>
            <button type="submit" className="action-button" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            {errorMsg && <div className="error-message">{errorMsg}</div>}
          </form>
        )}

        {/* ── Login / Signup form ── */}
        {!isForgot && !isReset && (
          <form className="form-container" onSubmit={handleAuth}>
            {isSignup && (
              <div className="input-wrapper">
                <label>Full Name</label>
                <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div className="input-wrapper">
              <label>Mobile Number</label>
              <input type="number" placeholder="Enter your mobile number"
                value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="input-wrapper">
              <label>Password</label>
              <input type="password" placeholder="Enter your Password"
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="action-button" disabled={loading}>
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
            </button>
            {errorMsg && <div className="error-message">{errorMsg}</div>}
            {successMsg && <InfoBox msg={successMsg} />}
            {!isSignup && (
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <span className="toggle-highlight" style={{ fontSize: 13 }}
                  onClick={() => { setIsForgot(true); clearAll(); }}>
                  Forgot password?
                </span>
              </div>
            )}
            <div className="toggle-container">
              <p className="toggle-text">
                {isSignup ? "Already have an account? " : "Don't have an account? "}
                <span className="toggle-highlight"
                  onClick={() => { setIsSignup(v => !v); clearAll(); }}>
                  {isSignup ? "Log In" : "Sign Up"}
                </span>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function InfoBox({ msg }) {
  return (
    <div style={{ color: "#00E5FF", background: "rgba(0,229,255,0.08)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(0,229,255,0.2)", textAlign: "center", marginTop: 15, fontSize: 13, fontWeight: 600 }}>
      {msg}
    </div>
  );
}
