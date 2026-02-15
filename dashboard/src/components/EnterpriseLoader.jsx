import { useEffect, useState } from "react";

export default function EnterpriseLoader({ text = "Loading..." }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;

    if (progress < 90) {
      interval = setInterval(() => {
        setProgress(prev => prev + Math.random() * 8);
      }, 300);
    }

    return () => clearInterval(interval);
  }, [progress]);

  useEffect(() => {
    if (progress >= 90 && progress < 100) {
      const timeout = setTimeout(() => {
        setProgress(100);
      }, 800);

      return () => clearTimeout(timeout);
    }
  }, [progress]);

  return (
    <div style={wrapper}>
      <h2 style={{ marginBottom: 25 }}>{text}</h2>

      <div style={barContainer}>
        <div
          style={{
            ...barFill,
            width: `${progress}%`,
          }}
        />
      </div>

      <div style={percentage}>{Math.floor(progress)}%</div>
    </div>
  );
}

/* ================= STYLES ================= */

const wrapper = {
  width: "100%",
  maxWidth: 500,
  margin: "100px auto",
  textAlign: "center",
  color: "#fff",
};

const barContainer = {
  width: "100%",
  height: 12,
  background: "rgba(255,255,255,0.1)",
  borderRadius: 10,
  overflow: "hidden",
  boxShadow: "0 0 10px rgba(0,0,0,0.4)",
};

const barFill = {
  height: "100%",
  background: "linear-gradient(90deg, #1677ff, #00ff9d)",
  transition: "width 0.4s ease",
};

const percentage = {
  marginTop: 12,
  fontSize: 16,
  fontWeight: 600,
};
