// components/WarmupAlert.tsx
"use client";

import { useWarmupAlertStore } from "../../contexts/warmupAlertStore";


export default function WarmupAlert() {
  const { visible, message } = useWarmupAlertStore();
  if (!visible) return null;
  return (
    <div style={{
      position: "fixed",
      top: 16,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 99999,
      background: "#144733",
      color: "white",
      padding: "12px 32px",
      borderRadius: 8,
      border: "2px solid white",
      boxShadow: "0 4px 16px #0003",
      fontFamily:"sans serif"
    }}>
      {message}
    </div>
  );
}
