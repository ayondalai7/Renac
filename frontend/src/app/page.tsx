"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth }       from "@/hooks/useAuth";
import { useTheme }      from "@/hooks/useTheme";
import { usePrediction } from "@/hooks/usePrediction";
import { checkHealth }   from "@/lib/api";
import { NavTab, ModelKey, PredictionResponse } from "@/types";

import LockScreen    from "@/components/auth/LockScreen";
import Navbar        from "@/components/layout/Navbar";
import NavPills      from "@/components/dashboard/NavPills";
import PredictTab    from "@/components/dashboard/PredictTab";
import ConfidenceTab from "@/components/dashboard/ConfidenceTab";
import FeaturesTab   from "@/components/dashboard/FeaturesTab";
import UploadTab     from "@/components/dashboard/UploadTab";

export default function Home() {
  const { authenticated, login } = useAuth();
  const { theme, toggle }        = useTheme();
  const { result, loading, error, runPrediction, runCSVPrediction, reset } = usePrediction();

  const [tab, setTab]             = useState<NavTab>("predict");
  const [serverReady, setServerReady] = useState(false);

  // Wake up server on mount after auth
  useEffect(() => {
    if (!authenticated) return;
    let tries = 0;
    const interval = setInterval(async () => {
      const ok = await checkHealth();
      if (ok) { setServerReady(true); clearInterval(interval); }
      if (++tries > 20) clearInterval(interval);
    }, 2500);
    checkHealth().then(ok => { if (ok) { setServerReady(true); clearInterval(interval); } });
    return () => clearInterval(interval);
  }, [authenticated]);

  // When result arrives, stay on predict tab (user can navigate)
  const disabledTabs: NavTab[] = result ? [] : ["confidence", "features"];

  if (authenticated === null) return null; // Hydration guard

  if (!authenticated) {
    return <LockScreen onSuccess={() => login("6969")} />;
  }

  function handleLogin(pw: string) { login(pw); }

  function handleTabChange(t: NavTab) {
    if (!result && (t === "confidence" || t === "features")) return;
    setTab(t);
  }

  function handleReset() {
    reset();
    setTab("predict");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar theme={theme} onToggleTheme={toggle} onReset={handleReset} hasResult={!!result} />

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(16px, 4vw, 32px) clamp(12px, 3vw, 24px)" }}>
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: "28px" }}
        >
          <h1 className="font-display" style={{ fontSize: "clamp(24px, 5vw, 36px)", color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Breast Cancer<br />
            <span style={{ color: "var(--accent)" }}>Classification</span>
          </h1>
          <p style={{ marginTop: "10px", fontSize: "14px", color: "var(--text-muted)", maxWidth: "480px" }}>
            ML-powered tumour analysis using the UCI Wisconsin dataset.
            Enter feature values manually or upload a CSV prescription file.
          </p>
        </motion.div>

        {/* Nav pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: "28px" }}
        >
          <NavPills active={tab} onChange={handleTabChange} disabled={disabledTabs} />
          {!result && (
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
              Run a prediction first to unlock Confidence and Features tabs.
            </p>
          )}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "predict" && (
              <PredictTab
                result={result}
                loading={loading}
                error={error}
                serverReady={serverReady}
                onResult={() => {}}
                onPredict={(features: number[], model: ModelKey) => {
                  runPrediction(features, model);
                }}
              />
            )}
            {tab === "confidence" && result && <ConfidenceTab result={result} />}
            {tab === "features"   && result && <FeaturesTab   result={result} />}
            {tab === "upload" && (
              <UploadTab
                loading={loading}
                error={error}
                onResult={() => {}}
                onUploadPredict={(file: File, model: ModelKey) => {
                  runCSVPrediction(file, model);
                  setTab("predict");
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
