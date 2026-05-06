"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props { onSuccess: () => void; }

export default function LockScreen({ onSuccess }: Props) {
  const [value, setValue]   = useState("");
  const [error, setError]   = useState(false);
  const [shake, setShake]   = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (value === "6969") {
        onSuccess();
      } else {
        setError(true);
        setShake(true);
        setValue("");
        setTimeout(() => setShake(false), 600);
      }
      setLoading(false);
    }, 400);
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
      padding: "24px",
    }}>
      {/* Subtle background texture */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle at 30% 20%, var(--accent-dim) 0%, transparent 60%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.02) 0%, transparent 50%)",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ width: "100%", maxWidth: "380px", position: "relative" }}
      >
        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="card"
          style={{ padding: "48px 40px", textAlign: "center" }}
        >
          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ marginBottom: "32px" }}
          >
            <div style={{
              width: 64, height: 64,
              borderRadius: "16px",
              background: "var(--accent-dim)",
              border: "1px solid var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 3C8 3 3 8 3 14s5 11 11 11 11-5 11-11S20 3 14 3z" stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
                <path d="M14 8v6l4 2" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="14" cy="14" r="2" fill="var(--accent)" opacity="0.4"/>
              </svg>
            </div>
            <h1 className="font-display" style={{ fontSize: "32px", color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1 }}>
              Recnac
            </h1>
            <p style={{ marginTop: "8px", fontSize: "13px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Breast Cancer Classification
            </p>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Enter access password to continue
              </p>
              <input
                type="password"
                value={value}
                onChange={e => { setValue(e.target.value); setError(false); }}
                placeholder="••••••••"
                autoFocus
                style={{
                  textAlign: "center",
                  fontSize: "22px",
                  letterSpacing: "0.3em",
                  marginBottom: "16px",
                  borderColor: error ? "var(--accent)" : undefined,
                }}
              />
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ fontSize: "12px", color: "var(--malignant)", marginBottom: "12px" }}
                  >
                    Incorrect password. Try again.
                  </motion.p>
                )}
              </AnimatePresence>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !value}
                style={{ width: "100%" }}
              >
                {loading ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                    <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : "Unlock"}
              </button>
            </motion.div>
          </form>
        </motion.div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "11px", color: "var(--text-muted)" }}>
          Research tool only · Not for clinical use
        </p>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
